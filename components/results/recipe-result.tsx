"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";
import { motion } from "framer-motion";
import {
  Clock,
  Users,
  ChefHat,
  Leaf,
  ShoppingCart,
  ListChecks,
  Check,
  Plus,
  Minus,
  ExternalLink,
  Flame,
  DollarSign,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { RecipeOutput, RecipeIngredient } from "@/types";

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

const SHOPPING_LIST_STORAGE_KEY = "cta-shopping-lists";

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

// Cuisine to flag emoji mapping
const CUISINE_FLAGS: Record<string, string> = {
  italienisch: "\u{1F1EE}\u{1F1F9}",
  italian: "\u{1F1EE}\u{1F1F9}",
  japanisch: "\u{1F1EF}\u{1F1F5}",
  japanese: "\u{1F1EF}\u{1F1F5}",
  chinesisch: "\u{1F1E8}\u{1F1F3}",
  chinese: "\u{1F1E8}\u{1F1F3}",
  mexikanisch: "\u{1F1F2}\u{1F1FD}",
  mexican: "\u{1F1F2}\u{1F1FD}",
  indisch: "\u{1F1EE}\u{1F1F3}",
  indian: "\u{1F1EE}\u{1F1F3}",
  "thai": "\u{1F1F9}\u{1F1ED}",
  thailändisch: "\u{1F1F9}\u{1F1ED}",
  französisch: "\u{1F1EB}\u{1F1F7}",
  french: "\u{1F1EB}\u{1F1F7}",
  griechisch: "\u{1F1EC}\u{1F1F7}",
  greek: "\u{1F1EC}\u{1F1F7}",
  spanisch: "\u{1F1EA}\u{1F1F8}",
  spanish: "\u{1F1EA}\u{1F1F8}",
  koreanisch: "\u{1F1F0}\u{1F1F7}",
  korean: "\u{1F1F0}\u{1F1F7}",
  türkisch: "\u{1F1F9}\u{1F1F7}",
  turkish: "\u{1F1F9}\u{1F1F7}",
  vietnamesisch: "\u{1F1FB}\u{1F1F3}",
  vietnamese: "\u{1F1FB}\u{1F1F3}",
  amerikanisch: "\u{1F1FA}\u{1F1F8}",
  american: "\u{1F1FA}\u{1F1F8}",
  deutsch: "\u{1F1E9}\u{1F1EA}",
  german: "\u{1F1E9}\u{1F1EA}",
  schweizerisch: "\u{1F1E8}\u{1F1ED}",
  swiss: "\u{1F1E8}\u{1F1ED}",
  österreichisch: "\u{1F1E6}\u{1F1F9}",
  austrian: "\u{1F1E6}\u{1F1F9}",
  marokkanisch: "\u{1F1F2}\u{1F1E6}",
  moroccan: "\u{1F1F2}\u{1F1E6}",
  libanesisch: "\u{1F1F1}\u{1F1E7}",
  lebanese: "\u{1F1F1}\u{1F1E7}",
  peruanisch: "\u{1F1F5}\u{1F1EA}",
  peruvian: "\u{1F1F5}\u{1F1EA}",
  brasilianisch: "\u{1F1E7}\u{1F1F7}",
  brazilian: "\u{1F1E7}\u{1F1F7}",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  einfach: "bg-emerald-500/90",
  leicht: "bg-emerald-500/90",
  easy: "bg-emerald-500/90",
  mittel: "bg-amber-500/90",
  medium: "bg-amber-500/90",
  schwer: "bg-red-500/90",
  hard: "bg-red-500/90",
  difficult: "bg-red-500/90",
};

const COST_ICONS: Record<string, number> = {
  günstig: 1,
  niedrig: 1,
  low: 1,
  budget: 1,
  mittel: 2,
  medium: 2,
  teuer: 3,
  hoch: 3,
  high: 3,
  expensive: 3,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseServingsNumber(servings: string | null): number {
  if (!servings) return 4;
  const match = servings.match(/(\d+)/);
  return match && match[1] ? parseInt(match[1], 10) : 4;
}

function parseIngredientAmount(amount: string | null): number | null {
  if (!amount) return null;
  // Handle fractions like "1/2", "3/4"
  const fractionMatch = amount.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (fractionMatch && fractionMatch[1] && fractionMatch[2]) {
    return parseInt(fractionMatch[1], 10) / parseInt(fractionMatch[2], 10);
  }
  // Handle mixed fractions like "1 1/2"
  const mixedMatch = amount.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixedMatch && mixedMatch[1] && mixedMatch[2] && mixedMatch[3]) {
    return (
      parseInt(mixedMatch[1], 10) +
      parseInt(mixedMatch[2], 10) / parseInt(mixedMatch[3], 10)
    );
  }
  // Handle ranges like "2-3" — take the first number
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
  // Format nicely: remove trailing zeros
  if (Number.isInteger(scaled)) return scaled.toString();
  // If close to a nice fraction, show as decimal with 1 place
  return scaled.toFixed(1).replace(/\.0$/, "");
}

function getCuisineFlag(cuisine: string): string {
  const lower = cuisine.toLowerCase().trim();
  for (const [key, flag] of Object.entries(CUISINE_FLAGS)) {
    if (lower.includes(key)) return flag;
  }
  return "\u{1F37D}\u{FE0F}"; // plate with cutlery default
}

function getDifficultyColor(difficulty: string): string {
  const lower = difficulty.toLowerCase().trim();
  for (const [key, color] of Object.entries(DIFFICULTY_COLORS)) {
    if (lower.includes(key)) return color;
  }
  return "bg-slate-500/90";
}

function getCostDots(costLevel: string): number {
  const lower = costLevel.toLowerCase().trim();
  for (const [key, dots] of Object.entries(COST_ICONS)) {
    if (lower.includes(key)) return dots;
  }
  return 2;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function IngredientRow({
  ingredient,
  scale,
}: {
  ingredient: RecipeIngredient;
  scale: number;
  checked?: boolean;
  onToggle?: () => void;
}) {
  const scaledAmount = formatScaledAmount(ingredient.amount, scale);

  return (
    <div className="flex items-baseline gap-3 px-3 py-2 border-b border-muted/50 last:border-0">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
      <div className="flex flex-1 items-baseline gap-1.5">
        {(scaledAmount || ingredient.unit) && (
          <span className="min-w-[3.5rem] text-right font-semibold tabular-nums">
            {scaledAmount}
            {ingredient.unit ? ` ${ingredient.unit}` : ""}
          </span>
        )}
        <span className="flex-1">
          {ingredient.name}
          {ingredient.seasonal && (
            <Leaf className="ml-1 inline-block h-3.5 w-3.5 text-emerald-500" />
          )}
        </span>
      </div>
      {ingredient.notes && (
        <span className="text-xs text-muted-foreground">
          {ingredient.notes}
        </span>
      )}
    </div>
  );
}

function StepCard({
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
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`group flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-all ${
        checked
          ? "border-primary/30 bg-primary/5"
          : "border-border hover:border-primary/20 hover:shadow-sm"
      }`}
      aria-label={`Schritt ${index + 1}: ${checked ? "erledigt" : "nicht erledigt"}`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all ${
          checked
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
        }`}
      >
        {checked ? <Check className="h-4 w-4" /> : index + 1}
      </div>
      <p
        className={`flex-1 pt-1 text-sm leading-relaxed ${
          checked ? "text-muted-foreground" : ""
        }`}
      >
        {step}
      </p>
    </motion.button>
  );
}

function MetaPill({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3.5 py-2.5">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="flex flex-col">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="text-sm font-semibold">{value}</span>
      </div>
    </div>
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
  const { t } = useTranslation();

  // Portions calculator
  const baseServings = parseServingsNumber(output.servings);
  const [portions, setPortions] = useState(baseServings);
  const scale = portions / baseServings;

  // Checked state for steps
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(
    () => new Set()
  );
  // Checked state for shopping list items
  const [checkedShoppingItems, setCheckedShoppingItems] = useState<Set<string>>(
    () => new Set()
  );

  const toggleShoppingItem = useCallback((groupIndex: number, itemIndex: number, itemName: string, category: string) => {
    const key = `${groupIndex}-${itemIndex}`;
    setCheckedShoppingItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
        // Add single item to shopping list
        addSingleItemToShoppingList(itemName, category);
      }
      return next;
    });
  }, []);

  const toggleStep = useCallback((index: number) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  // Has seasonal ingredients
  const hasSeasonal = output.seasonalIngredients.length > 0;
  const hasNutritionHighlights = output.nutritionHighlights.length > 0;

  // Difficulty color
  const difficultyColor = useMemo(
    () => getDifficultyColor(output.difficulty),
    [output.difficulty]
  );

  // Cost dots
  const costDots = useMemo(
    () => getCostDots(output.costLevel),
    [output.costLevel]
  );

  // Cuisine flag
  const cuisineFlag = useMemo(
    () => getCuisineFlag(output.cuisine),
    [output.cuisine]
  );

  // Add single item to shopping list
  const addSingleItemToShoppingList = useCallback((itemName: string, category: string) => {
    try {
      const stored = localStorage.getItem(SHOPPING_LIST_STORAGE_KEY);
      const lists: ShoppingList[] = stored ? JSON.parse(stored) : [];
      if (lists.length === 0) {
        lists.push({ id: generateId(), name: "Einkaufsliste", items: [], createdAt: new Date().toISOString() });
      }
      const list = lists[0]!;
      const exists = list.items.some((i) => i.name.toLowerCase() === itemName.toLowerCase());
      if (!exists) {
        list.items.push({ id: generateId(), name: itemName, category, quantity: "", checked: false });
        localStorage.setItem(SHOPPING_LIST_STORAGE_KEY, JSON.stringify(lists));
        toast.success(`${itemName} zur Einkaufsliste hinzugefügt`);
      }
    } catch { /* silent */ }
  }, []);

  // Build shopping list items from output.shoppingList
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

      localStorage.setItem(SHOPPING_LIST_STORAGE_KEY, JSON.stringify(lists));
      toast.success(`${addedCount} Artikel zur Einkaufsliste hinzugefügt`);
    } catch {
      toast.error("Einkaufsliste konnte nicht aktualisiert werden");
    }
  }, [output.shoppingList]);

  return (
    <div className="space-y-6">
      {/* ================================================================= */}
      {/* HERO SECTION                                                      */}
      {/* ================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {thumbnailUrl ? (
          <div className="relative overflow-hidden rounded-2xl">
            {/* Hero Image */}
            <div className="aspect-video w-full">
              <img
                src={thumbnailUrl}
                alt={output.title}
                className="h-full w-full object-cover"
              />
            </div>
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            {/* Content over image */}
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
              <div className="mb-3 flex flex-wrap gap-2">
                {output.cuisine && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    {cuisineFlag} {output.cuisine}
                  </span>
                )}
                {output.difficulty && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm ${difficultyColor}`}
                  >
                    <Star className="h-3 w-3" />
                    {output.difficulty}
                  </span>
                )}
                {output.costLevel && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    {Array.from({ length: costDots }).map((_, i) => (
                      <DollarSign key={i} className="h-3 w-3" />
                    ))}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold leading-tight text-white sm:text-2xl">
                {output.title}
              </h2>
            </div>
          </div>
        ) : (
          /* No thumbnail - text-based hero */
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 sm:p-6">
            <div className="mb-3 flex flex-wrap gap-2">
              {output.cuisine && (
                <Badge variant="secondary" className="gap-1">
                  {cuisineFlag} {output.cuisine}
                </Badge>
              )}
              {output.difficulty && (
                <Badge
                  className={`gap-1 border-0 text-white ${difficultyColor}`}
                >
                  <Star className="h-3 w-3" />
                  {output.difficulty}
                </Badge>
              )}
              {output.costLevel && (
                <Badge variant="secondary" className="gap-0.5">
                  {Array.from({ length: costDots }).map((_, i) => (
                    <DollarSign key={i} className="h-3 w-3" />
                  ))}
                </Badge>
              )}
            </div>
            <h2 className="text-xl font-bold leading-tight sm:text-2xl">
              {output.title}
            </h2>
          </div>
        )}

        {/* Source info below hero */}
        {(sourceCreator || sourceUrl) && (
          <div className="mt-2 flex items-center gap-2 px-1 text-sm text-muted-foreground">
            {sourceCreator && (
              <span className="font-medium">{sourceCreator}</span>
            )}
            {sourceCreator && sourceUrl && (
              <span className="text-muted-foreground/50">&middot;</span>
            )}
            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                Originalvideo
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}
      </motion.div>

      {/* ================================================================= */}
      {/* META BAR                                                          */}
      {/* ================================================================= */}
      {(output.prepTime ||
        output.cookTime ||
        output.servings ||
        output.difficulty ||
        output.costLevel) && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2"
        >
          {output.prepTime && (
            <MetaPill
              icon={Clock}
              label={t.recipe.prep}
              value={output.prepTime}
            />
          )}
          {output.cookTime && (
            <MetaPill
              icon={Flame}
              label={t.recipe.cook}
              value={output.cookTime}
            />
          )}
          {output.servings && (
            <MetaPill
              icon={Users}
              label="Portionen"
              value={output.servings}
            />
          )}
          {output.difficulty && (
            <MetaPill
              icon={ChefHat}
              label="Schwierigkeit"
              value={output.difficulty}
            />
          )}
          {output.costLevel && (
            <MetaPill
              icon={DollarSign}
              label="Kosten"
              value={output.costLevel}
            />
          )}
          {hasSeasonal && (
            <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3.5 py-2.5 dark:bg-emerald-950/30">
              <Leaf className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                Saison
              </span>
            </div>
          )}
        </motion.div>
      )}

      {/* ================================================================= */}
      {/* PORTIONS CALCULATOR                                               */}
      {/* ================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex items-center justify-center gap-4 rounded-xl border bg-muted/30 px-5 py-3"
      >
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={() => setPortions((p) => Math.max(1, p - 1))}
          disabled={portions <= 1}
          aria-label="Portion verringern"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tabular-nums">{portions}</span>
          <span className="text-sm text-muted-foreground">
            {portions === 1 ? "Portion" : "Portionen"}
          </span>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={() => setPortions((p) => p + 1)}
          aria-label="Portion erhöhen"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* ================================================================= */}
      {/* INGREDIENTS CARD                                                  */}
      {/* ================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <ListChecks className="h-5 w-5 text-primary" />
              {t.recipe.ingredients}
              <Badge variant="secondary" className="ml-auto text-xs font-normal">
                {output.ingredients.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div>
              {output.ingredients.map((ingredient, index) => (
                <IngredientRow
                  key={index}
                  ingredient={ingredient}
                  scale={scale}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ================================================================= */}
      {/* SHOPPING LIST CARD                                                */}
      {/* ================================================================= */}
      {output.shoppingList.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShoppingCart className="h-5 w-5 text-primary" />
                {t.recipe.shoppingList}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {output.shoppingList.map((group, groupIndex) => (
                  <div key={groupIndex}>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {group.category}
                    </h4>
                    <div className="space-y-1">
                      {group.items.map((item, itemIndex) => {
                        const isAdded = checkedShoppingItems.has(`${groupIndex}-${itemIndex}`);
                        return (
                          <button
                            key={itemIndex}
                            onClick={() => {
                              toggleShoppingItem(groupIndex, itemIndex, item, group.category);
                            }}
                            className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-all ${
                              isAdded
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-muted/50"
                            }`}
                          >
                            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all ${
                              isAdded ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"
                            }`}>
                              {isAdded && <Check className="h-3 w-3" />}
                            </div>
                            <span className={isAdded ? "line-through" : ""}>{item}</span>
                            {isAdded && <span className="ml-auto text-xs text-primary">hinzugefügt</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <Button
                  variant="default"
                  className="w-full gap-2"
                  onClick={addShoppingListItems}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Alles zur Einkaufsliste
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ================================================================= */}
      {/* STEPS CARD                                                        */}
      {/* ================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <ChefHat className="h-5 w-5 text-primary" />
                {t.recipe.steps}
              </CardTitle>
              <Badge variant="secondary" className="text-xs font-normal">
                {checkedSteps.size}/{output.steps.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {output.steps.map((step, index) => (
                <StepCard
                  key={index}
                  step={step}
                  index={index}
                  checked={checkedSteps.has(index)}
                  onToggle={() => toggleStep(index)}
                />
              ))}
            </div>

            {resultId && (
              <div className="mt-4">
                <Button variant="outline" className="w-full gap-2" asChild>
                  <Link href={`/app/step-by-step/${resultId}`}>
                    <ListChecks className="h-4 w-4" />
                    Schritt-für-Schritt Modus
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ================================================================= */}
      {/* NUTRITION HIGHLIGHTS                                              */}
      {/* ================================================================= */}
      {hasNutritionHighlights && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Flame className="h-5 w-5 text-primary" />
                Nährwert-Highlights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {output.nutritionHighlights.map((highlight, index) => (
                  <Badge
                    key={index}
                    variant="success"
                    className="gap-1 px-3 py-1.5 text-sm"
                  >
                    <Leaf className="h-3.5 w-3.5" />
                    {highlight}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ================================================================= */}
      {/* SEASONAL INGREDIENTS                                              */}
      {/* ================================================================= */}
      {hasSeasonal && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-emerald-200 dark:border-emerald-800/40">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-emerald-700 dark:text-emerald-400">
                <Leaf className="h-5 w-5" />
                Saisonale Zutaten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-muted-foreground">
                Diese Zutaten sind aktuell in Saison und besonders frisch
                erhältlich.
              </p>
              <div className="flex flex-wrap gap-2">
                {output.seasonalIngredients.map((item, index) => (
                  <Badge
                    key={index}
                    className="gap-1 border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-400"
                  >
                    <Leaf className="h-3 w-3" />
                    {item}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ================================================================= */}
      {/* CUISINE & CATEGORY BADGES                                         */}
      {/* ================================================================= */}
      {(output.cuisine || output.mealCategory) && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="flex flex-wrap gap-2"
        >
          {output.cuisine && (
            <Badge
              variant="outline"
              className="gap-1.5 px-3.5 py-2 text-sm"
            >
              <span>{cuisineFlag}</span>
              {output.cuisine}
            </Badge>
          )}
          {output.mealCategory && (
            <Badge
              variant="outline"
              className="gap-1.5 px-3.5 py-2 text-sm"
            >
              <span>{"\u{1F37D}\u{FE0F}"}</span>
              {output.mealCategory}
            </Badge>
          )}
        </motion.div>
      )}
    </div>
  );
}
