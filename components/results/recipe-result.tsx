"use client";

import { useState, useMemo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChefHat,
  Leaf,
  ShoppingCart,
  Check,
  Plus,
  Minus,
  ExternalLink,
  Play,
  Heart,
  CalendarDays,
  AlertTriangle,
  MoreVertical,
  Share2,
  Printer,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { RecipeOutput, RecipeIngredient } from "@/types";
import { getIngredientEmoji } from "@/lib/utils/ingredient-emojis";

// ---------------------------------------------------------------------------
// Types & Constants
// ---------------------------------------------------------------------------

interface RecipeResultProps {
  output: RecipeOutput;
  thumbnailUrl?: string | null;
  sourceCreator?: string | null;
  sourceUrl?: string | null;
  resultId?: string;
}

type TabId = "zutaten" | "zubereitung";

const SHOPPING_LIST_STORAGE_KEY = "cta-shopping-lists";
const FAVORITES_STORAGE_KEY = "cta-favorites";

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
// Helpers
// ---------------------------------------------------------------------------

function generateId(): string {
  return crypto.randomUUID();
}

function parseServingsNumber(servings: string | null): number {
  if (!servings) return 4;
  const match = servings.match(/(\d+)/);
  return match && match[1] ? parseInt(match[1], 10) : 4;
}

function parseIngredientAmount(amount: string | null): number | null {
  if (!amount) return null;
  const fractionMatch = amount.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (fractionMatch && fractionMatch[1] && fractionMatch[2]) {
    return parseInt(fractionMatch[1], 10) / parseInt(fractionMatch[2], 10);
  }
  const mixedMatch = amount.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixedMatch && mixedMatch[1] && mixedMatch[2] && mixedMatch[3]) {
    return (
      parseInt(mixedMatch[1], 10) +
      parseInt(mixedMatch[2], 10) / parseInt(mixedMatch[3], 10)
    );
  }
  const rangeMatch = amount.match(/^(\d+(?:[.,]\d+)?)/);
  if (rangeMatch && rangeMatch[1]) {
    return parseFloat(rangeMatch[1].replace(",", "."));
  }
  return null;
}

function formatScaledAmount(
  originalAmount: string | null,
  scale: number
): string | null {
  if (!originalAmount) return null;
  const parsed = parseIngredientAmount(originalAmount);
  if (parsed === null) return originalAmount;
  const scaled = parsed * scale;
  if (Number.isInteger(scaled)) return scaled.toString();
  return scaled.toFixed(1).replace(/\.0$/, "");
}

function detectPlatform(
  url: string | null | undefined
): "instagram" | "tiktok" | "youtube" | null {
  if (!url) return null;
  if (url.includes("instagram")) return "instagram";
  if (url.includes("tiktok")) return "tiktok";
  if (url.includes("youtube") || url.includes("youtu.be")) return "youtube";
  return null;
}

function PlatformIcon({ platform }: { platform: "instagram" | "tiktok" | "youtube" }) {
  if (platform === "instagram") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    );
  }
  if (platform === "tiktok") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13.2a8.16 8.16 0 005.58 2.17V12a4.83 4.83 0 01-5.58-1.06V2h3.45a4.83 4.83 0 004.13 4.69v3.5a8.27 8.27 0 01-2-.5z" />
      </svg>
    );
  }
  // youtube
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram:
    "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400",
  tiktok: "bg-black",
  youtube: "bg-red-600",
};

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function IngredientRow({
  ingredient,
  scale,
}: {
  ingredient: RecipeIngredient;
  scale: number;
}) {
  const scaledAmount = formatScaledAmount(ingredient.amount, scale);
  const emoji = getIngredientEmoji(ingredient.name);

  return (
    <div className="flex items-center gap-3 py-3 border-b border-muted/40 last:border-0">
      <span className="text-lg w-7 text-center shrink-0" aria-hidden="true">
        {emoji}
      </span>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-foreground">
          {ingredient.name}
        </span>
        {ingredient.notes && (
          <span className="text-xs text-muted-foreground ml-1.5">
            ({ingredient.notes})
          </span>
        )}
      </div>
      {(scaledAmount || ingredient.unit) && (
        <span className="text-sm font-semibold text-foreground tabular-nums whitespace-nowrap shrink-0">
          {scaledAmount}
          {ingredient.unit ? ` ${ingredient.unit}` : ""}
        </span>
      )}
    </div>
  );
}

