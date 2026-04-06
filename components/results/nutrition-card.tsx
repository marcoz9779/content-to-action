"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Apple, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";

interface NutritionData {
  calories_per_serving: number | null;
  protein_grams: number | null;
  carbs_grams: number | null;
  fat_grams: number | null;
  fiber_grams: number | null;
  servings: string | null;
  notes: string | null;
}

interface NutritionCardProps {
  resultId: string;
}

export function NutritionCard({ resultId }: NutritionCardProps) {
  const { t } = useTranslation();
  const [nutrition, setNutrition] = useState<NutritionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  async function fetchNutrition() {
    setLoading(true);
    try {
      const response = await fetch("/api/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultId }),
      });
      if (!response.ok) throw new Error("Failed");
      const data = (await response.json()) as { nutrition: NutritionData };
      setNutrition(data.nutrition);
      setLoaded(true);
    } catch {
      toast.error(t.errors.genericMessage);
    } finally {
      setLoading(false);
    }
  }

  if (!loaded) {
    return (
      <Button variant="outline" size="sm" onClick={fetchNutrition} disabled={loading} className="gap-1.5">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Apple className="h-4 w-4" />}
        {t.nutrition?.button ?? "Nährwerte"}
      </Button>
    );
  }

  if (!nutrition) return null;

  const macros = [
    { label: t.nutrition?.calories ?? "Kalorien", value: nutrition.calories_per_serving, unit: "kcal", color: "bg-orange-500" },
    { label: t.nutrition?.protein ?? "Protein", value: nutrition.protein_grams, unit: "g", color: "bg-red-500" },
    { label: t.nutrition?.carbs ?? "Kohlenhydrate", value: nutrition.carbs_grams, unit: "g", color: "bg-blue-500" },
    { label: t.nutrition?.fat ?? "Fett", value: nutrition.fat_grams, unit: "g", color: "bg-yellow-500" },
    { label: t.nutrition?.fiber ?? "Ballaststoffe", value: nutrition.fiber_grams, unit: "g", color: "bg-green-500" },
  ].filter((m) => m.value !== null);

  const maxCal = Math.max(...macros.map((m) => m.value ?? 0), 1);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Apple className="h-4 w-4" />
            {t.nutrition?.title ?? "Nährwerte (geschätzt)"}
          </CardTitle>
          {nutrition.servings && (
            <p className="text-xs text-muted-foreground">{t.nutrition?.perServing ?? "Pro Portion"}: {nutrition.servings}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {macros.map((macro) => (
              <div key={macro.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{macro.label}</span>
                  <span className="font-medium">{macro.value} {macro.unit}</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <motion.div
                    className={`h-full rounded-full ${macro.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${((macro.value ?? 0) / maxCal) * 100}%` }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  />
                </div>
              </div>
            ))}
            {nutrition.notes && <p className="mt-2 text-xs text-muted-foreground">{nutrition.notes}</p>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
