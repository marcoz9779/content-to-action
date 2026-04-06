"use client";

import { Link2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/lib/i18n";

interface UrlInputCardProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function UrlInputCard({
  value,
  onChange,
  error,
  disabled,
}: UrlInputCardProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <Label htmlFor="source-url" className="flex items-center gap-1.5">
        <Link2 className="h-4 w-4" />
        {t.newAnalysis.urlLabel}
      </Label>
      <Input
        id="source-url"
        type="url"
        placeholder={t.newAnalysis.urlPlaceholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? "url-error" : undefined}
        className="h-12 text-base"
      />
      {error && (
        <p id="url-error" className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <p className="text-xs text-muted-foreground">{t.newAnalysis.urlHint}</p>
    </div>
  );
}
