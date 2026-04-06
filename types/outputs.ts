export interface BaseOutput {
  contentType: string;
  title: string;
  summary: string;
  tags: string[];
}

export interface RecipeIngredient {
  name: string;
  amount: string | null;
  unit: string | null;
  notes: string | null;
  seasonal: boolean;
}

export interface ShoppingListItem {
  category: string;
  items: string[];
}

export interface RecipeOutput extends BaseOutput {
  contentType: "recipe";
  cuisine: string;
  mealCategory: string;
  difficulty: string;
  costLevel: string;
  ingredients: RecipeIngredient[];
  shoppingList: ShoppingListItem[];
  steps: string[];
  prepTime: string | null;
  cookTime: string | null;
  servings: string | null;
  nutritionHighlights: string[];
  seasonalIngredients: string[];
}

export interface BusinessOutput extends BaseOutput {
  contentType: "business";
  keyLearnings: string[];
  actionItems: string[];
  frameworks: string[];
  toolsMentioned: string[];
}

export interface DIYOutput extends BaseOutput {
  contentType: "diy";
  materials: string[];
  tools: string[];
  steps: string[];
  estimatedEffort: string | null;
  difficultyLevel: string | null;
}

export interface WorkoutExercise {
  name: string;
  reps: string | null;
  sets: string | null;
  duration: string | null;
  notes: string | null;
}

export interface WorkoutOutput extends BaseOutput {
  contentType: "workout";
  exercises: WorkoutExercise[];
  workoutStructure: string | null;
  totalDuration: string | null;
  targetMuscleGroups: string[];
}

export interface TravelOutput extends BaseOutput {
  contentType: "travel";
  destinations: string[];
  travelTips: string[];
  estimatedBudget: string | null;
  bestTimeToVisit: string | null;
  packingList: string[];
}

export interface FashionOutfitItem {
  name: string;
  brand: string | null;
  estimatedPrice: string | null;
  category: string;
}

export interface FashionOutput extends BaseOutput {
  contentType: "fashion";
  outfitItems: FashionOutfitItem[];
  styleNotes: string[];
  occasions: string[];
  alternativeSuggestions: string[];
}

export interface TechReviewProsAndCons {
  pros: string[];
  cons: string[];
}

export interface TechReviewOutput extends BaseOutput {
  contentType: "tech_review";
  productName: string;
  prosAndCons: TechReviewProsAndCons;
  rating: string | null;
  specifications: string[];
  verdict: string;
  alternatives: string[];
}

export interface EducationConcept {
  name: string;
  explanation: string;
}

export interface EducationOutput extends BaseOutput {
  contentType: "education";
  concepts: EducationConcept[];
  keyTakeaways: string[];
  furtherResources: string[];
  practiceExercises: string[];
  difficultyLevel: string | null;
}

export interface OtherOutput extends BaseOutput {
  contentType: "other";
  keyPoints: string[];
  suggestedActions: string[];
}

export type StructuredOutput =
  | RecipeOutput
  | BusinessOutput
  | DIYOutput
  | WorkoutOutput
  | TravelOutput
  | FashionOutput
  | TechReviewOutput
  | EducationOutput
  | OtherOutput;
