import { getExtractionProvider } from "./providers";
import type { ContentType, ExtractionResult } from "@/types";

export async function extractStructuredOutput(
  text: string,
  contentType: ContentType
): Promise<ExtractionResult> {
  const provider = getExtractionProvider();
  return provider.extract({ text, contentType });
}
