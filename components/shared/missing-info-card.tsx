"use client";

import { Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";

interface MissingInfoCardProps {
  items: string[];
}

export function MissingInfoCard({ items }: MissingInfoCardProps) {
  const { t } = useTranslation();

  if (items.length === 0) return null;

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Info className="h-5 w-5 shrink-0 text-blue-600" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-800">{t.results.missingInfoTitle}</p>
            <ul className="space-y-1">
              {items.map((item, index) => (
                <li key={index} className="text-sm text-blue-700">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
