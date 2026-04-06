import { NextRequest, NextResponse } from "next/server";
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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ recipeId: string }> }
) {
  try {
    const { recipeId } = await params;
    const apiKey = process.env.SPOONACULAR_API_KEY;

    if (!apiKey) {
      return NextResponse.json<ApiError>({ error: "API not configured." }, { status: 500 });
    }

    const url = `https://api.spoonacular.com/recipes/${recipeId}/information?includeNutrition=true&apiKey=${apiKey}`;
    const response = await fetch(url, { next: { revalidate: 86400 } }); // Cache 24h

    if (!response.ok) {
      return NextResponse.json<ApiError>({ error: "Recipe not found." }, { status: 404 });
    }

    const data = (await response.json()) as SpoonacularDetail;

    // Extract steps from analyzed instructions
    const steps = data.analyzedInstructions[0]?.steps.map((s) => s.step) ?? [];

    // Extract nutrition
    const nutrients = data.nutrition?.nutrients ?? [];
    const getN = (name: string) => nutrients.find((n) => n.name === name)?.amount ?? null;

    const recipe = {
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

    return NextResponse.json({ recipe });
  } catch (error) {
    console.error("Recipe detail error:", error);
    return NextResponse.json<ApiError>({ error: "Failed to load recipe." }, { status: 500 });
  }
}
