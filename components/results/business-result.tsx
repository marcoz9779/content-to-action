"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, CheckSquare, Box, Wrench } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import type { BusinessOutput } from "@/types";

interface BusinessResultProps {
  output: BusinessOutput;
}

export function BusinessResult({ output }: BusinessResultProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-4 w-4" />
            {t.businessResult.keyLearnings}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {output.keyLearnings.map((learning, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {learning}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckSquare className="h-4 w-4" />
            {t.businessResult.actionItems}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {output.actionItems.map((item, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <span className="h-4 w-4 shrink-0 rounded border" />
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {output.frameworks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Box className="h-4 w-4" />
              {t.businessResult.frameworks}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {output.frameworks.map((framework, index) => (
                <span key={index} className="rounded-md bg-secondary px-2.5 py-1 text-sm font-medium">
                  {framework}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {output.toolsMentioned.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wrench className="h-4 w-4" />
              {t.businessResult.toolsMentioned}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {output.toolsMentioned.map((tool, index) => (
                <span key={index} className="rounded-md bg-secondary px-2.5 py-1 text-sm font-medium">
                  {tool}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
