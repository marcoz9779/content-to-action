export function buildNormalizationPrompt(
  transcript: string | null,
  ocrText: string | null,
  captionText: string | null,
  commentText: string | null
): string {
  const sections: string[] = [];

  if (transcript) {
    sections.push(`[TRANSCRIPT]\n${transcript}`);
  }
  if (ocrText) {
    sections.push(`[ON-SCREEN TEXT]\n${ocrText}`);
  }
  if (captionText) {
    sections.push(`[CAPTION]\n${captionText}`);
  }
  if (commentText) {
    sections.push(`[COMMENTS]\n${commentText}`);
  }

  return sections.join("\n\n");
}

export function consolidateText(
  transcript: string | null,
  ocrText: string | null,
  captionText: string | null,
  commentText: string | null
): string {
  const parts = [transcript, ocrText, captionText, commentText].filter(
    (part): part is string => !!part && part.trim().length > 0
  );

  if (parts.length === 0) {
    return "";
  }

  return buildNormalizationPrompt(
    transcript,
    ocrText,
    captionText,
    commentText
  );
}
