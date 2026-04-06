import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getEnv } from "@/lib/security/env";
import { createServiceClient } from "@/lib/supabase/server";
import type { ApiError } from "@/types";
import { z } from "zod";

const nutritionRequestSchema = z.object({
  resultId: z.string().uuid(),
});

const nutritionResponseSchema = z.object({
  caloriesPerServing: z.number().nullable(),
  proteinGrams: z.number().nullable(),
  carbsGrams: z.number().nullable(),
  fatGrams: z.number().nullable(),
  fiberGrams: z.number().nullable(),
  servings: z.string().nullable(),
  notes: z.string().nullable(),
});

interface ResultRow {
  id: string;
  content_type: string;
  structured_output: unknown;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;
    const parsed = nutritionRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiError>({ error: "Invalid request." }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Check if we already have nutrition info
    const { data: existing } = await supabase
      .from("nutrition_info")
      .select("*")
      .eq("result_id", parsed.data.resultId)
      .single();

    if (existing) {
      return NextResponse.json({ nutrition: existing });
    }

    // Fetch result
    const { data: result, error } = await supabase
      .from("analysis_results")
      .select("id, content_type, structured_output")
      .eq("id", parsed.data.resultId)
      .single<ResultRow>();

    if (error || !result || result.content_type !== "recipe") {
      return NextResponse.json<ApiError>({ error: "Recipe result not found." }, { status: 404 });
    }

    const env = getEnv();
    const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

    const response = await client.chat.completions.create({
      model: env.OPENAI_MODEL_CLASSIFY,
      messages: [
        {
          role: "user",
          content: `Estimate the nutritional information for this recipe. Be reasonable and conservative — if you're unsure, use null. Return JSON only.

Recipe:
${JSON.stringify(result.structured_output, null, 2)}

Respond with:
{
  "caloriesPerServing": number or null,
  "proteinGrams": number or null,
  "carbsGrams": number or null,
  "fatGrams": number or null,
  "fiberGrams": number or null,
  "servings": "string or null",
  "notes": "string or null (any important caveats about the estimate)"
}`,
        },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json<ApiError>({ error: "AI returned empty response." }, { status: 500 });
    }

    const nutritionData = JSON.parse(content) as unknown;
    const validated = nutritionResponseSchema.safeParse(nutritionData);

    if (!validated.success) {
      return NextResponse.json<ApiError>({ error: "Nutrition estimation failed." }, { status: 500 });
    }

    // Store in DB
    const { data: stored } = await supabase
      .from("nutrition_info")
      .insert({
        result_id: parsed.data.resultId,
        calories_per_serving: validated.data.caloriesPerServing,
        protein_grams: validated.data.proteinGrams,
        carbs_grams: validated.data.carbsGrams,
        fat_grams: validated.data.fatGrams,
        fiber_grams: validated.data.fiberGrams,
        servings: validated.data.servings,
        notes: validated.data.notes,
      })
      .select("*")
      .single();

    return NextResponse.json({ nutrition: stored ?? validated.data });
  } catch (error) {
    console.error("Nutrition error:", error);
    return NextResponse.json<ApiError>({ error: "Nutrition estimation failed." }, { status: 500 });
  }
}
