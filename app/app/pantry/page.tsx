"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  PageTransition,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/page-transition";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Package,
  Plus,
  X,
  Search,
  ChefHat,
  Check,
  ShoppingCart,
  Sparkles,
  Trash2,
  Refrigerator,
  Globe,
  Clock,
  Users,
  ExternalLink,
  Flame,
  Dumbbell,
  Wheat,
  Droplets,
  Leaf,
} from "lucide-react";
import type { RecipeOutput, RecipeIngredient } from "@/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PantryRecipeMatch {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  ingredients: RecipeIngredient[];
  totalIngredients: number;
  matchedCount: number;
  missingIngredients: string[];
  matchPercent: number;
}

interface RecipeResultItem {
  id: string;
  contentType: string;
  title: string;
  summary: string;
  createdAt: string;
}

interface RecipeFullResult {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  structuredOutput: RecipeOutput;
}

/** Spoonacular suggestion from /api/suggest-recipes */
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

/** Spoonacular detail from /api/suggest-recipes/[recipeId] */
interface RecipeDetail {
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
  ingredients: { name: string; amount: string | null; unit: string | null; original: string }[];
  steps: string[];
  nutrition: { calories: number | null; protein: number | null; carbs: number | null; fat: number | null; fiber: number | null };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = "cta-pantry";
const SHOPPING_LIST_STORAGE_KEY = "cta-shopping-lists";

const QUICK_ADD_BASICS: string[] = [
  "Mehl",
  "Zucker",
  "Salz",
  "Pfeffer",
  "Olivenoel",
  "Butter",
  "Eier",
  "Milch",
  "Zwiebeln",
  "Knoblauch",
  "Reis",
  "Pasta",
  "Tomatenmark",
  "Senf",
  "Essig",
  "Sojasauce",
];

/** Categories and their associated ingredient keywords (German) */
const PANTRY_CATEGORIES: Record<string, string[]> = {
  Basics: [
    "mehl", "zucker", "salz", "pfeffer", "oel", "olivenoel", "sonnenblumenoel",
    "rapsoel", "butter", "eier", "ei", "milch", "backpulver", "hefe",
    "staerke", "natron", "vanillezucker", "puderzucker",
  ],
  "Gemuese & Obst": [
    "tomate", "gurke", "salat", "zwiebel", "knoblauch", "kartoffel",
    "karotte", "paprika", "apfel", "banane", "zitrone", "avocado",
    "spinat", "brokkoli", "pilz", "kuerbis", "moehre", "lauch",
    "zucchini", "aubergine", "mais", "erbse", "bohne", "linse",
    "kichererbse", "sellerie", "fenchel", "rucola", "radieschen",
    "blumenkohl", "birne", "erdbeere", "himbeere", "mango", "ananas",
    "kiwi", "orange", "kirsche",
  ],
  "Fleisch & Fisch": [
    "huhn", "haehnchen", "rind", "schwein", "lachs", "thunfisch",
    "garnele", "hack", "wurst", "schinken", "speck", "poulet",
    "pute", "truthahn", "lamm", "kalb", "ente", "forelle", "kabeljau",
    "salami", "bratwurst",
  ],
  Kuehlschrank: [
    "kaese", "joghurt", "sahne", "quark", "mozzarella", "parmesan",
    "rahm", "mascarpone", "ricotta", "frischkaese", "creme fraiche",
    "schmand", "gouda", "emmentaler", "feta", "huettenkaese", "skyr",
    "tofu", "tempeh",
  ],
  Gewuerze: [
    "oregano", "basilikum", "zimt", "curry", "paprikapulver", "muskat",
    "thymian", "rosmarin", "kurkuma", "koriander", "kreuzuemmel",
    "chili", "ingwer", "vanille", "lorbeer", "dill", "petersilie",
    "schnittlauch", "majoran", "sojasauce", "essig", "senf", "ketchup",
    "worcestersauce", "tabasco", "sriracha", "tomatenmark",
  ],
  Vorrat: [
    "reis", "pasta", "spaghetti", "penne", "fusilli", "lasagne",
    "couscous", "bulgur", "haferflocken", "muesli", "nudel", "tortilla",
    "wrap", "dose", "kokosmilch", "passierte tomate",
  ],
};

const CATEGORY_STYLES: Record<string, { bg: string; border: string; text: string; chip: string }> = {
  Basics: {
    bg: "bg-amber-50 dark:bg-amber-950/20",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-800 dark:text-amber-200",
    chip: "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-700",
  },
  "Gemuese & Obst": {
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-800 dark:text-emerald-200",
    chip: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700",
  },
  "Fleisch & Fisch": {
    bg: "bg-red-50 dark:bg-red-950/20",
    border: "border-red-200 dark:border-red-800",
    text: "text-red-800 dark:text-red-200",
    chip: "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700",
  },
  Kuehlschrank: {
    bg: "bg-blue-50 dark:bg-blue-950/20",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-800 dark:text-blue-200",
    chip: "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700",
  },
  Gewuerze: {
    bg: "bg-orange-50 dark:bg-orange-950/20",
    border: "border-orange-200 dark:border-orange-800",
    text: "text-orange-800 dark:text-orange-200",
    chip: "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700",
  },
  Vorrat: {
    bg: "bg-violet-50 dark:bg-violet-950/20",
    border: "border-violet-200 dark:border-violet-800",
    text: "text-violet-800 dark:text-violet-200",
    chip: "bg-violet-100 dark:bg-violet-900/40 text-violet-800 dark:text-violet-200 border-violet-200 dark:border-violet-700",
  },
  Sonstiges: {
    bg: "bg-gray-50 dark:bg-gray-950/20",
    border: "border-gray-200 dark:border-gray-800",
    text: "text-gray-800 dark:text-gray-200",
    chip: "bg-gray-100 dark:bg-gray-900/40 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700",
  },
};

const CATEGORY_ORDER = [
  "Basics",
  "Gemuese & Obst",
  "Fleisch & Fisch",
  "Kuehlschrank",
  "Gewuerze",
  "Vorrat",
  "Sonstiges",
];

// All autocomplete suggestions (combined from quick-add + extra common items)
const ALL_SUGGESTIONS: string[] = [
  ...QUICK_ADD_BASICS,
  "Kartoffeln", "Karotten", "Paprika", "Tomaten", "Gurke", "Spinat",
  "Brokkoli", "Zucchini", "Aubergine", "Pilze", "Lauch", "Sellerie",
  "Rucola", "Mais", "Linsen", "Kichererbsen",
  "Haehnchen", "Hackfleisch", "Lachs", "Thunfisch", "Speck", "Schinken",
  "Kaese", "Joghurt", "Sahne", "Quark", "Mozzarella", "Parmesan",
  "Creme Fraiche", "Feta", "Tofu",
  "Oregano", "Basilikum", "Thymian", "Rosmarin", "Curry", "Kurkuma",
  "Chili", "Ingwer", "Zimt", "Paprikapulver",
  "Haferflocken", "Couscous", "Kokosmilch", "Spaghetti", "Penne",
  "Tortilla", "Passierte Tomaten", "Honig", "Ahornsirup",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Normalize for matching: lowercase, trim, remove common plural suffixes */
function normalize(str: string): string {
  let s = str.toLowerCase().trim();
  // Remove German plural endings, most specific first
  if (s.endsWith("en") && s.length > 3) s = s.slice(0, -2);
  else if (s.endsWith("n") && s.length > 2) s = s.slice(0, -1);
  else if (s.endsWith("s") && s.length > 2) s = s.slice(0, -1);
  else if (s.endsWith("e") && s.length > 2) s = s.slice(0, -1);
  // Replace umlauts for broader matching
  s = s.replace(/ae/g, "ae").replace(/oe/g, "oe").replace(/ue/g, "ue");
  s = s.replace(/\u00e4/g, "ae").replace(/\u00f6/g, "oe").replace(/\u00fc/g, "ue");
  s = s.replace(/\u00df/g, "ss");
  return s;
}

/** Extract just the ingredient name from a recipe ingredient string like "2 Tomaten, gewuerfel" */
function extractIngredientName(ingredient: RecipeIngredient): string {
  return ingredient.name;
}

/** Check if a pantry item matches a recipe ingredient */
function ingredientMatches(pantryItem: string, recipeIngredientName: string): boolean {
  const pNorm = normalize(pantryItem);
  const rNorm = normalize(recipeIngredientName);

  // Exact match after normalization
  if (pNorm === rNorm) return true;

  // One contains the other (partial match)
  if (rNorm.includes(pNorm) || pNorm.includes(rNorm)) return true;

  // Split compound words and check parts
  const rParts = rNorm.split(/[-\s]+/);
  const pParts = pNorm.split(/[-\s]+/);

  for (const pp of pParts) {
    for (const rp of rParts) {
      if (pp.length >= 3 && rp.length >= 3 && (rp.includes(pp) || pp.includes(rp))) {
        return true;
      }
    }
  }

  return false;
}

/** Detect which pantry category an ingredient belongs to */
function detectCategory(itemName: string): string {
  const lower = itemName.toLowerCase();
  const norm = normalize(itemName);

  for (const [category, keywords] of Object.entries(PANTRY_CATEGORIES)) {
    for (const keyword of keywords) {
      const kwNorm = normalize(keyword);
      if (lower.includes(keyword) || norm.includes(kwNorm) || kwNorm.includes(norm)) {
        return category;
      }
    }
  }
  return "Sonstiges";
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

/** Display name for categories (with proper umlauts) */
const CATEGORY_DISPLAY: Record<string, string> = {
  Basics: "Basics",
  "Gemuese & Obst": "Gem\u00fcse & Obst",
  "Fleisch & Fisch": "Fleisch & Fisch",
  Kuehlschrank: "K\u00fchlschrank",
  Gewuerze: "Gew\u00fcrze",
  Vorrat: "Vorrat",
  Sonstiges: "Sonstiges",
};

// ---------------------------------------------------------------------------
// Shopping list helper types
// ---------------------------------------------------------------------------

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

// ===========================================================================
// Page Component
// ===========================================================================

export default function PantryPage() {
  // -----------------------------------------------------------------------
  // State
  // -----------------------------------------------------------------------
  const [pantryItems, setPantryItems] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recipeMatches, setRecipeMatches] = useState<PantryRecipeMatch[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // External recipe state
  const [showExternal, setShowExternal] = useState(true);
  const [externalRecipes, setExternalRecipes] = useState<RecipeSuggestion[]>([]);
  const [isLoadingExternal, setIsLoadingExternal] = useState(false);
  const [externalAvailable, setExternalAvailable] = useState<boolean | null>(null);
  const [selectedExternalRecipe, setSelectedExternalRecipe] = useState<RecipeSuggestion | null>(null);
  const [recipeDetail, setRecipeDetail] = useState<RecipeDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // -----------------------------------------------------------------------
  // Persistence
  // -----------------------------------------------------------------------
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPantryItems(JSON.parse(stored) as string[]);
      }
    } catch {
      // ignore
    }
  }, []);

  const savePantry = useCallback((items: string[]) => {
    setPantryItems(items);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, []);

  // -----------------------------------------------------------------------
  // Add / Remove
  // -----------------------------------------------------------------------
  const addItem = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      // Don't add duplicates (case-insensitive)
      if (pantryItems.some((i) => i.toLowerCase() === trimmed.toLowerCase())) {
        toast.info(`"${trimmed}" ist bereits in deinem Vorrat`);
        return;
      }
      const updated = [...pantryItems, trimmed];
      savePantry(updated);
      setInputValue("");
      setShowSuggestions(false);
      toast.success(`"${trimmed}" hinzugef\u00fcgt`);
    },
    [pantryItems, savePantry]
  );

  const removeItem = useCallback(
    (name: string) => {
      const updated = pantryItems.filter((i) => i !== name);
      savePantry(updated);
    },
    [pantryItems, savePantry]
  );

  const clearAll = useCallback(() => {
    savePantry([]);
    setRecipeMatches([]);
    setExternalRecipes([]);
    setHasSearched(false);
    toast.success("Vorrat geleert");
  }, [savePantry]);

  // -----------------------------------------------------------------------
  // Input handling
  // -----------------------------------------------------------------------
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addItem(inputValue);
      }
    },
    [addItem, inputValue]
  );

  // Click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Autocomplete filtering
  const filteredSuggestions = useMemo(() => {
    if (!inputValue.trim()) return [];
    const lower = inputValue.toLowerCase();
    return ALL_SUGGESTIONS.filter(
      (s) =>
        s.toLowerCase().includes(lower) &&
        !pantryItems.some((p) => p.toLowerCase() === s.toLowerCase())
    ).slice(0, 8);
  }, [inputValue, pantryItems]);

  // -----------------------------------------------------------------------
  // Group pantry items by category
  // -----------------------------------------------------------------------
  const groupedItems = useMemo(() => {
    const groups: Record<string, string[]> = {};
    for (const item of pantryItems) {
      const cat = detectCategory(item);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    }
    // Sort by CATEGORY_ORDER
    const sorted: { category: string; items: string[] }[] = [];
    for (const cat of CATEGORY_ORDER) {
      if (groups[cat] && groups[cat].length > 0) {
        sorted.push({ category: cat, items: groups[cat] });
      }
    }
    return sorted;
  }, [pantryItems]);

  // -----------------------------------------------------------------------
  // External recipe search
  // -----------------------------------------------------------------------
  const fetchExternalRecipes = useCallback(async (items: string[]) => {
    if (!showExternal || items.length === 0) return;
    setIsLoadingExternal(true);
    try {
      const ingredientsParam = items.join(",");
      const res = await fetch(
        `/api/suggest-recipes?ingredients=${encodeURIComponent(ingredientsParam)}&count=12`
      );
      if (!res.ok) {
        setExternalAvailable(false);
        return;
      }
      const data = (await res.json()) as {
        recipes: RecipeSuggestion[];
        source: string;
        message?: string;
      };
      if (data.source === "none") {
        // API key not configured
        setExternalAvailable(false);
        setExternalRecipes([]);
      } else {
        setExternalAvailable(true);
        setExternalRecipes(data.recipes);
      }
    } catch {
      setExternalAvailable(false);
    } finally {
      setIsLoadingExternal(false);
    }
  }, [showExternal]);

  // -----------------------------------------------------------------------
  // Recipe matching
  // -----------------------------------------------------------------------
  const findRecipes = useCallback(async () => {
    if (pantryItems.length === 0) {
      toast.error("F\u00fcge zuerst Zutaten zu deinem Vorrat hinzu");
      return;
    }

    setIsLoadingRecipes(true);
    setHasSearched(true);

    // Fire external search in parallel
    fetchExternalRecipes(pantryItems);

    try {
      // Step 1: Fetch all recipe results (list endpoint)
      const listRes = await fetch("/api/results?contentType=recipe&limit=100");
      if (!listRes.ok) throw new Error("Failed to fetch recipes");
      const listData = (await listRes.json()) as { results: RecipeResultItem[] };
      const recipeList = listData.results ?? [];

      if (recipeList.length === 0) {
        setRecipeMatches([]);
        setIsLoadingRecipes(false);
        return;
      }

      // Step 2: Fetch full details for each recipe (in parallel, max 20)
      const toFetch = recipeList.slice(0, 20);
      const fullResults = await Promise.all(
        toFetch.map(async (r) => {
          try {
            const res = await fetch(`/api/results/${r.id}`);
            if (!res.ok) return null;
            return (await res.json()) as RecipeFullResult;
          } catch {
            return null;
          }
        })
      );

      // Step 3: Compare ingredients
      const matches: PantryRecipeMatch[] = [];

      for (const result of fullResults) {
        if (!result) continue;
        if (result.structuredOutput.contentType !== "recipe") continue;

        const recipeOutput = result.structuredOutput;
        const recipeIngredients = recipeOutput.ingredients;
        const totalIngredients = recipeIngredients.length;

        if (totalIngredients === 0) continue;

        let matchedCount = 0;
        const missingIngredients: string[] = [];

        for (const ri of recipeIngredients) {
          const ingredientName = extractIngredientName(ri);
          const found = pantryItems.some((pantryItem) =>
            ingredientMatches(pantryItem, ingredientName)
          );
          if (found) {
            matchedCount++;
          } else {
            missingIngredients.push(ingredientName);
          }
        }

        const matchPercent = Math.round((matchedCount / totalIngredients) * 100);

        matches.push({
          id: result.id,
          title: recipeOutput.title,
          thumbnailUrl: result.thumbnailUrl,
          ingredients: recipeIngredients,
          totalIngredients,
          matchedCount,
          missingIngredients,
          matchPercent,
        });
      }

      // Sort: best matches first
      matches.sort((a, b) => b.matchPercent - a.matchPercent);

      setRecipeMatches(matches);
    } catch (err) {
      console.error("Recipe matching error:", err);
      toast.error("Rezepte konnten nicht geladen werden");
    } finally {
      setIsLoadingRecipes(false);
    }
  }, [pantryItems, fetchExternalRecipes]);

  // -----------------------------------------------------------------------
  // Fetch external recipe detail
  // -----------------------------------------------------------------------
  const openExternalRecipe = useCallback(async (recipe: RecipeSuggestion) => {
    setSelectedExternalRecipe(recipe);
    setRecipeDetail(null);
    setIsLoadingDetail(true);
    try {
      const res = await fetch(`/api/suggest-recipes/${recipe.id}`);
      if (!res.ok) throw new Error("Failed to load recipe detail");
      const data = (await res.json()) as { recipe: RecipeDetail };
      setRecipeDetail(data.recipe);
    } catch {
      toast.error("Rezeptdetails konnten nicht geladen werden");
      setSelectedExternalRecipe(null);
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  const closeDetailModal = useCallback(() => {
    setSelectedExternalRecipe(null);
    setRecipeDetail(null);
  }, []);

  // -----------------------------------------------------------------------
  // Add missing ingredients to shopping list
  // -----------------------------------------------------------------------
  const addMissingToShoppingList = useCallback((missingIngredients: string[], recipeTitle: string) => {
    try {
      const stored = localStorage.getItem(SHOPPING_LIST_STORAGE_KEY);
      const lists: ShoppingList[] = stored ? JSON.parse(stored) : [];

      let targetList = lists[0];
      if (!targetList) {
        targetList = {
          id: generateId(),
          name: "Wocheneinkauf",
          items: [],
          createdAt: new Date().toISOString(),
        };
        lists.push(targetList);
      }

      const existingNames = new Set(
        targetList.items.map((item) => item.name.toLowerCase())
      );
      let addedCount = 0;

      for (const name of missingIngredients) {
        if (!existingNames.has(name.toLowerCase())) {
          targetList.items.push({
            id: generateId(),
            name,
            category: "Sonstiges",
            quantity: "",
            checked: false,
          });
          existingNames.add(name.toLowerCase());
          addedCount++;
        }
      }

      localStorage.setItem(SHOPPING_LIST_STORAGE_KEY, JSON.stringify(lists));
      toast.success(
        `${addedCount} fehlende Zutaten f\u00fcr "${recipeTitle}" zur Einkaufsliste hinzugef\u00fcgt`
      );
    } catch {
      toast.error("Einkaufsliste konnte nicht aktualisiert werden");
    }
  }, []);

  // -----------------------------------------------------------------------
  // Derived data
  // -----------------------------------------------------------------------
  const almostReadyRecipes = useMemo(
    () => recipeMatches.filter((m) => m.missingIngredients.length <= 2 && m.missingIngredients.length > 0),
    [recipeMatches]
  );

  const perfectMatches = useMemo(
    () => recipeMatches.filter((m) => m.missingIngredients.length === 0),
    [recipeMatches]
  );

  // Match badge color
  function getMatchColor(percent: number): string {
    if (percent >= 80) return "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200";
    if (percent >= 50) return "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200";
    return "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200";
  }

  function getMatchRing(percent: number): string {
    if (percent >= 80) return "ring-emerald-300 dark:ring-emerald-700";
    if (percent >= 50) return "ring-amber-300 dark:ring-amber-700";
    return "ring-red-300 dark:ring-red-700";
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <PageTransition className="container max-w-2xl py-6 px-4 sm:py-10">
      {/* ================================================================= */}
      {/* HEADER                                                            */}
      {/* ================================================================= */}
      <div className="mb-8 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-200 dark:shadow-orange-900/30"
        >
          <Refrigerator className="h-8 w-8 text-white" />
        </motion.div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Mein Vorrat
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Was hast du zuhause? Finde passende Rezepte.
        </p>
      </div>

      {/* ================================================================= */}
      {/* QUICK ADD BAR                                                     */}
      {/* ================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Card>
          <CardContent className="p-4">
            {/* Search input */}
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={handleKeyDown}
                  placeholder="Zutat hinzuf\u00fcgen..."
                  className="h-12 pl-10 pr-12 text-base"
                />
                {inputValue && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2"
                    onClick={() => addItem(inputValue)}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                )}
              </div>

              {/* Autocomplete dropdown */}
              <AnimatePresence>
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <motion.div
                    ref={suggestionsRef}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border bg-background shadow-lg"
                  >
                    {filteredSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted"
                        onClick={() => addItem(suggestion)}
                      >
                        <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                        {suggestion}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick-add chips */}
            <div className="mt-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Schnell hinzuf\u00fcgen
              </p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_ADD_BASICS.map((item) => {
                  const isInPantry = pantryItems.some(
                    (p) => p.toLowerCase() === item.toLowerCase()
                  );
                  return (
                    <motion.button
                      key={item}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => (isInPantry ? removeItem(item) : addItem(item))}
                      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                        isInPantry
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      {isInPantry ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Plus className="h-3 w-3" />
                      )}
                      {item}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ================================================================= */}
      {/* MY PANTRY                                                         */}
      {/* ================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Package className="h-5 w-5 text-primary" />
            Mein Vorrat
            {pantryItems.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {pantryItems.length}
              </Badge>
            )}
          </h2>
          {pantryItems.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs text-muted-foreground hover:text-destructive"
              onClick={clearAll}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Alles l\u00f6schen
            </Button>
          )}
        </div>

        {pantryItems.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Dein Vorrat ist leer
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                F\u00fcge Zutaten hinzu, die du zuhause hast
              </p>
            </CardContent>
          </Card>
        ) : (
          <StaggerContainer className="space-y-3">
            {groupedItems.map(({ category, items }) => {
              const defaultStyle = { bg: "bg-gray-50 dark:bg-gray-950/20", border: "border-gray-200 dark:border-gray-800", text: "text-gray-800 dark:text-gray-200", chip: "bg-gray-100 dark:bg-gray-900/40 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700" };
              const style = CATEGORY_STYLES[category] ?? defaultStyle;
              const displayName = CATEGORY_DISPLAY[category] ?? category;
              return (
                <StaggerItem key={category}>
                  <Card className={`border ${style.border}`}>
                    <CardHeader className="px-4 py-3 pb-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-semibold ${style.text}`}>
                          {displayName}
                        </span>
                        <Badge variant="secondary" className="text-[10px]">
                          {items.length}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-3 pt-0">
                      <div className="flex flex-wrap gap-1.5">
                        <AnimatePresence mode="popLayout">
                          {items.map((item) => (
                            <motion.button
                              key={item}
                              layout
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              type="button"
                              onClick={() => removeItem(item)}
                              className={`group inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all hover:shadow-sm ${style.chip}`}
                              title={`"${item}" entfernen`}
                            >
                              {item}
                              <X className="h-3 w-3 opacity-50 transition-opacity group-hover:opacity-100" />
                            </motion.button>
                          ))}
                        </AnimatePresence>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        )}
      </motion.div>

      {/* ================================================================= */}
      {/* ONLINE SEARCH TOGGLE                                              */}
      {/* ================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mb-4"
      >
        <button
          type="button"
          onClick={() => setShowExternal((prev) => !prev)}
          className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
            showExternal
              ? "border-primary/30 bg-primary/5 text-primary"
              : "border-border bg-background text-muted-foreground hover:border-primary/20"
          }`}
        >
          <span className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Durchstöbere das Internet
          </span>
          <div
            className={`relative h-6 w-11 rounded-full transition-colors ${
              showExternal ? "bg-primary" : "bg-muted"
            }`}
          >
            <motion.div
              className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm"
              animate={{ left: showExternal ? 22 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </div>
        </button>
      </motion.div>

      {/* ================================================================= */}
      {/* FIND RECIPES BUTTON                                               */}
      {/* ================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <Button
          size="lg"
          className="w-full gap-2 text-base shadow-lg shadow-primary/20"
          onClick={findRecipes}
          disabled={isLoadingRecipes || pantryItems.length === 0}
        >
          {isLoadingRecipes ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-5 w-5" />
              </motion.div>
              Rezepte werden gesucht...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Rezepte finden
            </>
          )}
        </Button>
      </motion.div>

      {/* ================================================================= */}
      {/* RECIPE MATCHES                                                    */}
      {/* ================================================================= */}
      <AnimatePresence mode="wait">
        {hasSearched && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {recipeMatches.length === 0 && !isLoadingRecipes ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <ChefHat className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Keine gespeicherten Rezepte gefunden
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    Analysiere zuerst ein paar Rezept-Videos, dann kannst du hier sehen,
                    was du damit kochen kannst.
                  </p>
                  <Button variant="outline" size="sm" className="mt-4 gap-1.5" asChild>
                    <Link href="/app/new">
                      <ChefHat className="h-4 w-4" />
                      Rezept analysieren
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Aus deinen gespeicherten Videos</h2>
                {/* Perfect matches */}
                {perfectMatches.length > 0 && (
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                      <Check className="h-4 w-4" />
                      Alles da - sofort kochbar!
                      <Badge variant="success" className="text-[10px]">
                        {perfectMatches.length}
                      </Badge>
                    </h3>
                    <StaggerContainer className="space-y-3">
                      {perfectMatches.map((match) => (
                        <StaggerItem key={match.id}>
                          <RecipeMatchCard
                            match={match}
                            getMatchColor={getMatchColor}
                            getMatchRing={getMatchRing}
                            onAddToShoppingList={addMissingToShoppingList}
                          />
                        </StaggerItem>
                      ))}
                    </StaggerContainer>
                  </div>
                )}

                {/* Almost ready */}
                {almostReadyRecipes.length > 0 && (
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-400">
                      <Sparkles className="h-4 w-4" />
                      Fast alles da
                      <Badge variant="warning" className="text-[10px]">
                        {almostReadyRecipes.length}
                      </Badge>
                    </h3>
                    <StaggerContainer className="space-y-3">
                      {almostReadyRecipes.map((match) => (
                        <StaggerItem key={match.id}>
                          <RecipeMatchCard
                            match={match}
                            getMatchColor={getMatchColor}
                            getMatchRing={getMatchRing}
                            onAddToShoppingList={addMissingToShoppingList}
                          />
                        </StaggerItem>
                      ))}
                    </StaggerContainer>
                  </div>
                )}

                {/* All matches */}
                {recipeMatches.filter(
                  (m) => m.missingIngredients.length > 2
                ).length > 0 && (
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                      <ChefHat className="h-4 w-4" />
                      Weitere Rezepte
                    </h3>
                    <StaggerContainer className="space-y-3">
                      {recipeMatches
                        .filter((m) => m.missingIngredients.length > 2)
                        .map((match) => (
                          <StaggerItem key={match.id}>
                            <RecipeMatchCard
                              match={match}
                              getMatchColor={getMatchColor}
                              getMatchRing={getMatchRing}
                              onAddToShoppingList={addMissingToShoppingList}
                            />
                          </StaggerItem>
                        ))}
                    </StaggerContainer>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* EXTERNAL RECIPE SUGGESTIONS (Spoonacular)                         */}
      {/* ================================================================= */}
      {hasSearched && showExternal && externalAvailable !== false && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="mt-10"
        >
          <div className="mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Rezepte aus dem Internet</h2>
          </div>

          {isLoadingExternal ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ExternalRecipeSkeleton key={i} />
              ))}
            </div>
          ) : externalRecipes.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Globe className="mb-2 h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Keine Online-Rezepte gefunden
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {externalRecipes.map((recipe, index) => (
                  <motion.div
                    key={recipe.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.05 }}
                  >
                    <ExternalRecipeCard
                      recipe={recipe}
                      onClick={() => openExternalRecipe(recipe)}
                    />
                  </motion.div>
                ))}
              </div>
              <p className="mt-4 text-center text-[11px] text-muted-foreground/60">
              </p>
            </>
          )}
        </motion.div>
      )}

      {/* ================================================================= */}
      {/* EXTERNAL RECIPE DETAIL MODAL                                      */}
      {/* ================================================================= */}
      <AnimatePresence>
        {selectedExternalRecipe && (
          <RecipeDetailModal
            recipe={selectedExternalRecipe}
            detail={recipeDetail}
            isLoading={isLoadingDetail}
            onClose={closeDetailModal}
            onAddToShoppingList={addMissingToShoppingList}
          />
        )}
      </AnimatePresence>
    </PageTransition>
  );
}

