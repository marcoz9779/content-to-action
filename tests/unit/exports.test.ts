import { describe, it, expect } from "vitest";
import { formatResultAsText, formatResultAsJson } from "@/lib/exports/format";
import type { ResultResponse } from "@/types";

const mockRecipeResult: ResultResponse = {
  id: "result-1",
  jobId: "job-1",
  contentType: "recipe",
  title: "Pasta Carbonara",
  summary: "Classic Italian pasta dish with eggs and cheese.",
  confidenceScore: 0.92,
  warnings: ["Exact amounts for seasoning not specified"],
  missingInformation: ["Oven temperature not mentioned"],
  structuredOutput: {
    contentType: "recipe",
    title: "Pasta Carbonara",
    summary: "Classic Italian pasta dish with eggs and cheese.",
    cuisine: "Italienisch",
    mealCategory: "Hauptgericht",
    difficulty: "Einfach",
    costLevel: "Günstig",
    ingredients: [
      { name: "spaghetti", amount: "400", unit: "g", notes: null, seasonal: false },
      { name: "eggs", amount: "4", unit: null, notes: "room temperature", seasonal: false },
    ],
    shoppingList: [
      { category: "Pasta", items: ["spaghetti"] },
      { category: "Dairy", items: ["eggs"] },
    ],
    steps: ["Boil pasta", "Mix eggs with cheese", "Combine"],
    prepTime: "10 minutes",
    cookTime: "15 minutes",
    servings: "4 servings",
    nutritionHighlights: ["Reich an Protein"],
    seasonalIngredients: [],
    tags: ["Pasta", "Italienisch", "Schnell"],
  },
  createdAt: "2024-01-01T00:00:00Z", thumbnailUrl: null, sourceCreator: null, sourceUrl: null,
};

const mockBusinessResult: ResultResponse = {
  id: "result-2",
  jobId: "job-2",
  contentType: "business",
  title: "Growth Strategies",
  summary: "Key business growth strategies.",
  confidenceScore: 0.85,
  warnings: [],
  missingInformation: [],
  structuredOutput: {
    contentType: "business",
    title: "Growth Strategies",
    summary: "Key business growth strategies.",
    keyLearnings: ["Focus on retention"],
    actionItems: ["Set up analytics"],
    frameworks: ["AARRR"],
    toolsMentioned: ["Mixpanel"],
    tags: ["Marketing", "Startups"],
  },
  createdAt: "2024-01-01T00:00:00Z", thumbnailUrl: null, sourceCreator: null, sourceUrl: null,
};

describe("formatResultAsText", () => {
  it("formats recipe result correctly", () => {
    const text = formatResultAsText(mockRecipeResult);
    expect(text).toContain("# Pasta Carbonara");
    expect(text).toContain("Type: recipe");
    expect(text).toContain("92%");
    expect(text).toContain("## Ingredients");
    expect(text).toContain("400 g spaghetti");
    expect(text).toContain("## Shopping List");
    expect(text).toContain("## Steps");
    expect(text).toContain("1. Boil pasta");
    expect(text).toContain("Prep time: 10 minutes");
    expect(text).toContain("## Warnings");
    expect(text).toContain("## Missing Information");
  });

  it("formats business result correctly", () => {
    const text = formatResultAsText(mockBusinessResult);
    expect(text).toContain("# Growth Strategies");
    expect(text).toContain("## Key Learnings");
    expect(text).toContain("Focus on retention");
    expect(text).toContain("## Action Items");
    expect(text).toContain("- [ ] Set up analytics");
    expect(text).toContain("## Frameworks");
    expect(text).toContain("AARRR");
  });
});

describe("formatResultAsJson", () => {
  it("returns valid JSON string", () => {
    const json = formatResultAsJson(mockRecipeResult);
    const parsed = JSON.parse(json) as ResultResponse;
    expect(parsed.id).toBe("result-1");
    expect(parsed.contentType).toBe("recipe");
  });

  it("preserves all fields", () => {
    const json = formatResultAsJson(mockBusinessResult);
    const parsed = JSON.parse(json) as ResultResponse;
    expect(parsed.structuredOutput).toBeDefined();
    expect(parsed.confidenceScore).toBe(0.85);
  });
});
