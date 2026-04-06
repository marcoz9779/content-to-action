import { TypeBadge } from "@/components/shared/type-badge";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import type { ContentType } from "@/types";

interface ResultHeaderProps {
  title: string;
  summary: string;
  contentType: ContentType;
  confidenceScore: number;
}

export function ResultHeader({
  title,
  summary,
  contentType,
  confidenceScore,
}: ResultHeaderProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <TypeBadge contentType={contentType} />
        <ConfidenceBadge score={confidenceScore} />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">{summary}</p>
    </div>
  );
}