// ===========================================================================
// RecipeMatchCard (existing)
// ===========================================================================

function RecipeMatchCard({
  match,
  getMatchColor,
  getMatchRing,
  onAddToShoppingList,
}: {
  match: PantryRecipeMatch;
  getMatchColor: (percent: number) => string;
  getMatchRing: (percent: number) => string;
  onAddToShoppingList: (missing: string[], title: string) => void;
}) {
  const [showMissing, setShowMissing] = useState(false);

  return (
    <motion.div layout>
      <Card className={`overflow-hidden transition-shadow hover:shadow-md ${match.missingIngredients.length === 0 ? "border-emerald-200 dark:border-emerald-800" : ""}`}>
        <Link href={`/app/results/${match.id}`} className="block">
          <div className="flex items-stretch">
            {/* Thumbnail */}
            {match.thumbnailUrl && (
              <div className="hidden w-24 shrink-0 sm:block">
                <img
                  src={match.thumbnailUrl}
                  alt={match.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="flex flex-1 flex-col justify-center p-4">
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-sm font-semibold leading-tight line-clamp-2">
                  {match.title}
                </h4>
                <div
                  className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${getMatchColor(match.matchPercent)} ${getMatchRing(match.matchPercent)}`}
                >
                  {match.matchedCount}/{match.totalIngredients}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-2.5">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${match.matchPercent}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      match.matchPercent >= 80
                        ? "bg-emerald-500"
                        : match.matchPercent >= 50
                          ? "bg-amber-500"
                          : "bg-red-400"
                    }`}
                  />
                </div>
              </div>

              {/* Missing preview */}
              {match.missingIngredients.length > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Fehlt:{" "}
                  <span className="font-medium text-foreground/70">
                    {match.missingIngredients.slice(0, 3).join(", ")}
                    {match.missingIngredients.length > 3 &&
                      ` +${match.missingIngredients.length - 3} mehr`}
                  </span>
                </p>
              )}
            </div>
          </div>
        </Link>

        {/* Action area (outside the link) */}
        {match.missingIngredients.length > 0 && (
          <div className="border-t px-4 py-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowMissing(!showMissing)}
                className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {showMissing
                  ? "Weniger anzeigen"
                  : `${match.missingIngredients.length} fehlende Zutaten`}
              </button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={() =>
                  onAddToShoppingList(match.missingIngredients, match.title)
                }
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                Zur Einkaufsliste
              </Button>
            </div>

            <AnimatePresence>
              {showMissing && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {match.missingIngredients.map((ingredient) => (
                      <span
                        key={ingredient}
                        className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

// ===========================================================================
// ExternalRecipeCard
// ===========================================================================

function ExternalRecipeCard({
  recipe,
  onClick,
}: {
  recipe: RecipeSuggestion;
  onClick: () => void;
}) {
  const badgeColor =
    recipe.matchPercent >= 80
      ? "bg-emerald-500 text-white"
      : recipe.matchPercent >= 50
        ? "bg-amber-500 text-white"
        : "bg-red-400 text-white";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left"
    >
      <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5">
        {/* Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          <Image
            src={recipe.image}
            alt={recipe.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, 33vw"
          />
          {/* Match badge overlay */}
          <div className="absolute right-2 top-2">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold shadow-sm ${badgeColor}`}
            >
              {recipe.usedCount}/{recipe.totalCount} Zutaten
            </span>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-3">
          <h4 className="text-xs font-semibold leading-tight line-clamp-2 sm:text-sm">
            {recipe.title}
          </h4>

          {/* Missing ingredients */}
          {recipe.missingIngredients.length > 0 && (
            <p className="mt-1.5 text-[10px] leading-snug text-muted-foreground line-clamp-2">
              Fehlt: {recipe.missingIngredients.slice(0, 3).join(", ")}
              {recipe.missingIngredients.length > 3 &&
                ` +${recipe.missingIngredients.length - 3}`}
            </p>
          )}

          {/* Match progress */}
          <div className="mt-2">
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${
                  recipe.matchPercent >= 80
                    ? "bg-emerald-500"
                    : recipe.matchPercent >= 50
                      ? "bg-amber-500"
                      : "bg-red-400"
                }`}
                style={{ width: `${recipe.matchPercent}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}

// ===========================================================================
// ExternalRecipeSkeleton
// ===========================================================================

function ExternalRecipeSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-[4/3] w-full animate-pulse bg-muted" />
      <CardContent className="p-3 space-y-2">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-1 w-full animate-pulse rounded-full bg-muted" />
      </CardContent>
    </Card>
  );
}

// ===========================================================================
// RecipeDetailModal
// ===========================================================================

function RecipeDetailModal({
  recipe,
  detail,
  isLoading,
  onClose,
  onAddToShoppingList,
}: {
  recipe: RecipeSuggestion;
  detail: RecipeDetail | null;
  isLoading: boolean;
  onClose: () => void;
  onAddToShoppingList: (missing: string[], title: string) => void;
}) {
  // Close on Escape
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet sliding up from bottom */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-2xl bg-background shadow-2xl"
      >
        {/* Drag indicator */}
        <div className="sticky top-0 z-10 flex justify-center bg-background pb-2 pt-3">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted-foreground/20"
        >
          <X className="h-4 w-4" />
        </button>

        {isLoading ? (
          <div className="space-y-4 p-6">
            {/* Image skeleton */}
            <div className="aspect-video w-full animate-pulse rounded-xl bg-muted" />
            <div className="h-6 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-3 w-full animate-pulse rounded bg-muted" />
              ))}
            </div>
          </div>
        ) : detail ? (
          <div className="px-6 pb-8">
            {/* Hero image */}
            <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-xl">
              <Image
                src={detail.image}
                alt={detail.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 672px"
              />
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold leading-tight sm:text-2xl">
              {detail.title}
            </h2>

            {/* Meta badges */}
            <div className="mt-3 flex flex-wrap gap-2">
              {detail.servings > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {detail.servings} Portionen
                </span>
              )}
              {detail.prepTime && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Vorbereitung: {detail.prepTime}
                </span>
              )}
              {detail.cookTime && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Kochen: {detail.cookTime}
                </span>
              )}
              {detail.cuisines.map((c) => (
                <Badge key={c} variant="secondary" className="text-xs">
                  {c}
                </Badge>
              ))}
              {detail.diets.map((d) => (
                <Badge key={d} variant="outline" className="text-xs">
                  {d}
                </Badge>
              ))}
            </div>

            {/* Nutrition */}
            {detail.nutrition.calories !== null && (
              <div className="mt-5">
                <h3 className="mb-2 text-sm font-semibold">N\u00e4hrwerte</h3>
                <div className="grid grid-cols-5 gap-2">
                  <NutritionPill
                    icon={<Flame className="h-3.5 w-3.5" />}
                    label="kcal"
                    value={detail.nutrition.calories}
                    color="text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/30"
                  />
                  <NutritionPill
                    icon={<Dumbbell className="h-3.5 w-3.5" />}
                    label="Protein"
                    value={detail.nutrition.protein}
                    unit="g"
                    color="text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30"
                  />
                  <NutritionPill
                    icon={<Wheat className="h-3.5 w-3.5" />}
                    label="Carbs"
                    value={detail.nutrition.carbs}
                    unit="g"
                    color="text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30"
                  />
                  <NutritionPill
                    icon={<Droplets className="h-3.5 w-3.5" />}
                    label="Fett"
                    value={detail.nutrition.fat}
                    unit="g"
                    color="text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/30"
                  />
                  <NutritionPill
                    icon={<Leaf className="h-3.5 w-3.5" />}
                    label="Ballaststoffe"
                    value={detail.nutrition.fiber}
                    unit="g"
                    color="text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30"
                  />
                </div>
              </div>
            )}

            {/* Ingredients */}
            <div className="mt-5">
              <h3 className="mb-2 text-sm font-semibold">
                Zutaten ({detail.ingredients.length})
              </h3>
              <ul className="space-y-1.5">
                {detail.ingredients.map((ing, idx) => {
                  const isMissing = recipe.missingIngredients.some(
                    (m) => m.toLowerCase() === ing.name.toLowerCase()
                  );
                  return (
                    <li
                      key={idx}
                      className={`flex items-start gap-2 rounded-lg px-3 py-1.5 text-sm ${
                        isMissing
                          ? "bg-red-50 dark:bg-red-950/20"
                          : "bg-emerald-50/50 dark:bg-emerald-950/10"
                      }`}
                    >
                      <span className="mt-0.5">
                        {isMissing ? (
                          <X className="h-3.5 w-3.5 text-red-500" />
                        ) : (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        )}
                      </span>
                      <span className={isMissing ? "text-red-700 dark:text-red-300" : ""}>
                        {ing.original}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Steps */}
            {detail.steps.length > 0 && (
              <div className="mt-5">
                <h3 className="mb-2 text-sm font-semibold">Zubereitung</h3>
                <ol className="space-y-3">
                  {detail.steps.map((step, idx) => (
                    <li key={idx} className="flex gap-3 text-sm">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed text-foreground/80">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {recipe.missingIngredients.length > 0 && (
                <Button
                  className="flex-1 gap-2"
                  onClick={() => {
                    onAddToShoppingList(recipe.missingIngredients, recipe.title);
                  }}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Zur Einkaufsliste ({recipe.missingIngredients.length} fehlend)
                </Button>
              )}
              {detail.sourceUrl && (
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  asChild
                >
                  <a
                    href={detail.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Originalrezept
                  </a>
                </Button>
              )}
            </div>

            {/* Source attribution */}
            <p className="mt-6 text-center text-[11px] text-muted-foreground/50">
              {detail.source ? ` \u00b7 Quelle: ${detail.source}` : ""}
            </p>
          </div>
        ) : null}
      </motion.div>
    </>
  );
}

// ===========================================================================
// NutritionPill
// ===========================================================================

function NutritionPill({
  icon,
  label,
  value,
  unit,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | null;
  unit?: string;
  color: string;
}) {
  if (value === null) return null;

  return (
    <div
      className={`flex flex-col items-center rounded-xl px-1.5 py-2 text-center ${color}`}
    >
      {icon}
      <span className="mt-1 text-xs font-bold leading-none">
        {Math.round(value)}
        {unit ?? ""}
      </span>
      <span className="mt-0.5 text-[9px] leading-none opacity-70">{label}</span>
    </div>
  );
}
