import { NextRequest, NextResponse } from "next/server";
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ingredients = searchParams.get("ingredients");
    const count = Math.min(parseInt(searchParams.get("count") ?? "12"), 20);

    if (!ingredients) {
      return NextResponse.json<ApiError>({ error: "Missing ingredients parameter." }, { status: 400 });
    }

    const apiKey = process.env.SPOONACULAR_API_KEY;

    if (!apiKey) {
      // Fallback: Return empty results if no API key configured
      return NextResponse.json({ recipes: [], source: "none", message: "Spoonacular API key not configured." });
    }

    // Call Spoonacular "Find by Ingredients" API
    const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredients)}&number=${count}&ranking=2&ignorePantry=true&apiKey=${apiKey}`;

    const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Spoonacular API error:", response.status, errorText);

      if (response.status === 402) {
        return NextResponse.json({ recipes: [], source: "spoonacular", message: "API limit reached." });
      }

      return NextResponse.json<ApiError>({ error: "Recipe search failed." }, { status: 500 });
    }

    const data = (await response.json()) as SpoonacularRecipe[];

    const recipes: RecipeSuggestion[] = data.map((r) => {
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

    // Sort by best match
    recipes.sort((a, b) => b.matchPercent - a.matchPercent || a.missedCount - b.missedCount);

    return NextResponse.json({ recipes, source: "spoonacular" });
  } catch (error) {
    console.error("Recipe suggestion error:", error);
    return NextResponse.json<ApiError>({ error: "Recipe search failed." }, { status: 500 });
  }
}
