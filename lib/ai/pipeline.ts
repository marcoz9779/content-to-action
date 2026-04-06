import { normalizeContent } from "./normalize";
import { classifyContent } from "./classify";
import { extractStructuredOutput } from "./extract";
import type { ClassificationResult, ExtractionResult } from "@/types";

export interface PipelineInput {
  transcript: string | null;
  ocrText: string | null;
  captionText: string | null;
  commentText: string | null;
}

export interface PipelineResult {
  normalizedText: string;
  classification: ClassificationResult;
  extraction: ExtractionResult;
}

export async function runPipeline(
  input: PipelineInput
): Promise<PipelineResult> {
  // Step 1: Normalize and consolidate all text sources
  const normalizedText = normalizeContent(input);

  // Step 2: Classify content type
  const classification = await classifyContent(normalizedText);

  // Step 3: Extract structured output based on classification
  const extraction = await extractStructuredOutput(
    normalizedText,
    classification.contentType
  );

  return {
    normalizedText,
    classification,
    extraction,
  };
}
