import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getEnv } from "@/lib/security/env";
import { createServiceClient } from "@/lib/supabase/server";
import { structuredOutputSchema } from "@/lib/ai/schemas";
import type { ApiError } from "@/types";
import { z } from "zod";

const modifySchema = z.object({
  resultId: z.string().uuid(),
  modification: z.string().min(1).max(500),
});

interface ResultRow {
  id: string;
  content_type: string;
  title: string;
  summary: string;
  structured_output: unknown;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;
    const parsed = modifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiError>({ error: "Invalid request." }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data: result, error } = await supabase
      .from("analysis_results")
      .select("id, content_type, title, summary, structured_output")
      .eq("id", parsed.data.resultId)
      .single<ResultRow>();

    if (error || !result) {
      return NextResponse.json<ApiError>({ error: "Result not found." }, { status: 404 });
    }

    const env = getEnv();
    const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

    const response = await client.chat.completions.create({
      model: env.OPENAI_MODEL_EXTRACT,
      messages: [
        {
          role: "system",
          content: `You are modifying an existing analysis result. The user wants to apply a modification to the following ${result.content_type} result.

Apply the modification while keeping the same JSON structure exactly. Return ONLY the modified JSON with the same contentType and all required fields. Respond in the same language as the original content.

Original result:
${JSON.stringify(result.structured_output, null, 2)}`,
        },
        {
          role: "user",
          content: `Modification: ${parsed.data.modification}`,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json<ApiError>({ error: "AI returned empty response." }, { status: 500 });
    }

    const modified = JSON.parse(content) as unknown;
    const validated = structuredOutputSchema.safeParse(modified);

    if (!validated.success) {
      return NextResponse.json<ApiError>({ error: "Modified result failed validation." }, { status: 500 });
    }

    return NextResponse.json({
      modifiedOutput: validated.data,
      title: validated.data.title,
      summary: validated.data.summary,
    });
  } catch (error) {
    console.error("Modify error:", error);
    return NextResponse.json<ApiError>({ error: "Modification failed." }, { status: 500 });
  }
}
