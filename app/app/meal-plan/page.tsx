"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/shared/page-transition";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  CalendarDays,
  Plus,
  X,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  UtensilsCrossed,
  Coffee,
  Moon,
  Apple,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecipeOutput, ResultResponse } from "@/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MealPlanEntry {
  id: string;
  dayIndex: number; // 0=Monday, 6=Sunday
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  resultId: string;
  title: string;
}

interface WeekPlan {
  weekStart: string; // ISO date of Monday
  entries: MealPlanEntry[];
}

interface RecipeListItem {
  id: string;
  title: string;
  contentType: string;
}

// Shopping list types matching the existing shopping-list page format
interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
  checked: boolean;
}

interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingItem[];
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = "cta-meal-plan";
const SHOPPING_STORAGE_KEY = "cta-shopping-lists";

const DAY_NAMES = [
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
  "Sonntag",
] as const;

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;
type MealType = (typeof MEAL_TYPES)[number];

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "Frühstück",
  lunch: "Mittagessen",
  dinner: "Abendessen",
  snack: "Snack",
};

const MEAL_ICONS: Record<MealType, typeof Coffee> = {
  breakfast: Coffee,
  lunch: UtensilsCrossed,
  dinner: Moon,
  snack: Apple,
};

const MEAL_COLORS: Record<MealType, string> = {
  breakfast: "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200",
  lunch: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200",
  dinner: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200",
  snack: "bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-200",
};

