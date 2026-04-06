import type { OcrProvider, OcrInput, OcrResult } from "@/types";

/**
 * Stub OCR provider for MVP.
 * In production, replace with Google Vision, AWS Textract, or similar.
 * For now, returns empty text — caption text serves as the OCR proxy.
 */
export class StubOcrProvider implements OcrProvider {
  async extractText(_input: OcrInput): Promise<OcrResult> {
    return {
      text: "",
      confidence: null,
    };
  }
}
