"use client";

import { useTranslation } from "@/lib/i18n";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t py-6">
      <div className="container flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
        <p>{t.footer.tagline}</p>
        <p>{t.footer.disclaimer}</p>
      </div>
    </footer>
  );
}
