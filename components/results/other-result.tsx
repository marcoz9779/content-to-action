"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { List, CheckSquare } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import type { OtherOutput } from "@/types";

interface OtherResultProps {
  output: OtherOutput;
}

export function OtherResult({ output }: OtherResultProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <List className="h-4 w-4" />
            {t.otherResult.keyPoints}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {output.keyPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {point}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {output.suggestedActions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckSquare className="h-4 w-4" />
              {t.otherResult.suggestedActions}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {output.suggestedActions.map((action, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <span className="h-4 w-4 shrink-0 rounded border" />
                  {action}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