function StepRow({
  step,
  index,
  checked,
  onToggle,
}: {
  step: string;
  index: number;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex w-full items-start gap-4 py-4 border-b border-muted/40 last:border-0 text-left active:bg-muted/30 transition-colors"
      aria-label={`Schritt ${index + 1}: ${checked ? "erledigt" : "nicht erledigt"}`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all ${
          checked
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {checked ? <Check className="h-4 w-4" /> : index + 1}
      </div>
      <p
        className={`flex-1 pt-1 text-sm leading-relaxed transition-colors ${
          checked ? "text-muted-foreground line-through" : "text-foreground"
        }`}
      >
        {step}
      </p>
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// Bottom Sheet (Options Menu)
// ---------------------------------------------------------------------------

function OptionsSheet({
  open,
  onClose,
  onShare,
  onPrint,
}: {
  open: boolean;
  onClose: () => void;
  onShare: () => void;
  onPrint: () => void;
}) {
  if (!open) return null;

  const options = [
    { icon: Share2, label: "Rezept teilen", action: onShare },
    { icon: Printer, label: "Rezept drucken", action: onPrint },
  ];

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-background p-6 pb-10 shadow-2xl"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted-foreground/30" />
        <div className="space-y-1">
          {options.map((opt) => (
            <button
              key={opt.label}
              onClick={() => {
                opt.action();
                onClose();
              }}
              className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left transition-colors hover:bg-muted/60 active:bg-muted"
            >
              <opt.icon className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full rounded-xl bg-muted py-3.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted/80 active:bg-muted/60"
        >
          Abbrechen
        </button>
      </motion.div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function RecipeResult({
  output,
  thumbnailUrl,
  sourceCreator,
  sourceUrl,
  resultId,
}: RecipeResultProps) {
  // -- State ----------------------------------------------------------------
  const baseServings = parseServingsNumber(output.servings);
  const [portions, setPortions] = useState(baseServings);
  const scale = portions / baseServings;

  const [activeTab, setActiveTab] = useState<TabId>("zutaten");
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(
    () => new Set()
  );
  const [isFavorite, setIsFavorite] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // -- Platform detection ---------------------------------------------------
  const platform = useMemo(() => detectPlatform(sourceUrl), [sourceUrl]);

  // -- Ingredient grouping --------------------------------------------------
  const ingredientGroups = useMemo(() => {
    if (output.shoppingList.length > 0) {
      // Build a lookup: ingredient name -> category
      const categoryMap = new Map<string, string>();
      for (const group of output.shoppingList) {
        for (const item of group.items) {
          categoryMap.set(item.toLowerCase(), group.category);
        }
      }
      // Group ingredients
      const groups = new Map<string, RecipeIngredient[]>();
      for (const ing of output.ingredients) {
        const cat = categoryMap.get(ing.name.toLowerCase()) ?? "Hauptzutaten";
        const existing = groups.get(cat) ?? [];
        existing.push(ing);
        groups.set(cat, existing);
      }
      return Array.from(groups.entries());
    }
    return [["Hauptzutaten", output.ingredients]] as [
      string,
      RecipeIngredient[],
    ][];
  }, [output.ingredients, output.shoppingList]);

  // -- Meta pills -----------------------------------------------------------
  const metaPills = useMemo(() => {
    const pills: { emoji: string; label: string }[] = [];
    const totalTime = output.cookTime ?? output.prepTime;
    if (totalTime) pills.push({ emoji: "\u23F1", label: totalTime });
    if (output.mealCategory)
      pills.push({ emoji: "\uD83C\uDF7D\uFE0F", label: output.mealCategory });
    if (
      output.nutritionHighlights.some((h) =>
        h.toLowerCase().includes("vegetar")
      )
    ) {
      pills.push({ emoji: "\uD83C\uDF3F", label: "Vegetarisch" });
    } else if (
      output.nutritionHighlights.some((h) => h.toLowerCase().includes("vegan"))
    ) {
      pills.push({ emoji: "\uD83C\uDF31", label: "Vegan" });
    }
    if (output.cuisine)
      pills.push({ emoji: "\uD83C\uDF0D", label: output.cuisine });
    if (output.difficulty)
      pills.push({ emoji: "\uD83D\uDC68\u200D\uD83C\uDF73", label: output.difficulty });
    return pills;
  }, [
    output.cookTime,
    output.prepTime,
    output.mealCategory,
    output.nutritionHighlights,
    output.cuisine,
    output.difficulty,
  ]);

  // -- Nutrition estimation -------------------------------------------------
  const nutritionData = useMemo(() => {
    // Try to extract from nutritionHighlights
    const highlights = output.nutritionHighlights.join(" ");
    const kcalMatch = highlights.match(/(\d+)\s*kcal/i);
    const proteinMatch = highlights.match(/(\d+)\s*g?\s*(?:protein|eiwei)/i);
    const carbMatch = highlights.match(
      /(\d+)\s*g?\s*(?:carb|kohlenhydrat|kh)/i
    );
    const fatMatch = highlights.match(/(\d+)\s*g?\s*(?:fat|fett)/i);

    return {
      calories: kcalMatch ? kcalMatch[1] : null,
      protein: proteinMatch ? proteinMatch[1] : null,
      carbs: carbMatch ? carbMatch[1] : null,
      fat: fatMatch ? fatMatch[1] : null,
    };
  }, [output.nutritionHighlights]);

  const hasNutrition =
    nutritionData.calories ||
    nutritionData.protein ||
    nutritionData.carbs ||
    nutritionData.fat;

  // -- Callbacks ------------------------------------------------------------
  const toggleStep = useCallback((index: number) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  const addToFavorites = useCallback(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      const favorites: Array<{ id: string; title: string; addedAt: string }> =
        stored ? JSON.parse(stored) : [];
      const id = resultId ?? generateId();
      const exists = favorites.some((f) => f.id === id);
      if (!exists) {
        favorites.push({
          id,
          title: output.title,
          addedAt: new Date().toISOString(),
        });
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
      }
      setIsFavorite(true);
      toast.success("Zu Favoriten hinzugefuegt");
    } catch {
      toast.error("Favoriten konnten nicht aktualisiert werden");
    }
  }, [output.title, resultId]);

  const addShoppingListItems = useCallback(() => {
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
      for (const group of output.shoppingList) {
        for (const itemName of group.items) {
          if (!existingNames.has(itemName.toLowerCase())) {
            targetList.items.push({
              id: generateId(),
              name: itemName,
              category: group.category,
              quantity: "",
              checked: false,
            });
            existingNames.add(itemName.toLowerCase());
            addedCount++;
          }
        }
      }
      // Fallback: add from ingredients if shoppingList is empty
      if (output.shoppingList.length === 0) {
        for (const ing of output.ingredients) {
          if (!existingNames.has(ing.name.toLowerCase())) {
            targetList.items.push({
              id: generateId(),
              name: ing.name,
              category: "Zutaten",
              quantity: ing.amount
                ? `${formatScaledAmount(ing.amount, scale)}${ing.unit ? ` ${ing.unit}` : ""}`
                : "",
              checked: false,
            });
            existingNames.add(ing.name.toLowerCase());
            addedCount++;
          }
        }
      }
      localStorage.setItem(SHOPPING_LIST_STORAGE_KEY, JSON.stringify(lists));
      toast.success(`${addedCount} Artikel zur Einkaufsliste hinzugefuegt`);
    } catch {
      toast.error("Einkaufsliste konnte nicht aktualisiert werden");
    }
  }, [output.shoppingList, output.ingredients, scale]);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: output.title,
        text: `Schau dir dieses Rezept an: ${output.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link kopiert");
    }
  }, [output.title]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // ========================================================================
  // RENDER
  // ========================================================================
  return (
    <div className="max-w-lg mx-auto">
      {/* ================================================================= */}
      {/* TITLE                                                             */}
      {/* ================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-3 mb-4"
      >
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground">
            {output.title}
          </h1>
          {sourceCreator && (
            <p className="mt-1 text-sm text-muted-foreground">
              von {sourceCreator}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowOptions(true)}
          className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted/60 active:bg-muted transition-colors"
          aria-label="Optionen"
        >
          <MoreVertical className="h-5 w-5 text-muted-foreground" />
        </button>
      </motion.div>

      {/* ================================================================= */}
      {/* HERO IMAGE                                                        */}
      {/* ================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-4"
      >
        {thumbnailUrl ? (
          <div className="relative overflow-hidden rounded-2xl">
            <div className="aspect-video w-full bg-muted">
              <img
                src={thumbnailUrl}
                alt={output.title}
                className="h-full w-full object-cover"
                loading="eager"
              />
            </div>
            {/* Platform badge */}
            {platform && (
              <div
                className={`absolute top-3 left-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-white text-xs font-semibold shadow-lg ${PLATFORM_COLORS[platform]}`}
              >
                <PlatformIcon platform={platform} />
                <span>{PLATFORM_LABELS[platform]}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-muted aspect-video flex items-center justify-center">
            <ChefHat className="h-16 w-16 text-muted-foreground/30" />
            {platform && (
              <div
                className={`absolute top-3 left-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-white text-xs font-semibold shadow-lg ${PLATFORM_COLORS[platform]}`}
              >
                <PlatformIcon platform={platform} />
                <span>{PLATFORM_LABELS[platform]}</span>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* ================================================================= */}
      {/* META PILLS                                                        */}
      {/* ================================================================= */}
      {metaPills.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-5"
        >
          {metaPills.map((pill, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 rounded-full bg-muted/70 px-3 py-1.5 text-xs font-medium text-muted-foreground"
            >
              <span>{pill.emoji}</span>
              {pill.label}
            </span>
          ))}
        </motion.div>
      )}

      {/* ================================================================= */}
      {/* ACTION BUTTONS: Video + Wochenplan                                */}
      {/* ================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-2.5 mb-6"
      >
        {sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border-2 border-border bg-background px-4 py-3.5 text-sm font-semibold text-foreground transition-all hover:border-primary/40 hover:bg-muted/30 active:scale-[0.98]"
          >
            <Play className="h-4 w-4" />
            Kochvideo anschauen
            <ExternalLink className="h-3.5 w-3.5 ml-auto text-muted-foreground" />
          </a>
        )}
        <button
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border-2 border-border bg-background px-4 py-3.5 text-sm font-semibold text-foreground transition-all hover:border-primary/40 hover:bg-muted/30 active:scale-[0.98]"
          onClick={() => toast.info("Wochenplan kommt bald!")}
        >
          <CalendarDays className="h-4 w-4" />
          Zum Wochenplan hinzufuegen
        </button>
      </motion.div>

      {/* ================================================================= */}
      {/* DIVIDER                                                           */}
      {/* ================================================================= */}
      <div className="h-px bg-border mb-0" />

      {/* ================================================================= */}
      {/* TAB BAR                                                           */}
      {/* ================================================================= */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative flex mb-6"
      >
        {(["zutaten", "zubereitung"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative flex-1 py-4 text-center text-sm font-bold uppercase tracking-wider transition-colors ${
              activeTab === tab
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground/70"
            }`}
          >
            {tab === "zutaten" ? "Zutaten" : "Zubereitung"}
            {activeTab === tab && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </motion.div>

      {/* ================================================================= */}
      {/* TAB CONTENT                                                       */}
      {/* ================================================================= */}
      <AnimatePresence mode="wait">
        {activeTab === "zutaten" ? (
          <motion.div
            key="zutaten"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
          >
            {/* Portions Calculator */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-sm font-medium text-muted-foreground">
                Fuer{" "}
                <span className="text-foreground font-bold text-lg tabular-nums">
                  {portions}
                </span>{" "}
                {portions === 1 ? "Portion" : "Portionen"}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPortions((p) => Math.max(1, p - 1))}
                  disabled={portions <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-border transition-all hover:border-primary/40 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Portion verringern"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPortions((p) => p + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-border transition-all hover:border-primary/40 active:scale-95"
                  aria-label="Portion erhoehen"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Categorized Ingredients */}
            <div className="space-y-6 mb-6">
              {ingredientGroups.map(([category, ingredients]) => (
                <div key={category}>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
                    {category}
                  </h3>
                  <div>
                    {ingredients.map((ingredient, index) => (
                      <IngredientRow
                        key={index}
                        ingredient={ingredient}
                        scale={scale}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="zubereitung"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.2 }}
          >
            {/* Steps */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {output.steps.length} Schritte
                </span>
                <Badge variant="secondary" className="text-xs font-normal">
                  {checkedSteps.size}/{output.steps.length}
                </Badge>
              </div>
              <div>
                {output.steps.map((step, index) => (
                  <StepRow
                    key={index}
                    step={step}
                    index={index}
                    checked={checkedSteps.has(index)}
                    onToggle={() => toggleStep(index)}
                  />
                ))}
              </div>
            </div>

            {/* Kochmodus Button */}
            {resultId && (
              <Link
                href={`/app/step-by-step/${resultId}`}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-primary px-4 py-4 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] mb-6"
              >
                <ChefHat className="h-5 w-5" />
                Kochmodus starten
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* NUTRITION GRID                                                    */}
      {/* ================================================================= */}
      {(hasNutrition || output.nutritionHighlights.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-6"
        >
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Naehrwerte pro Portion
          </h3>
          {hasNutrition ? (
            <div className="grid grid-cols-4 gap-2">
              <NutritionCell
                emoji={"\uD83D\uDD25"}
                value={nutritionData.calories ? `${nutritionData.calories}` : "-"}
                unit="kcal"
                label="Kalorien"
              />
              <NutritionCell
                emoji={"\uD83E\uDD69"}
                value={nutritionData.protein ? `${nutritionData.protein}g` : "-"}
                unit=""
                label="Eiweiss"
              />
              <NutritionCell
                emoji={"\uD83C\uDF3E"}
                value={nutritionData.carbs ? `${nutritionData.carbs}g` : "-"}
                unit=""
                label="KH"
              />
              <NutritionCell
                emoji={"\uD83E\uDED2"}
                value={nutritionData.fat ? `${nutritionData.fat}g` : "-"}
                unit=""
                label="Fette"
              />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {output.nutritionHighlights.map((highlight, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="gap-1 px-3 py-1.5 text-xs"
                >
                  <Leaf className="h-3 w-3" />
                  {highlight}
                </Badge>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ================================================================= */}
      {/* DIVIDER                                                           */}
      {/* ================================================================= */}
      <div className="h-px bg-border mb-6" />

      {/* ================================================================= */}
      {/* CTA BUTTONS                                                       */}
      {/* ================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3 mb-6"
      >
        <button
          onClick={addToFavorites}
          disabled={isFavorite}
          className={`flex w-full items-center justify-center gap-2.5 rounded-xl px-4 py-4 text-sm font-bold transition-all active:scale-[0.98] ${
            isFavorite
              ? "bg-orange-500/20 text-orange-600 cursor-default"
              : "bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/25"
          }`}
        >
          <Heart
            className={`h-5 w-5 ${isFavorite ? "fill-orange-500" : ""}`}
          />
          {isFavorite
            ? "In Favoriten gespeichert"
            : "Zu Favoriten hinzufuegen"}
        </button>

        <button
          onClick={addShoppingListItems}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-emerald-500 px-4 py-4 text-sm font-bold text-white transition-all hover:bg-emerald-600 active:scale-[0.98] shadow-lg shadow-emerald-500/25"
        >
          <ShoppingCart className="h-5 w-5" />
          Auf Einkaufsliste setzen
        </button>
      </motion.div>

      {/* ================================================================= */}
      {/* WARNING                                                           */}
      {/* ================================================================= */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="flex items-start gap-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30 px-4 py-3 mb-4"
      >
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
        <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-400">
          Rezepte koennten Fehler enthalten. Ueberpruefe wichtige
          Informationen.
        </p>
      </motion.div>

      {/* ================================================================= */}
      {/* OPTIONS BOTTOM SHEET                                              */}
      {/* ================================================================= */}
      <AnimatePresence>
        <OptionsSheet
          open={showOptions}
          onClose={() => setShowOptions(false)}
          onShare={handleShare}
          onPrint={handlePrint}
        />
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Nutrition Cell
// ---------------------------------------------------------------------------

function NutritionCell({
  emoji,
  value,
  unit,
  label,
}: {
  emoji: string;
  value: string;
  unit: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/50 px-2 py-3">
      <span className="text-lg" aria-hidden="true">
        {emoji}
      </span>
      <span className="text-sm font-bold tabular-nums text-foreground">
        {value}
        {unit && <span className="text-xs font-normal ml-0.5">{unit}</span>}
      </span>
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
