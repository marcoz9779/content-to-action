"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Wrench, Clock, Gauge } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import type { DIYOutput } from "@/types";

interface DIYResultProps {
  output: DIYOutput;
}

export function DIYResult({ output }: DIYResultProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {(output.estimatedEffort || output.difficultyLevel) && (
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {output.estimatedEffort && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> {output.estimatedEffort}
            </span>
          )}
          {output.difficultyLevel && (
            <span className="flex items-center gap-1">
              <Gauge className="h-4 w-4" /> {output.difficultyLevel}
            </span>
          )}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-4 w-4" />
            {t.diyResult.materials}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1.5">
            {output.materials.map((material, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <span className="h-4 w-4 shrink-0 rounded border" />
                {material}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wrench className="h-4 w-4" />
            {t.diyResult.tools}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1.5">
            {output.tools.map((tool, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {tool}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t.diyResult.steps}</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {output.steps.map((step, index) => (
              <li key={index} className="flex gap-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {index + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
