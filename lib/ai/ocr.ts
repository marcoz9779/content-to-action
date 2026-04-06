import { getOcrProvider } from "./providers";
import type { OcrResult } from "@/types";

export async function extractOcrText(filePath: string): Promise<OcrResult> {
  const provider = getOcrProvider();
  return provider.extractText({ filePath });
}
