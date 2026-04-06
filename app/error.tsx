"use client";

import { ErrorState } from "@/components/shared/error-state";
import { useTranslation } from "@/lib/i18n";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="container py-16">
      <ErrorState
        title={t.errors.genericTitle}
        message={t.errors.genericMessage}
        onRetry={reset}
      />
    </div>
  );
}
