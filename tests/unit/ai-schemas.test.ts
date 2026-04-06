import { describe, it, expect } from "vitest";
import {
  classificationOutputSchema,
  recipeOutputSchema,
  businessOutputSchema,
  diyOutputSchema,
  workoutOutputSchema,
  otherOutputSchema,
  structuredOutputSchema,
} from "@/lib/ai/schemas";

describe("classificationOutputSchema", () => {
  it("accepts valid classification output", () => {
    const result = classificationOutputSchema.safeParse({
      contentType: "recipe",
      confidence: 0.92,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid content type", () => {
    const result = classificationOutputSchema.safeParse({
      contentType: "invalid",
      confidence: 0.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects confidence outside 0-1 range", () => {
    expect(
      classificationOutputSchema.safeParse({
        contentType: "recipe",
        confidence: 1.5,
      }).success
    ).toBe(false);
    expect(
      classificationOutputSchema.safeParse({
        contentType: "recipe",
        confidence: -0.1,
      }).success
    ).toBe(false);
  });
});

describe("recipeOutputSchema", () => {
  it("accepts valid recipe output", () => {
    const result = recipeOutputSchema.safeParse({
      contentType: "recipe",
      title: "Pasta Carbonara",
      summary: "Classic Italian pasta dish",
      ingredients: [
        { name: "spaghetti", amount: "400", unit: "g", notes: null },
        { name: "eggs", amount: "4", unit: null, notes: "room temperature" },
      ],
      shoppingList: [
        { category: "Pasta", items: ["spaghetti"] },
        { category: "Dairy", items: ["eggs", "parmesan"] },
      ],
      steps: ["Boil water", "Cook pasta", "Mix eggs"],
      prepTime: "10 minutes",
      cookTime: "15 minutes",
      servings: "4",
    });
    expect(result.success).toBe(true);
  });

  it("accepts recipe with null optional fields", () => {
    const result = recipeOutputSchema.safeParse({
      contentType: "recipe",
      title: "Quick snack",
      summary: "A simple snack",
      ingredients: [{ name: "bread", amount: null, unit: null, notes: null }],
      shoppingList: [],
      steps: ["Toast bread"],
      prepTime: null,
      cookTime: null,
      servings: null,
    });
    expect(result.success).toBe(true);
  });
});

describe("businessOutputSchema", () => {
  it("accepts valid business output", () => {
    const result = businessOutputSchema.safeParse({
      contentType: "business",
      title: "Growth Hacking 101",
      summary: "Key strategies for startup growth",
      keyLearnings: ["Focus on retention first"],
      actionItems: ["Set up analytics dashboard"],
      frameworks: ["AARRR Pirate Metrics"],
      toolsMentioned: ["Mixpanel"],
    });
    expect(result.success).toBe(true);
  });
});

describe("diyOutputSchema", () => {
  it("accepts valid DIY output", () => {
    const result = diyOutputSchema.safeParse({
      contentType: "diy",
      title: "Wooden Shelf",
      summary: "Build a simple wall shelf",
      materials: ["Pine board", "Screws"],
      tools: ["Drill", "Level"],
      steps: ["Measure wall", "Cut board", "Mount brackets"],
      estimatedEffort: "2 hours",
      difficultyLevel: "beginner",
    });
    expect(result.success).toBe(true);
  });
});

describe("workoutOutputSchema", () => {
  it("accepts valid workout output", () => {
    const result = workoutOutputSchema.safeParse({
      contentType: "workout",
      title: "Full Body HIIT",
      summary: "A 20-minute full body workout",
      exercises: [
        {
          name: "Burpees",
          reps: "10",
          sets: "3",
          duration: null,
          notes: "Modify by stepping back instead of jumping",
        },
      ],
      workoutStructure: "3 rounds circuit",
      totalDuration: "20 minutes",
      targetMuscleGroups: ["Full body"],
    });
    expect(result.success).toBe(true);
  });
});

describe("otherOutputSchema", () => {
  it("accepts valid other output", () => {
    const result = otherOutputSchema.safeParse({
      contentType: "other",
      title: "Travel Tips",
      summary: "Essential travel advice",
      keyPoints: ["Pack light", "Learn basic phrases"],
      suggestedActions: ["Create a packing checklist"],
    });
    expect(result.success).toBe(true);
  });
});

describe("structuredOutputSchema (discriminated union)", () => {
  it("correctly discriminates recipe type", () => {
    const result = structuredOutputSchema.safeParse({
      contentType: "recipe",
      title: "Test",
      summary: "Test",
      ingredients: [],
      shoppingList: [],
      steps: [],
      prepTime: null,
      cookTime: null,
      servings: null,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.contentType).toBe("recipe");
    }
  });

  it("correctly discriminates business type", () => {
    const result = structuredOutputSchema.safeParse({
      contentType: "business",
      title: "Test",
      summary: "Test",
      keyLearnings: [],
      actionItems: [],
      frameworks: [],
      toolsMentioned: [],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.contentType).toBe("business");
    }
  });

  it("rejects mismatched discriminant and fields", () => {
    const result = structuredOutputSchema.safeParse({
      contentType: "recipe",
      title: "Test",
      summary: "Test",
      keyLearnings: [],
      actionItems: [],
    });
    expect(result.success).toBe(false);
  });
});
