"use client";

import { Badge } from "@/components/ui/badge";
import { ChefHat, Briefcase, Wrench, Dumbbell, Plane, Shirt, Cpu, GraduationCap, FileText } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import type { ContentType } from "@/types";

const CONTENT_TYPE_ICONS: Record<ContentType, React.ReactNode> = {
  recipe: <ChefHat className="h-3 w-3" />,
  business: <Briefcase className="h-3 w-3" />,
  diy: <Wrench className="h-3 w-3" />,
  workout: <Dumbbell className="h-3 w-3" />,
  travel: <Plane className="h-3 w-3" />,
  fashion: <Shirt className="h-3 w-3" />,
  tech_review: <Cpu className="h-3 w-3" />,
  education: <GraduationCap className="h-3 w-3" />,
  other: <FileText className="h-3 w-3" />,
};

interface TypeBadgeProps {
  contentType: ContentType;
}

export function TypeBadge({ contentType }: TypeBadgeProps) {
  const { t } = useTranslation();

  return (
    <Badge variant="secondary" className="gap-1">
      {CONTENT_TYPE_ICONS[contentType]}
      {t.contentTypes[contentType]}
    </Badge>
  );
}