// Category detection for shopping items (matching the shopping list page)
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Gemüse & Obst": [
    "tomate", "gurke", "salat", "zwiebel", "knoblauch", "kartoffel",
    "karotte", "paprika", "apfel", "banane", "zitrone", "avocado",
    "spinat", "brokkoli", "pilz", "kürbis", "möhre", "lauch",
    "radieschen", "blumenkohl", "aubergine", "zucchini", "birne",
    "erdbeere", "himbeere", "blaubeere", "traube", "mango", "ananas",
    "kiwi", "orange", "mandarine", "kirsche", "pflaume", "pfirsich",
    "rote bete", "sellerie", "fenchel", "rucola", "mais", "erbse",
    "bohne", "linse", "kichererbse",
  ],
  Milchprodukte: [
    "milch", "käse", "joghurt", "butter", "sahne", "quark", "ei",
    "eier", "mozzarella", "parmesan", "rahm", "mascarpone", "ricotta",
    "frischkäse", "crème fraîche", "schmand", "gouda", "emmentaler",
    "feta", "hüttenkäse", "skyr",
  ],
  "Fleisch & Fisch": [
    "huhn", "hähnchen", "rind", "schwein", "lachs", "thunfisch",
    "garnele", "hack", "wurst", "schinken", "speck", "poulet",
    "pute", "truthahn", "lamm", "kalb", "ente", "forelle", "kabeljau",
    "sardine", "muschel", "tintenfisch", "salami", "bratwurst",
  ],
  Backwaren: [
    "brot", "mehl", "hefe", "zucker", "brötchen", "toast", "nudel",
    "pasta", "reis", "spaghetti", "penne", "fusilli", "lasagne",
    "couscous", "bulgur", "haferflocken", "müsli", "cornflakes",
    "backpulver", "stärke", "tortilla", "wrap", "knäckebrot",
  ],
  Getränke: [
    "wasser", "saft", "bier", "wein", "kaffee", "tee", "limonade",
    "cola", "sprudel", "mineralwasser", "kakao", "milchshake",
    "smoothie", "eistee", "apfelschorle",
  ],
  Gewürze: [
    "salz", "pfeffer", "oregano", "basilikum", "zimt", "curry",
    "paprikapulver", "muskat", "thymian", "rosmarin", "kurkuma",
    "koriander", "kreuzkümmel", "chili", "ingwer", "vanille",
    "lorbeer", "dill", "petersilie", "schnittlauch", "majoran",
    "sojasauce", "essig", "senf", "ketchup", "mayonnaise",
    "worcestersauce", "tabasco", "sriracha",
  ],
  Tiefkühl: [
    "pizza", "eis", "tiefkühl", "gefroren", "tk-", "pommes",
    "fischstäbchen", "spinat tiefgekühlt",
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

/** Get the Monday of the week containing the given date. */
function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  // Sunday is 0, Monday is 1 — shift so Monday=0
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toISODate(date: Date): string {
  return date.toISOString().split("T")[0] ?? "";
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatWeekRange(mondayStr: string): string {
  const monday = new Date(mondayStr + "T00:00:00");
  const sunday = addDays(monday, 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString("de-DE", { day: "numeric", month: "short" });
  return `${fmt(monday)} – ${fmt(sunday)}`;
}

function formatDayDate(mondayStr: string, dayIndex: number): string {
  const monday = new Date(mondayStr + "T00:00:00");
  const date = addDays(monday, dayIndex);
  return date.toLocaleDateString("de-DE", { day: "numeric", month: "numeric" });
}

function loadWeekPlan(weekStart: string): WeekPlan {
  if (typeof window === "undefined") return { weekStart, entries: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const plans = JSON.parse(raw) as WeekPlan[];
      const found = plans.find((p) => p.weekStart === weekStart);
      if (found) return found;
    }
  } catch {
    // corrupted data
  }
  return { weekStart, entries: [] };
}

function saveWeekPlan(plan: WeekPlan): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const plans: WeekPlan[] = raw ? (JSON.parse(raw) as WeekPlan[]) : [];
    const idx = plans.findIndex((p) => p.weekStart === plan.weekStart);
    if (idx >= 0) {
      plans[idx] = plan;
    } else {
      plans.push(plan);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  } catch {
    // storage full or corrupted
  }
}

function detectCategory(itemName: string): string {
  const lower = itemName.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        return category;
      }
    }
  }
  return "Sonstiges";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MealPlanPage() {
  const router = useRouter();
  const [currentMonday, setCurrentMonday] = useState<string>(() =>
    toISODate(getMonday(new Date()))
  );
  const [plan, setPlan] = useState<WeekPlan>({ weekStart: currentMonday, entries: [] });
  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [recipesLoading, setRecipesLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Active picker state: which day + meal slot is being picked
  const [activePicker, setActivePicker] = useState<{
    dayIndex: number;
    mealType: MealType;
  } | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Load plan when week changes
  useEffect(() => {
    setPlan(loadWeekPlan(currentMonday));
  }, [currentMonday]);

  // Persist plan on change
  useEffect(() => {
    if (plan.weekStart === currentMonday) {
      saveWeekPlan(plan);
    }
  }, [plan, currentMonday]);

  // Fetch recipe results
  useEffect(() => {
    async function fetchRecipes() {
      setRecipesLoading(true);
      try {
        const response = await fetch("/api/results?contentType=recipe&limit=100");
        if (response.ok) {
          const data = (await response.json()) as { results: RecipeListItem[] };
          setRecipes(data.results);
        }
      } catch {
        // silent fail
      } finally {
        setRecipesLoading(false);
      }
    }
    fetchRecipes();
  }, []);

  // Close picker on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setActivePicker(null);
      }
    }
    if (activePicker) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [activePicker]);

  // Week navigation
  const goToPreviousWeek = useCallback(() => {
    const monday = new Date(currentMonday + "T00:00:00");
    setCurrentMonday(toISODate(addDays(monday, -7)));
  }, [currentMonday]);

  const goToNextWeek = useCallback(() => {
    const monday = new Date(currentMonday + "T00:00:00");
    setCurrentMonday(toISODate(addDays(monday, 7)));
  }, [currentMonday]);

  const goToCurrentWeek = useCallback(() => {
    setCurrentMonday(toISODate(getMonday(new Date())));
  }, []);

  // Meal management
  const addMeal = useCallback(
    (dayIndex: number, mealType: MealType, recipe: RecipeListItem) => {
      setPlan((prev) => ({
        ...prev,
        entries: [
          ...prev.entries,
          {
            id: generateId(),
            dayIndex,
            mealType,
            resultId: recipe.id,
            title: recipe.title,
          },
        ],
      }));
      setActivePicker(null);
      toast.success(`${recipe.title} hinzugefügt`);
    },
    []
  );

  const removeMeal = useCallback((entryId: string) => {
    setPlan((prev) => ({
      ...prev,
      entries: prev.entries.filter((e) => e.id !== entryId),
    }));
  }, []);

  // Get entries for a specific day and meal type
  const getEntries = useCallback(
    (dayIndex: number, mealType: MealType): MealPlanEntry[] => {
      return plan.entries.filter(
        (e) => e.dayIndex === dayIndex && e.mealType === mealType
      );
    },
    [plan.entries]
  );

  // Generate shopping list
  const generateShoppingList = useCallback(async () => {
    if (plan.entries.length === 0) {
      toast.error("Keine Rezepte im Wochenplan");
      return;
    }

    setGenerating(true);

    try {
      // Deduplicate result IDs
      const uniqueResultIds = [...new Set(plan.entries.map((e) => e.resultId))];

      // Fetch all results in parallel
      const resultPromises = uniqueResultIds.map(async (id) => {
        const res = await fetch(`/api/results/${id}`);
        if (!res.ok) return null;
        return (await res.json()) as ResultResponse;
      });

      const results = (await Promise.all(resultPromises)).filter(
        (r): r is ResultResponse => r !== null && r.structuredOutput.contentType === "recipe"
      );

      if (results.length === 0) {
        toast.error("Keine gültigen Rezepte gefunden");
        setGenerating(false);
        return;
      }

      // Aggregate all ingredients across all recipe results
      const ingredientMap = new Map<string, { name: string; amounts: string[] }>();

      for (const result of results) {
        const output = result.structuredOutput as RecipeOutput;

        // Count how many times this recipe appears in the plan
        const count = plan.entries.filter((e) => e.resultId === result.id).length;

        for (const ingredient of output.ingredients) {
          const key = ingredient.name.toLowerCase().trim();
          const existing = ingredientMap.get(key);

          // Build the quantity string
          let qtyStr = "";
          if (ingredient.amount) {
            qtyStr = ingredient.amount;
            if (ingredient.unit) qtyStr += ` ${ingredient.unit}`;
          } else if (ingredient.unit) {
            qtyStr = ingredient.unit;
          }

          // Multiply label if recipe appears multiple times
          if (count > 1 && qtyStr) {
            qtyStr = `${count}x ${qtyStr}`;
          } else if (count > 1) {
            qtyStr = `${count}x`;
          }

          if (existing) {
            if (qtyStr) existing.amounts.push(qtyStr);
          } else {
            ingredientMap.set(key, {
              name: ingredient.name,
              amounts: qtyStr ? [qtyStr] : [],
            });
          }
        }
      }

      // Convert aggregated ingredients into shopping items
      const items: ShoppingItem[] = Array.from(ingredientMap.values()).map(
        ({ name, amounts }) => ({
          id: generateId(),
          name,
          category: detectCategory(name),
          quantity: amounts.length > 0 ? amounts.join(" + ") : "",
          checked: false,
        })
      );

      // Create or update the shopping list in localStorage
      const weekLabel = formatWeekRange(currentMonday);
      const newList: ShoppingList = {
        id: generateId(),
        name: `Wochenplan ${weekLabel}`,
        items,
        createdAt: new Date().toISOString(),
      };

      // Load existing lists and add/replace
      let existingLists: ShoppingList[] = [];
      try {
        const raw = localStorage.getItem(SHOPPING_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as ShoppingList[];
          if (Array.isArray(parsed)) {
            // Remove any previous meal-plan list for this week
            existingLists = parsed.filter(
              (l) => !l.name.startsWith("Wochenplan ") || l.name !== newList.name
            );
          }
        }
      } catch {
        // start fresh
      }

      // Add the new list at the beginning
      existingLists.unshift(newList);
      localStorage.setItem(SHOPPING_STORAGE_KEY, JSON.stringify(existingLists));

      toast.success("Einkaufsliste aktualisiert");
      router.push("/app/shopping-list");
    } catch (error) {
      console.error("Failed to generate shopping list:", error);
      toast.error("Fehler beim Erstellen der Einkaufsliste");
    } finally {
      setGenerating(false);
    }
  }, [plan.entries, currentMonday, router]);

  // Total meals count
  const totalMeals = plan.entries.length;
  const isCurrentWeek =
    currentMonday === toISODate(getMonday(new Date()));

  return (
    <PageTransition className="container max-w-7xl py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Wochenplan</h1>
            <p className="text-sm text-muted-foreground">
              Plane deine Mahlzeiten und erstelle automatisch eine Einkaufsliste
            </p>
          </div>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousWeek}
            className="h-9 w-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <button
            onClick={goToCurrentWeek}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              isCurrentWeek
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <span className="hidden sm:inline">
              {isCurrentWeek ? "Diese Woche" : formatWeekRange(currentMonday)}
            </span>
            <span className="sm:hidden">
              {isCurrentWeek ? "Diese Woche" : formatWeekRange(currentMonday)}
            </span>
          </button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextWeek}
            className="h-9 w-9"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          {totalMeals > 0 && (
            <Badge variant="secondary" className="text-xs">
              {totalMeals} {totalMeals === 1 ? "Mahlzeit" : "Mahlzeiten"}
            </Badge>
          )}
          <Button
            onClick={generateShoppingList}
            disabled={totalMeals === 0 || generating}
            className="gap-2"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
            Einkaufsliste generieren
          </Button>
        </div>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {DAY_NAMES.map((dayName, dayIndex) => {
          const dayEntries = plan.entries.filter((e) => e.dayIndex === dayIndex);
          const isToday =
            isCurrentWeek &&
            new Date().getDay() === (dayIndex === 6 ? 0 : dayIndex + 1);

          return (
            <motion.div
              key={`${currentMonday}-${dayIndex}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: dayIndex * 0.04 }}
            >
              <Card
                className={cn(
                  "h-full transition-shadow hover:shadow-md",
                  isToday && "ring-2 ring-primary/40 shadow-md"
                )}
              >
                <CardHeader className="pb-2 px-3 pt-3 sm:px-4 sm:pt-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">
                      {dayName}
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">
                      {formatDayDate(currentMonday, dayIndex)}
                    </span>
                  </div>
                  {isToday && (
                    <Badge
                      variant="default"
                      className="w-fit text-[10px] px-1.5 py-0"
                    >
                      Heute
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4 space-y-2">
                  {MEAL_TYPES.map((mealType) => {
                    const entries = getEntries(dayIndex, mealType);
                    const Icon = MEAL_ICONS[mealType];
                    const isPickerActive =
                      activePicker?.dayIndex === dayIndex &&
                      activePicker?.mealType === mealType;

                    return (
                      <div key={mealType} className="relative">
                        {/* Meal type label */}
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <Icon className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[11px] font-medium text-muted-foreground">
                              {MEAL_LABELS[mealType]}
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              setActivePicker(
                                isPickerActive
                                  ? null
                                  : { dayIndex, mealType }
                              )
                            }
                            className={cn(
                              "flex h-5 w-5 items-center justify-center rounded-md transition-colors",
                              isPickerActive
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground/60 hover:text-primary hover:bg-primary/10"
                            )}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Assigned meals */}
                        <AnimatePresence mode="popLayout">
                          {entries.map((entry) => (
                            <motion.div
                              key={entry.id}
                              initial={{ opacity: 0, scale: 0.9, height: 0 }}
                              animate={{ opacity: 1, scale: 1, height: "auto" }}
                              exit={{ opacity: 0, scale: 0.9, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="mb-1"
                            >
                              <div
                                className={cn(
                                  "group flex items-start gap-1.5 rounded-lg px-2 py-1.5 text-xs",
                                  MEAL_COLORS[mealType]
                                )}
                              >
                                <span className="flex-1 leading-tight font-medium line-clamp-2">
                                  {entry.title}
                                </span>
                                <button
                                  onClick={() => removeMeal(entry.id)}
                                  className="shrink-0 rounded-full p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>

                        {/* Recipe picker dropdown */}
                        <AnimatePresence>
                          {isPickerActive && (
                            <motion.div
                              ref={pickerRef}
                              initial={{ opacity: 0, y: -4, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -4, scale: 0.95 }}
                              transition={{ duration: 0.15 }}
                              className="absolute left-0 right-0 top-full z-50 mt-1"
                            >
                              <div className="rounded-lg border bg-popover p-1.5 shadow-lg max-h-48 overflow-y-auto">
                                {recipesLoading ? (
                                  <div className="flex items-center justify-center py-4">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                  </div>
                                ) : recipes.length === 0 ? (
                                  <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                                    Keine Rezepte vorhanden.
                                    <br />
                                    Analysiere zuerst ein Rezept-Video.
                                  </p>
                                ) : (
                                  recipes.map((recipe) => (
                                    <button
                                      key={recipe.id}
                                      onClick={() =>
                                        addMeal(dayIndex, mealType, recipe)
                                      }
                                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-accent"
                                    >
                                      <UtensilsCrossed className="h-3 w-3 shrink-0 text-muted-foreground" />
                                      <span className="truncate">
                                        {recipe.title}
                                      </span>
                                    </button>
                                  ))
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}

                  {/* Empty state for day */}
                  {dayEntries.length === 0 && (
                    <p className="pt-1 text-center text-[10px] text-muted-foreground/50">
                      Noch keine Mahlzeiten
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom action bar (visible on mobile) */}
      {totalMeals > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-16 left-0 right-0 z-40 border-t bg-background/95 p-3 backdrop-blur sm:hidden"
        >
          <Button
            onClick={generateShoppingList}
            disabled={generating}
            className="w-full gap-2"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
            Einkaufsliste generieren ({totalMeals}{" "}
            {totalMeals === 1 ? "Rezept" : "Rezepte"})
          </Button>
        </motion.div>
      )}
    </PageTransition>
  );
}
