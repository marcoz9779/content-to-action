"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/lib/i18n";

interface OptionalTextInputsProps {
  captionText: string;
  commentText: string;
  onCaptionChange: (value: string) => void;
  onCommentChange: (value: string) => void;
  disabled?: boolean;
}

export function OptionalTextInputs({
  captionText,
  commentText,
  onCaptionChange,
  onCommentChange,
  disabled,
}: OptionalTextInputsProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="caption-text">
          {t.newAnalysis.captionLabel}{" "}
          <span className="text-muted-foreground">{t.newAnalysis.captionOptional}</span>
        </Label>
        <Textarea
          id="caption-text"
          placeholder={t.newAnalysis.captionPlaceholder}
          value={captionText}
          onChange={(e) => onCaptionChange(e.target.value)}
          disabled={disabled}
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="comment-text">
          {t.newAnalysis.commentsLabel}{" "}
          <span className="text-muted-foreground">{t.newAnalysis.commentsOptional}</span>
        </Label>
        <Textarea
          id="comment-text"
          placeholder={t.newAnalysis.commentsPlaceholder}
          value={commentText}
          onChange={(e) => onCommentChange(e.target.value)}
          disabled={disabled}
          rows={3}
        />
      </div>
    </div>
  );
}
