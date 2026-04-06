import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getEnv } from "@/lib/security/env";
import type { ApiError } from "@/types";

interface SpoonacularDetail {
  id: number;
  title: string;
  image: string;
  servings: number;
  readyInMinutes: number;
  preparationMinutes: number;
  cookingMinutes: number;
  sourceName: string;
  sourceUrl: string;
  summary: string;
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
  instructions: string;
  extendedIngredients: Array<{
    name: string;
    amount: number;
    unit: string;
    original: string;
  }>;
  analyzedInstructions: Array<{
    steps: Array<{
      number: number;
      step: string;
    }>;
  }>;
  nutrition?: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
  };
}

const LANG_MAP: Record<string, string> = {
  de: "German",
  en: "English",
  fr: "French",
  it: "Italian",
};

interface RecipeData {
  id: number;
  title: string;
  image: string;
  servings: number;
  prepTime: string | null;
  cookTime: string | null;
  source: string;
  sourceUrl: string;
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
  ingredients: Array<{ name: string; amount: string | null; unit: string | null; original: string }>;
  steps: string[];
  nutrition: { calories: number | null; protein: number | null; carbs: number | null; fat: number | null; fiber: number | null };
}

async function translateRecipeDetail(recipe: RecipeData, targetLang: string): Promise<RecipeData> {
  if (targetLang === "en") return recipe;

  try {
    const env = getEnv();
    const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

    const response = await client.chat.completions.create({
      model: env.OPENAI_MODEL_CLASSIFY,
      messages: [
        {
          role: "user",
          content: `Translate this recipe to ${LANG_MAP[targetLang] ?? "German"}. Return ONLY valid JSON with same structure. Keep numbers, amounts and units unchanged. Translate: title, ingredient names, steps, cuisines, dishTypes, diets.

${JSON.stringify({
  title: recipe.title,
  ingredients: recipe.ingredients.map((i) => i.name),
  steps: recipe.steps,
  cuisines: recipe.cuisines,
  dishTypes: recipe.dishTypes,
  diets: recipe.diets,
})}`,
        },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return recipe;

    const t = JSON.parse(content) as {
      title?: string;
      ingredients?: string[];
      steps?: string[];
      cuisines?: string[];
      dishTypes?: string[];
      diets?: string[];
    };

    return {
      ...recipe,
      title: t.title ?? recipe.title,
      ingredients: recipe.ingredients.map((ing, i) => ({
        ...ing,
        name: t.ingredients?.[i] ?? ing.name,
      })),
      steps: t.steps ?? recipe.steps,
      cuisines: t.cuisines ?? recipe.cuisines,
      dishTypes: t.dishTypes ?? recipe.dishTypes,
      diets: t.diets ?? recipe.diets,
    };
  } catch (error) {
    console.error("Recipe translation failed:", error);
    return recipe;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ recipeId: string }> }
) {
  try {
    const { recipeId } = await params;
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get("lang") ?? "de";
    const apiKey = process.env.SPOONACULAR_API_KEY;

    if (!apiKey) {
      return NextResponse.json<ApiError>({ error: "API not configured." }, { status: 500 });
    }

    const url = `https://api.spoonacular.com/recipes/${recipeId}/information?includeNutrition=true&apiKey=${apiKey}`;
    const response = await fetch(url, { next: { revalidate: 86400 } });

    if (!response.ok) {
      return NextResponse.json<ApiError>({ error: "Recipe not found." }, { status: 404 });
    }

    const data = (await response.json()) as SpoonacularDetail;

    const steps = data.analyzedInstructions[0]?.steps.map((s) => s.step) ?? [];
    const nutrients = data.nutrition?.nutrients ?? [];
    const getN = (name: string) => nutrients.find((n) => n.name === name)?.amount ?? null;

    let recipe: RecipeData = {
      id: data.id,
      title: data.title,
      image: data.image,
      servings: data.servings,
      prepTime: data.preparationMinutes > 0 ? `${data.preparationMinutes} Min.` : null,
      cookTime: data.cookingMinutes > 0 ? `${data.cookingMinutes} Min.` : (data.readyInMinutes > 0 ? `${data.readyInMinutes} Min.` : null),
      source: data.sourceName,
      sourceUrl: data.sourceUrl,
      cuisines: data.cuisines,
      dishTypes: data.dishTypes,
      diets: data.diets,
      ingredients: data.extendedIngredients.map((i) => ({
        name: i.name,
        amount: i.amount > 0 ? String(i.amount) : null,
        unit: i.unit || null,
        original: i.original,
      })),
      steps,
      nutrition: {
        calories: getN("Calories"),
        protein: getN("Protein"),
        carbs: getN("Carbohydrates"),
        fat: getN("Fat"),
        fiber: getN("Fiber"),
      },
    };

    // Translate to target language
    recipe = await translateRecipeDetail(recipe, lang);

    return NextResponse.json({ recipe });
  } catch (error) {
    console.error("Recipe detail error:", error);
    return NextResponse.json<ApiError>({ error: "Failed to load recipe." }, { status: 500 });
  }
}
