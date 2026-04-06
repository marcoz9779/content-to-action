import { getClassificationProvider } from "./providers";
import type { ClassificationResult } from "@/types";

export async function classifyContent(
  text: string
): Promise<ClassificationResult> {
  const provider = getClassificationProvider();
  return provider.classify({ text });
}
