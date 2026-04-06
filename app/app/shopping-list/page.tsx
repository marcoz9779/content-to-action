/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/shared/page-transition";
import {
  ShoppingCart,
  Plus,
  Trash2,
  Check,
  Import,
  Copy,
  X,
  ChevronDown,
  ChevronUp,
  Edit3,
  Share2,
  MoreHorizontal,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { AppleRemindersExport } from "@/components/shopping/apple-reminders-export";
import { NearbyStores } from "@/components/shopping/nearby-stores";
import { getIngredientEmoji } from "@/lib/utils/ingredient-emojis";
import type { RecipeOutput } from "@/types";

// ---------------------------------------------------------------------------
// Types
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

interface RecipeResult {
  id: string;
  title: string;
  structuredOutput: RecipeOutput;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = "cta-shopping-lists";

const CATEGORY_STYLES: Record<string, string> = {
  "Gemüse & Obst":
    "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200",
  Milchprodukte:
    "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200",
  "Fleisch & Fisch":
    "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200",
  Backwaren:
    "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200",
  Getränke:
    "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-200",
  Gewürze:
    "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200",
  Tiefkühl:
    "bg-sky-100 dark:bg-sky-900/30 text-sky-800 dark:text-sky-200",
  Sonstiges:
    "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200",
};

const CATEGORY_BORDER_STYLES: Record<string, string> = {
  "Gemüse & Obst": "border-emerald-200 dark:border-emerald-800",
  Milchprodukte: "border-blue-200 dark:border-blue-800",
  "Fleisch & Fisch": "border-red-200 dark:border-red-800",
  Backwaren: "border-amber-200 dark:border-amber-800",
  Getränke: "border-cyan-200 dark:border-cyan-800",
  Gewürze: "border-orange-200 dark:border-orange-800",
  Tiefkühl: "border-sky-200 dark:border-sky-800",
  Sonstiges: "border-gray-200 dark:border-gray-800",
};

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

const CATEGORY_ORDER = [
  "Gemüse & Obst",
  "Milchprodukte",
  "Fleisch & Fisch",
  "Backwaren",
  "Getränke",
  "Gewürze",
  "Tiefkühl",
  "Sonstiges",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
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

function createDefaultList(): ShoppingList {
  return {
    id: generateId(),
    name: "Wocheneinkauf",
    items: [],
    createdAt: new Date().toISOString(),
  };
}

function loadLists(): ShoppingList[] {
  if (typeof window === "undefined") return [createDefaultList()];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ShoppingList[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // corrupted data – start fresh
  }
  const def = createDefaultList();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([def]));
  return [def];
}

function saveLists(lists: ShoppingList[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
}

function getAllPreviousItemNames(lists: ShoppingList[]): string[] {
  const names = new Set<string>();
  for (const list of lists) {
    for (const item of list.items) {
      names.add(item.name);
    }
  }
  return Array.from(names).sort();
}

function getCategoryStyle(category: string): string {
  return CATEGORY_STYLES[category] ?? CATEGORY_STYLES["Sonstiges"] ?? "";
}

function getCategoryBorderStyle(category: string): string {
  return CATEGORY_BORDER_STYLES[category] ?? CATEGORY_BORDER_STYLES["Sonstiges"] ?? "";
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ItemCard({
  item,
  onToggle,
  onEditQuantity,
  onDelete,
}: {
  item: ShoppingItem;
  onToggle: () => void;
  onEditQuantity: () => void;
  onDelete: () => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setShowActions(false);
      }
    }
    if (showActions) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showActions]);

  const handlePointerDown = () => {
    longPressTimer.current = setTimeout(() => {
      setShowActions(true);
    }, 500);
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const style = getCategoryStyle(item.category);
  const borderStyle = getCategoryBorderStyle(item.category);

  return (
    <div className="relative" ref={actionsRef}>
      <motion.button
        layout
        onClick={onToggle}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowActions(true);
        }}
        className={`relative flex w-full flex-col items-center justify-center rounded-2xl border-2 px-2 py-3 transition-all select-none ${
          item.checked
            ? "border-transparent bg-muted/50 opacity-60"
            : `${style} ${borderStyle}`
        }`}
        style={{ minHeight: "5rem" }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Check overlay */}
        <AnimatePresence>
          {item.checked && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
            >
              <Check className="h-3 w-3" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Emoji */}
        <span className="text-2xl mb-0.5">{getIngredientEmoji(item.name)}</span>

        {/* Quantity badge */}
        {item.quantity && (
          <Badge
            variant="secondary"
            className="mb-1 text-[10px] px-1.5 py-0"
          >
            {item.quantity}
          </Badge>
        )}

        <span
          className={`text-center text-xs font-medium leading-tight ${
            item.checked ? "line-through text-muted-foreground" : ""
          }`}
        >
          {item.name}
        </span>
      </motion.button>

      {/* Context actions popover */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-2 left-1/2 z-50 -translate-x-1/2 -translate-y-full rounded-xl border bg-popover p-1 shadow-lg"
          >
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActions(false);
                  onEditQuantity();
                }}
              >
                <Edit3 className="h-3 w-3" />
                Menge
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs gap-1 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActions(false);
                  onDelete();
                }}
              >
                <Trash2 className="h-3 w-3" />
                Löschen
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuantityDialog({
  itemName,
  currentQuantity,
  onSave,
  onClose,
}: {
  itemName: string;
  currentQuantity: string;
  onSave: (quantity: string) => void;
  onClose: () => void;
}) {
  const [quantity, setQuantity] = useState(currentQuantity);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="w-full max-w-xs rounded-2xl border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-1 text-lg font-semibold">Menge bearbeiten</h3>
        <p className="mb-4 text-sm text-muted-foreground">{itemName}</p>
        <Input
          ref={inputRef}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="z.B. 2 Stück, 500g, 1 Liter..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSave(quantity);
            } else if (e.key === "Escape") {
              onClose();
            }
          }}
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Abbrechen
          </Button>
          <Button size="sm" onClick={() => onSave(quantity)}>
            Speichern
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ImportModal({
  recipes,
  onImport,
  onClose,
}: {
  recipes: RecipeResult[];
  onImport: (selectedIds: string[]) => void;
  onClose: () => void;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  function toggleRecipe(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl border bg-card shadow-xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold">Rezepte importieren</h3>
            <p className="text-sm text-muted-foreground">
              Wähle Rezepte aus, deren Zutaten importiert werden sollen
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {recipes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mb-3 opacity-40" />
              <p className="text-sm">Noch keine analysierten Rezepte vorhanden.</p>
              <p className="text-xs mt-1">Analysiere zuerst ein Rezept, um Zutaten zu importieren.</p>
            </div>
          ) : (
            recipes.map((recipe) => {
              const isSelected = selectedIds.has(recipe.id);
              const ingredientCount = recipe.structuredOutput.ingredients?.length ?? 0;
              return (
                <button
                  key={recipe.id}
                  onClick={() => toggleRecipe(recipe.id)}
                  className={`w-full flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-transparent bg-muted/50 hover:bg-muted"
                  }`}
                >
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30"
                    }`}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{recipe.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {ingredientCount} Zutat{ingredientCount !== 1 ? "en" : ""}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t px-6 py-4">
          <p className="text-sm text-muted-foreground">
            {selectedIds.size} Rezept{selectedIds.size !== 1 ? "e" : ""} ausgewählt
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Abbrechen
            </Button>
            <Button
              onClick={() => onImport(Array.from(selectedIds))}
              disabled={selectedIds.size === 0}
            >
              <Import className="mr-2 h-4 w-4" />
              Importieren
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function NewListDialog({
  onSave,
  onClose,
}: {
  onSave: (name: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="w-full max-w-xs rounded-2xl border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-lg font-semibold">Neue Liste</h3>
        <Input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="z.B. Party, Camping, Brunch..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && name.trim()) {
              onSave(name.trim());
            } else if (e.key === "Escape") {
              onClose();
            }
          }}
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Abbrechen
          </Button>
          <Button size="sm" onClick={() => name.trim() && onSave(name.trim())} disabled={!name.trim()}>
            Erstellen
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DeleteListDialog({
  listName,
  onConfirm,
  onClose,
}: {
  listName: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="w-full max-w-xs rounded-2xl border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-2 text-lg font-semibold">Liste löschen?</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          &bdquo;{listName}&ldquo; und alle Einträge werden unwiderruflich gelöscht.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Abbrechen
          </Button>
          <Button variant="destructive" size="sm" onClick={onConfirm}>
            Löschen
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function ShoppingListPage() {
  // ------ State ------
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [activeListId, setActiveListId] = useState<string>("");
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showNewListDialog, setShowNewListDialog] = useState(false);
  const [showDeleteListDialog, setShowDeleteListDialog] = useState(false);
  const [editingQuantityItem, setEditingQuantityItem] = useState<ShoppingItem | null>(null);
  const [recipes, setRecipes] = useState<RecipeResult[]>([]);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [showCompletedSection, setShowCompletedSection] = useState(true);
  const [showListActions, setShowListActions] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const listActionsRef = useRef<HTMLDivElement>(null);

  // ------ Initialize from localStorage ------
  useEffect(() => {
    const loaded = loadLists();
    setLists(loaded);
    setActiveListId(loaded[0]?.id ?? "");
    setInitialized(true);
  }, []);

  // ------ Persist to localStorage ------
  useEffect(() => {
    if (initialized && lists.length > 0) {
      saveLists(lists);
    }
  }, [lists, initialized]);

  // ------ Click-outside handlers ------
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (listActionsRef.current && !listActionsRef.current.contains(e.target as Node)) {
        setShowListActions(false);
      }
    }
    if (showListActions) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showListActions]);

  // ------ Derived state ------
  const activeList = useMemo(
    () => lists.find((l) => l.id === activeListId) ?? lists[0],
    [lists, activeListId]
  );

  const activeItems = useMemo(() => {
    if (!activeList) return [];
    return activeList.items.filter((i) => !i.checked);
  }, [activeList]);

  const completedItems = useMemo(() => {
    if (!activeList) return [];
    return activeList.items.filter((i) => i.checked);
  }, [activeList]);

  const groupedActiveItems = useMemo(() => {
    const groups: Record<string, ShoppingItem[]> = {};
    for (const item of activeItems) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category]!.push(item);
    }
    return CATEGORY_ORDER
      .filter((cat) => groups[cat]?.length)
      .map((cat) => ({ category: cat, items: groups[cat] ?? [] }));
  }, [activeItems]);

  const groupedCompletedItems = useMemo(() => {
    const groups: Record<string, ShoppingItem[]> = {};
    for (const item of completedItems) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category]!.push(item);
    }
    return CATEGORY_ORDER
      .filter((cat) => groups[cat]?.length)
      .map((cat) => ({ category: cat, items: groups[cat] ?? [] }));
  }, [completedItems]);

  const allPreviousNames = useMemo(() => getAllPreviousItemNames(lists), [lists]);

  const suggestions = useMemo(() => {
    if (!inputValue.trim()) return [];
    const lower = inputValue.toLowerCase();
    return allPreviousNames
      .filter(
        (name) =>
          name.toLowerCase().includes(lower) &&
          !activeList?.items.some((i) => i.name.toLowerCase() === name.toLowerCase() && !i.checked)
      )
      .slice(0, 8);
  }, [inputValue, allPreviousNames, activeList]);

  // ------ Helpers to mutate lists ------
  const updateActiveList = useCallback(
    (updater: (list: ShoppingList) => ShoppingList) => {
      setLists((prev) =>
        prev.map((l) => (l.id === activeListId ? updater(l) : l))
      );
    },
    [activeListId]
  );

  // ------ Actions ------
  const addItem = useCallback(
    (name: string, quantity = "") => {
      const trimmed = name.trim();
      if (!trimmed) return;

      // Check for duplicate
      const existingUnchecked = activeList?.items.find(
        (i) => i.name.toLowerCase() === trimmed.toLowerCase() && !i.checked
      );
      if (existingUnchecked) {
        toast.info(`"${trimmed}" ist bereits auf der Liste`);
        setInputValue("");
        return;
      }

      // If item exists but is checked, uncheck it instead
      const existingChecked = activeList?.items.find(
        (i) => i.name.toLowerCase() === trimmed.toLowerCase() && i.checked
      );
      if (existingChecked) {
        updateActiveList((list) => ({
          ...list,
          items: list.items.map((i) =>
            i.id === existingChecked.id ? { ...i, checked: false, quantity: quantity || i.quantity } : i
          ),
        }));
        setInputValue("");
        return;
      }

      const category = detectCategory(trimmed);
      const newItem: ShoppingItem = {
        id: generateId(),
        name: trimmed.charAt(0).toUpperCase() + trimmed.slice(1),
        category,
        quantity,
        checked: false,
      };
      updateActiveList((list) => ({
        ...list,
        items: [...list.items, newItem],
      }));
      setInputValue("");
      setShowSuggestions(false);
    },
    [activeList, updateActiveList]
  );

  const toggleItem = useCallback(
    (itemId: string) => {
      updateActiveList((list) => ({
        ...list,
        items: list.items.map((i) =>
          i.id === itemId ? { ...i, checked: !i.checked } : i
        ),
      }));
    },
    [updateActiveList]
  );

  const deleteItem = useCallback(
    (itemId: string) => {
      updateActiveList((list) => ({
        ...list,
        items: list.items.filter((i) => i.id !== itemId),
      }));
    },
    [updateActiveList]
  );

  const updateItemQuantity = useCallback(
    (itemId: string, quantity: string) => {
      updateActiveList((list) => ({
        ...list,
        items: list.items.map((i) =>
          i.id === itemId ? { ...i, quantity } : i
        ),
      }));
    },
    [updateActiveList]
  );

  const clearCompleted = useCallback(() => {
    updateActiveList((list) => ({
      ...list,
      items: list.items.filter((i) => !i.checked),
    }));
    toast.success("Erledigte Artikel entfernt");
  }, [updateActiveList]);

  const addNewList = useCallback((name: string) => {
    const newList: ShoppingList = {
      id: generateId(),
      name,
      items: [],
      createdAt: new Date().toISOString(),
    };
    setLists((prev) => [...prev, newList]);
    setActiveListId(newList.id);
    setShowNewListDialog(false);
    toast.success(`Liste "${name}" erstellt`);
  }, []);

  const deleteActiveList = useCallback(() => {
    if (lists.length <= 1) {
      toast.error("Die letzte Liste kann nicht gelöscht werden");
      return;
    }
    const deletedName = activeList?.name;
    setLists((prev) => {
      const next = prev.filter((l) => l.id !== activeListId); if (next.length === 0) return prev;
      setActiveListId(next[0]?.id ?? "");
      return next;
    });
    setShowDeleteListDialog(false);
    toast.success(`Liste "${deletedName}" gelöscht`);
  }, [lists, activeListId, activeList]);

  const copyListAsText = useCallback(() => {
    if (!activeList) return;
    const unchecked = activeList.items.filter((i) => !i.checked);
    const checked = activeList.items.filter((i) => i.checked);

    let text = `Einkaufsliste: ${activeList.name}\n`;
    text += `${new Date().toLocaleDateString("de-DE")}\n\n`;

    if (unchecked.length > 0) {
      text += "Noch zu kaufen:\n";
      const groups: Record<string, ShoppingItem[]> = {};
      for (const item of unchecked) {
        if (!groups[item.category]) groups[item.category] = [];
        groups[item.category]!.push(item);
      }
      for (const cat of CATEGORY_ORDER) {
        if (!groups[cat]) continue;
        text += `\n${cat}:\n`;
        for (const item of groups[cat]) {
          const qty = item.quantity ? ` (${item.quantity})` : "";
          text += `  - ${item.name}${qty}\n`;
        }
      }
    }

    if (checked.length > 0) {
      text += "\nErledigt:\n";
      for (const item of checked) {
        const qty = item.quantity ? ` (${item.quantity})` : "";
        text += `  - ${item.name}${qty}\n`;
      }
    }

    navigator.clipboard.writeText(text);
    toast.success("Liste in die Zwischenablage kopiert");
  }, [activeList]);

  const fetchRecipes = useCallback(async () => {
    setRecipesLoading(true);
    try {
      const response = await fetch("/api/results?contentType=recipe&limit=50");
      if (!response.ok) {
        setRecipesLoading(false);
        return;
      }
      const data = (await response.json()) as { results: Array<{ id: string; title: string }> };
      const fullRecipes: RecipeResult[] = [];
      for (const r of data.results) {
        try {
          const res = await fetch(`/api/results/${r.id}`);
          if (res.ok) {
            const full = (await res.json()) as {
              structuredOutput: RecipeOutput;
              id: string;
              title: string;
            };
            if (full.structuredOutput.contentType === "recipe") {
              fullRecipes.push({
                id: full.id,
                title: full.title,
                structuredOutput: full.structuredOutput,
              });
            }
          }
        } catch {
          // skip individual failures
        }
      }
      setRecipes(fullRecipes);
    } catch {
      toast.error("Rezepte konnten nicht geladen werden");
    } finally {
      setRecipesLoading(false);
    }
  }, []);

  const importFromRecipes = useCallback(
    (selectedIds: string[]) => {
      const selectedRecipes = recipes.filter((r) => selectedIds.includes(r.id));
      let importedCount = 0;
      const newItems: ShoppingItem[] = [];

      for (const recipe of selectedRecipes) {
        // Import from ingredients array
        for (const ingredient of recipe.structuredOutput.ingredients ?? []) {
          const name = ingredient.name.trim();
          if (!name) continue;

          const existsInList = activeList?.items.some(
            (i) => i.name.toLowerCase() === name.toLowerCase()
          );
          const existsInNewItems = newItems.some(
            (i) => i.name.toLowerCase() === name.toLowerCase()
          );

          if (existsInList || existsInNewItems) continue;

          const quantity = [ingredient.amount, ingredient.unit]
            .filter(Boolean)
            .join(" ")
            .trim();

          newItems.push({
            id: generateId(),
            name: name.charAt(0).toUpperCase() + name.slice(1),
            category: detectCategory(name),
            quantity,
            checked: false,
          });
          importedCount++;
        }

        // Also import from shopping list if ingredients are empty or as fallback
        for (const group of recipe.structuredOutput.shoppingList ?? []) {
          for (const itemName of group.items) {
            const name = itemName.trim();
            if (!name) continue;

            const existsInList = activeList?.items.some(
              (i) => i.name.toLowerCase() === name.toLowerCase()
            );
            const existsInNewItems = newItems.some(
              (i) => i.name.toLowerCase() === name.toLowerCase()
            );

            if (existsInList || existsInNewItems) continue;

            newItems.push({
              id: generateId(),
              name: name.charAt(0).toUpperCase() + name.slice(1),
              category: group.category in CATEGORY_STYLES ? group.category : detectCategory(name),
              quantity: "",
              checked: false,
            });
            importedCount++;
          }
        }
      }

      if (newItems.length > 0) {
        updateActiveList((list) => ({
          ...list,
          items: [...list.items, ...newItems],
        }));
      }

      setShowImportModal(false);
      toast.success(`${importedCount} Zutat${importedCount !== 1 ? "en" : ""} importiert`);
    },
    [recipes, activeList, updateActiveList]
  );

  // ------ Render guard ------
  if (!initialized || !activeList) {
    return (
      <PageTransition className="container max-w-4xl py-8">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </PageTransition>
    );
  }

  const totalActive = activeItems.length;
  const totalCompleted = completedItems.length;
  const totalItems = totalActive + totalCompleted;

  return (
    <PageTransition className="container max-w-4xl py-6 pb-24">
      {/* ================================================================= */}
      {/* Header                                                            */}
      {/* ================================================================= */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">Einkaufsliste</h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              {totalActive > 0
                ? `${totalActive} Artikel noch zu kaufen`
                : totalCompleted > 0
                  ? "Alles erledigt!"
                  : "Liste ist leer"}
              {totalCompleted > 0 && totalActive > 0 && ` · ${totalCompleted} erledigt`}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="relative flex gap-1.5" ref={listActionsRef}>
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0"
            onClick={copyListAsText}
            title="Liste kopieren"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0"
            onClick={() => {
              if (!recipesLoading && recipes.length === 0) {
                fetchRecipes().then(() => setShowImportModal(true));
              } else {
                setShowImportModal(true);
              }
            }}
            title="Aus Rezepten importieren"
            disabled={recipesLoading}
          >
            {recipesLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Import className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0"
            onClick={() => setShowListActions(!showListActions)}
            title="Mehr Aktionen"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>

          {/* More actions dropdown */}
          <AnimatePresence>
            {showListActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-full z-50 mt-1 w-52 rounded-xl border bg-popover p-1.5 shadow-lg"
              >
                <button
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
                  onClick={() => {
                    setShowListActions(false);
                    clearCompleted();
                  }}
                  disabled={totalCompleted === 0}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                  Erledigte entfernen
                </button>
                <button
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
                  onClick={() => {
                    setShowListActions(false);
                    copyListAsText();
                  }}
                >
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                  Liste teilen
                </button>
                <div className="px-3 py-1.5">
                  <AppleRemindersExport
                    listName={activeList?.name ?? "Einkaufsliste"}
                    items={(activeList?.items ?? []).map((i) => ({
                      name: i.name,
                      quantity: i.quantity,
                      checked: i.checked,
                    }))}
                  />
                </div>
                {lists.length > 1 && (
                  <button
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    onClick={() => {
                      setShowListActions(false);
                      setShowDeleteListDialog(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Liste löschen
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Nearby stores — prominent banner                                 */}
      {/* ================================================================= */}
      <div className="mb-6 rounded-xl border-2 border-primary/10 bg-gradient-to-r from-primary/5 to-transparent p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Bereit zum Einkaufen?</p>
              <p className="text-xs text-muted-foreground">Finde Supermärkte in deiner Nähe</p>
            </div>
          </div>
          <NearbyStores />
        </div>
      </div>

      {/* ================================================================= */}
      {/* List tabs                                                         */}
      {/* ================================================================= */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {lists.map((list) => (
          <button
            key={list.id}
            onClick={() => setActiveListId(list.id)}
            className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              list.id === activeListId
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {list.name}
            {list.items.filter((i) => !i.checked).length > 0 && (
              <span
                className={`ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                  list.id === activeListId
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted-foreground/20 text-muted-foreground"
                }`}
              >
                {list.items.filter((i) => !i.checked).length}
              </span>
            )}
          </button>
        ))}
        <button
          onClick={() => setShowNewListDialog(true)}
          className="flex shrink-0 items-center gap-1 rounded-full border-2 border-dashed border-muted-foreground/20 px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-muted-foreground/40 hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Neue Liste
        </button>
      </div>

      {/* ================================================================= */}
      {/* Quick Add Input                                                   */}
      {/* ================================================================= */}
      <div className="relative mb-8" ref={suggestionsRef}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowSuggestions(e.target.value.trim().length > 0);
              }}
              onFocus={() => {
                if (inputValue.trim().length > 0) setShowSuggestions(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addItem(inputValue);
                } else if (e.key === "Escape") {
                  setShowSuggestions(false);
                  inputRef.current?.blur();
                }
              }}
              placeholder="Artikel hinzufügen..."
              className="h-12 rounded-xl border-2 pl-4 pr-10 text-base shadow-sm transition-shadow focus-visible:shadow-md"
            />
            {inputValue && (
              <button
                onClick={() => {
                  setInputValue("");
                  setShowSuggestions(false);
                  inputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            onClick={() => addItem(inputValue)}
            disabled={!inputValue.trim()}
            className="h-12 w-12 shrink-0 rounded-xl p-0"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        {/* Autocomplete suggestions */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              className="absolute left-0 right-12 top-full z-40 mt-1 overflow-hidden rounded-xl border bg-popover shadow-lg"
            >
              {suggestions.map((name, idx) => {
                const cat = detectCategory(name);
                return (
                  <button
                    key={name}
                    onClick={() => {
                      addItem(name);
                      inputRef.current?.focus();
                    }}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted ${
                      idx > 0 ? "border-t border-border/50" : ""
                    }`}
                  >
                    <span className="text-lg">{getIngredientEmoji(name)}</span>
                    <span className="flex-1">{name}</span>
                    <span className="text-xs text-muted-foreground">{cat}</span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category hint for new items */}
        {inputValue.trim() && suggestions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"
          >
            <span
              className={`inline-block h-2 w-2 rounded-full ${getCategoryStyle(
                detectCategory(inputValue)
              )}`}
            />
            Kategorie: {detectCategory(inputValue)}
            <span className="text-muted-foreground/50">
              &middot; Enter zum Hinzufügen
            </span>
          </motion.div>
        )}
      </div>

      {/* ================================================================= */}
      {/* Empty state                                                       */}
      {/* ================================================================= */}
      {totalItems === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <ShoppingCart className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Liste ist leer</h3>
          <p className="mb-6 max-w-xs text-sm text-muted-foreground">
            Füge Artikel über das Suchfeld hinzu oder importiere Zutaten aus deinen analysierten Rezepten.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              if (!recipesLoading && recipes.length === 0) {
                fetchRecipes().then(() => setShowImportModal(true));
              } else {
                setShowImportModal(true);
              }
            }}
            disabled={recipesLoading}
          >
            <Import className="mr-2 h-4 w-4" />
            Aus Rezepten importieren
          </Button>
        </motion.div>
      )}

      {/* ================================================================= */}
      {/* Active items — "Noch zu kaufen"                                   */}
      {/* ================================================================= */}
      {groupedActiveItems.length > 0 && (
        <StaggerContainer className="space-y-6">
          {groupedActiveItems.map((group) => (
            <StaggerItem key={group.category}>
              <div className="mb-3 flex items-center gap-2">
                <span
                  className={`inline-block h-3 w-3 rounded-full ${getCategoryStyle(
                    group.category
                  )}`}
                />
                <h2 className="text-sm font-semibold text-muted-foreground">
                  {group.category}
                </h2>
                <span className="text-xs text-muted-foreground/60">
                  {group.items?.length ?? 0}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                <AnimatePresence mode="popLayout">
                  {group.items?.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                    >
                      <ItemCard
                        item={item}
                        onToggle={() => toggleItem(item.id)}
                        onEditQuantity={() => setEditingQuantityItem(item)}
                        onDelete={() => deleteItem(item.id)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      {/* ================================================================= */}
      {/* Completed items — "Erledigt"                                      */}
      {/* ================================================================= */}
      {totalCompleted > 0 && (
        <div className="mt-10">
          <button
            onClick={() => setShowCompletedSection(!showCompletedSection)}
            className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            {showCompletedSection ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            Erledigt ({totalCompleted})
          </button>

          <AnimatePresence>
            {showCompletedSection && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="space-y-6">
                  {groupedCompletedItems.map((group) => (
                    <div key={group.category}>
                      <div className="mb-3 flex items-center gap-2">
                        <span
                          className={`inline-block h-3 w-3 rounded-full opacity-50 ${getCategoryStyle(
                            group.category
                          )}`}
                        />
                        <h2 className="text-sm font-semibold text-muted-foreground/60">
                          {group.category}
                        </h2>
                      </div>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                        <AnimatePresence mode="popLayout">
                          {group.items?.map((item) => (
                            <motion.div
                              key={item.id}
                              layout
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 25,
                              }}
                            >
                              <ItemCard
                                item={item}
                                onToggle={() => toggleItem(item.id)}
                                onEditQuantity={() => setEditingQuantityItem(item)}
                                onDelete={() => deleteItem(item.id)}
                              />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-center pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearCompleted}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      Erledigte Artikel entfernen
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ================================================================= */}
      {/* Progress bar (sticky bottom)                                      */}
      {/* ================================================================= */}
      {totalItems > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background/80 px-4 py-3 backdrop-blur-lg"
        >
          <div className="mx-auto flex max-w-4xl items-center gap-3">
            <div className="flex-1">
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {totalCompleted} von {totalItems} erledigt
                </span>
                <span>{totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${totalItems > 0 ? (totalCompleted / totalItems) * 100 : 0}%`,
                  }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                />
              </div>
            </div>
            {totalCompleted === totalItems && totalItems > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check className="h-5 w-5" />
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* ================================================================= */}
      {/* Modals & Dialogs                                                  */}
      {/* ================================================================= */}
      <AnimatePresence>
        {showImportModal && (
          <ImportModal
            recipes={recipes}
            onImport={importFromRecipes}
            onClose={() => setShowImportModal(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNewListDialog && (
          <NewListDialog
            onSave={addNewList}
            onClose={() => setShowNewListDialog(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteListDialog && (
          <DeleteListDialog
            listName={activeList.name}
            onConfirm={deleteActiveList}
            onClose={() => setShowDeleteListDialog(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingQuantityItem && (
          <QuantityDialog
            itemName={editingQuantityItem.name}
            currentQuantity={editingQuantityItem.quantity}
            onSave={(quantity) => {
              updateItemQuantity(editingQuantityItem.id, quantity);
              setEditingQuantityItem(null);
              toast.success("Menge aktualisiert");
            }}
            onClose={() => setEditingQuantityItem(null)}
          />
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
