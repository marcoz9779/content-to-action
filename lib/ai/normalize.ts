import { consolidateText } from "./prompts/normalize";

export interface NormalizationInput {
  transcript: string | null;
  ocrText: string | null;
  captionText: string | null;
  commentText: string | null;
}

export function normalizeContent(input: NormalizationInput): string {
  const consolidated = consolidateText(
    input.transcript,
    input.ocrText,
    input.captionText,
    input.commentText
  );

  if (!consolidated) {
    throw new Error(
      "No content available for analysis. Please provide a caption, transcript, or video upload."
    );
  }

  return consolidated;
}
