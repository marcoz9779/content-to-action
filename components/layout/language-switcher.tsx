"use client";

import { useTranslation, LOCALE_LABELS } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { Globe } from "lucide-react";

const LOCALES: Locale[] = ["de", "en", "fr", "it"];
const SHORT_LABELS: Record<Locale, string> = { de: "DE", en: "EN", fr: "FR", it: "IT" };

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();

  const currentIndex = LOCALES.indexOf(locale);
  const nextLocale = LOCALES[(currentIndex + 1) % LOCALES.length]!;

  return (
    <button
      onClick={() => setLocale(nextLocale)}
      className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      title={LOCALE_LABELS[locale]}
      aria-label={`${LOCALE_LABELS[locale]} — ${LOCALE_LABELS[nextLocale]}`}
    >
      <Globe className="h-3.5 w-3.5" />
      {SHORT_LABELS[locale]}
    </button>
  );
}
