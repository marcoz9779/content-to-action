"use client";

import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="container py-16">
      <EmptyState
        title={t.errors.notFoundTitle}
        description={t.errors.notFoundMessage}
        action={
          <Button asChild><Link href="/">{t.errors.goHome}</Link></Button>
        }
      />
    </div>
  );
}
