import { z } from "zod";

export const classificationOutputSchema = z.object({
  contentType: z.enum(["recipe", "business", "diy", "workout", "travel", "fashion", "tech_review", "education", "other"]),
  confidence: z.number().min(0).max(1),
});

export const recipeIngredientSchema = z.object({
  name: z.string(),
  amount: z.string().nullable(),
  unit: z.string().nullable(),
  notes: z.string().nullable(),
  seasonal: z.boolean().default(false),
});

export const shoppingListItemSchema = z.object({
  category: z.string(),
  items: z.array(z.string()),
});

export const recipeOutputSchema = z.object({
  contentType: z.literal("recipe"),
  title: z.string(),
  summary: z.string(),
  cuisine: z.string().default(""),
  mealCategory: z.string().default(""),
  difficulty: z.string().default(""),
  costLevel: z.string().default(""),
  ingredients: z.array(recipeIngredientSchema),
  shoppingList: z.array(shoppingListItemSchema),
  steps: z.array(z.string()),
  prepTime: z.string().nullable(),
  cookTime: z.string().nullable(),
  servings: z.string().nullable(),
  nutritionHighlights: z.array(z.string()).default([]),
  seasonalIngredients: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  missingInformation: z.array(z.string()).default([]),
});

export const businessOutputSchema = z.object({
  contentType: z.literal("business"),
  title: z.string(),
  summary: z.string(),
  keyLearnings: z.array(z.string()),
  actionItems: z.array(z.string()),
  frameworks: z.array(z.string()),
  toolsMentioned: z.array(z.string()),
  tags: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  missingInformation: z.array(z.string()).default([]),
});

export const diyOutputSchema = z.object({
  contentType: z.literal("diy"),
  title: z.string(),
  summary: z.string(),
  materials: z.array(z.string()),
  tools: z.array(z.string()),
  steps: z.array(z.string()),
  estimatedEffort: z.string().nullable(),
  difficultyLevel: z.string().nullable(),
  tags: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  missingInformation: z.array(z.string()).default([]),
});

export const workoutExerciseSchema = z.object({
  name: z.string(),
  reps: z.string().nullable(),
  sets: z.string().nullable(),
  duration: z.string().nullable(),
  notes: z.string().nullable(),
});

export const workoutOutputSchema = z.object({
  contentType: z.literal("workout"),
  title: z.string(),
  summary: z.string(),
  exercises: z.array(workoutExerciseSchema),
  workoutStructure: z.string().nullable(),
  totalDuration: z.string().nullable(),
  targetMuscleGroups: z.array(z.string()),
  tags: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  missingInformation: z.array(z.string()).default([]),
});

export const travelOutputSchema = z.object({
  contentType: z.literal("travel"),
  title: z.string(),
  summary: z.string(),
  destinations: z.array(z.string()),
  travelTips: z.array(z.string()),
  estimatedBudget: z.string().nullable(),
  bestTimeToVisit: z.string().nullable(),
  packingList: z.array(z.string()),
  tags: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  missingInformation: z.array(z.string()).default([]),
});

export const fashionOutfitItemSchema = z.object({
  name: z.string(),
  brand: z.string().nullable(),
  estimatedPrice: z.string().nullable(),
  category: z.string(),
});

export const fashionOutputSchema = z.object({
  contentType: z.literal("fashion"),
  title: z.string(),
  summary: z.string(),
  outfitItems: z.array(fashionOutfitItemSchema),
  styleNotes: z.array(z.string()),
  occasions: z.array(z.string()),
  alternativeSuggestions: z.array(z.string()),
  tags: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  missingInformation: z.array(z.string()).default([]),
});

export const techReviewProsAndConsSchema = z.object({
  pros: z.array(z.string()),
  cons: z.array(z.string()),
});

export const techReviewOutputSchema = z.object({
  contentType: z.literal("tech_review"),
  title: z.string(),
  summary: z.string(),
  productName: z.string(),
  prosAndCons: techReviewProsAndConsSchema,
  rating: z.string().nullable(),
  specifications: z.array(z.string()),
  verdict: z.string(),
  alternatives: z.array(z.string()),
  tags: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  missingInformation: z.array(z.string()).default([]),
});

export const educationConceptSchema = z.object({
  name: z.string(),
  explanation: z.string(),
});

export const educationOutputSchema = z.object({
  contentType: z.literal("education"),
  title: z.string(),
  summary: z.string(),
  concepts: z.array(educationConceptSchema),
  keyTakeaways: z.array(z.string()),
  furtherResources: z.array(z.string()),
  practiceExercises: z.array(z.string()),
  difficultyLevel: z.string().nullable(),
  tags: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  missingInformation: z.array(z.string()).default([]),
});

export const otherOutputSchema = z.object({
  contentType: z.literal("other"),
  title: z.string(),
  summary: z.string(),
  keyPoints: z.array(z.string()),
  suggestedActions: z.array(z.string()),
  tags: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  missingInformation: z.array(z.string()).default([]),
});

export const structuredOutputSchema = z.discriminatedUnion("contentType", [
  recipeOutputSchema,
  businessOutputSchema,
  diyOutputSchema,
  workoutOutputSchema,
  travelOutputSchema,
  fashionOutputSchema,
  techReviewOutputSchema,
  educationOutputSchema,
  otherOutputSchema,
]);

export type ClassificationOutput = z.infer<typeof classificationOutputSchema>;
export type RecipeOutputParsed = z.infer<typeof recipeOutputSchema>;
export type BusinessOutputParsed = z.infer<typeof businessOutputSchema>;
export type DIYOutputParsed = z.infer<typeof diyOutputSchema>;
export type WorkoutOutputParsed = z.infer<typeof workoutOutputSchema>;
export type TravelOutputParsed = z.infer<typeof travelOutputSchema>;
export type FashionOutputParsed = z.infer<typeof fashionOutputSchema>;
export type TechReviewOutputParsed = z.infer<typeof techReviewOutputSchema>;
export type EducationOutputParsed = z.infer<typeof educationOutputSchema>;
export type OtherOutputParsed = z.infer<typeof otherOutputSchema>;
export type StructuredOutputParsed = z.infer<typeof structuredOutputSchema>;
