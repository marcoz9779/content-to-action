import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getEnv } from "@/lib/security/env";
import type { ApiError } from "@/types";

interface SpoonacularRecipe {
  id: number;
  title: string;
  image: string;
  imageType: string;
  usedIngredientCount: number;
  missedIngredientCount: number;
  missedIngredients: Array<{
    name: string;
    amount: number;
    unit: string;
    original: string;
  }>;
  usedIngredients: Array<{
    name: string;
    amount: number;
    unit: string;
    original: string;
  }>;
  likes: number;
}

interface RecipeSuggestion {
  id: number;
  title: string;
  image: string;
  usedCount: number;
  missedCount: number;
  totalCount: number;
  matchPercent: number;
  missingIngredients: string[];
  usedIngredients: string[];
  source: "spoonacular";
}

const LANG_MAP: Record<string, string> = {
  de: "German",
  en: "English",
  fr: "French",
  it: "Italian",
};

async function translateRecipes(
  recipes: RecipeSuggestion[],
  targetLang: string
): Promise<RecipeSuggestion[]> {
  if (targetLang === "en" || recipes.length === 0) return recipes;

  try {
    const env = getEnv();
    const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

    const toTranslate = recipes.map((r) => ({
      id: r.id,
      title: r.title,
      missing: r.missingIngredients,
      used: r.usedIngredients,
    }));

    const response = await client.chat.completions.create({
      model: env.OPENAI_MODEL_CLASSIFY,
      messages: [
        {
          role: "user",
          content: `Translate these recipe titles and ingredient names to ${LANG_MAP[targetLang] ?? "German"}. Return ONLY valid JSON array, same structure. Keep the id field unchanged.

${JSON.stringify(toTranslate)}`,
        },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return recipes;

    const parsed = JSON.parse(content) as { recipes?: Array<{ id: number; title: string; missing: string[]; used: string[] }> } | Array<{ id: number; title: string; missing: string[]; used: string[] }>;
    const translated = Array.isArray(parsed) ? parsed : (parsed.recipes ?? []);

    return recipes.map((recipe) => {
      const t = translated.find((tr) => tr.id === recipe.id);
      if (!t) return recipe;
      return {
        ...recipe,
        title: t.title ?? recipe.title,
        missingIngredients: t.missing ?? recipe.missingIngredients,
        usedIngredients: t.used ?? recipe.usedIngredients,
      };
    });
  } catch (error) {
    console.error("Translation failed:", error);
    return recipes;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ingredients = searchParams.get("ingredients");
    const count = Math.min(parseInt(searchParams.get("count") ?? "12"), 20);
    const lang = searchParams.get("lang") ?? "de";

    if (!ingredients) {
      return NextResponse.json<ApiError>({ error: "Missing ingredients parameter." }, { status: 400 });
    }

    const apiKey = process.env.SPOONACULAR_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ recipes: [], source: "none", message: "Spoonacular API key not configured." });
    }

    const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredients)}&number=${count}&ranking=2&ignorePantry=true&apiKey=${apiKey}`;

    const response = await fetch(url, { next: { revalidate: 3600 } });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Spoonacular API error:", response.status, errorText);

      if (response.status === 402) {
        return NextResponse.json({ recipes: [], source: "spoonacular", message: "API limit reached." });
      }

      return NextResponse.json<ApiError>({ error: "Recipe search failed." }, { status: 500 });
    }

    const data = (await response.json()) as SpoonacularRecipe[];

    let recipes: RecipeSuggestion[] = data.map((r) => {
      const totalCount = r.usedIngredientCount + r.missedIngredientCount;
      return {
        id: r.id,
        title: r.title,
        image: r.image,
        usedCount: r.usedIngredientCount,
        missedCount: r.missedIngredientCount,
        totalCount,
        matchPercent: totalCount > 0 ? Math.round((r.usedIngredientCount / totalCount) * 100) : 0,
        missingIngredients: r.missedIngredients.map((i) => i.name),
        usedIngredients: r.usedIngredients.map((i) => i.name),
        source: "spoonacular",
      };
    });

    recipes.sort((a, b) => b.matchPercent - a.matchPercent || a.missedCount - b.missedCount);

    // Translate to target language
    recipes = await translateRecipes(recipes, lang);

    return NextResponse.json({ recipes, source: "spoonacular" });
  } catch (error) {
    console.error("Recipe suggestion error:", error);
    return NextResponse.json<ApiError>({ error: "Recipe search failed." }, { status: 500 });
  }
}
