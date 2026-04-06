"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wand2, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";
import type { StructuredOutput } from "@/types";

interface ModifyPanelProps {
  resultId: string;
  onModified: (output: StructuredOutput, title: string, summary: string) => void;
}

export function ModifyPanel({ resultId, onModified }: ModifyPanelProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [customMod, setCustomMod] = useState("");
  const [loading, setLoading] = useState(false);

  const quickMods = [
    { label: t.modify?.vegan ?? "Vegan", value: "Make this vegan" },
    { label: t.modify?.glutenFree ?? "Glutenfrei", value: "Make this gluten-free" },
    { label: t.modify?.simpler ?? "Einfacher", value: "Simplify this — make it easier and faster" },
    { label: t.modify?.healthier ?? "Gesünder", value: "Make this healthier" },
    { label: t.modify?.budget ?? "Günstiger", value: "Make this budget-friendly with cheaper alternatives" },
  ];

  async function applyModification(modification: string) {
    setLoading(true);
    try {
      const response = await fetch("/api/modify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultId, modification }),
      });
      if (!response.ok) throw new Error("Failed");
      const data = (await response.json()) as { modifiedOutput: StructuredOutput; title: string; summary: string };
      onModified(data.modifiedOutput, data.title, data.summary);
      toast.success("Modified!");
      setOpen(false);
      setCustomMod("");
    } catch {
      toast.error(t.errors.genericMessage);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (customMod.trim()) applyModification(customMod.trim());
  }

  return (
    <div>
      <Button variant="outline" size="sm" onClick={() => setOpen(!open)} className="gap-1.5">
        <Wand2 className="h-4 w-4" />
        <span className="hidden sm:inline">Modify</span>
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden"
          >
            <div className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium">{t.modify?.title ?? "KI-Modifikation"}</h3>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setOpen(false)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="mb-3 flex flex-wrap gap-1.5">
                {quickMods.map((mod) => (
                  <Button key={mod.value} variant="secondary" size="sm" className="text-xs" disabled={loading} onClick={() => applyModification(mod.value)}>
                    {mod.label}
                  </Button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input placeholder={t.modify?.custom ?? "Eigene Änderung..."} value={customMod} onChange={(e) => setCustomMod(e.target.value)} disabled={loading} className="text-sm" />
                <Button type="submit" size="sm" disabled={loading || !customMod.trim()}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
