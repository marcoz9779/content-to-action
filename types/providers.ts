import type { ContentType } from "./database";
import type { StructuredOutput } from "./outputs";

export interface TranscriptionInput {
  filePath: string;
  language?: string;
}

export interface TranscriptionResult {
  text: string;
  language: string | null;
  durationSeconds: number | null;
}

export interface OcrInput {
  filePath: string;
}

export interface OcrResult {
  text: string;
  confidence: number | null;
}

export interface ClassificationInput {
  text: string;
}

export interface ClassificationResult {
  contentType: ContentType;
  confidence: number;
}

export interface ExtractionInput {
  text: string;
  contentType: ContentType;
}

export interface ExtractionResult {
  output: StructuredOutput;
  warnings: string[];
  missingInformation: string[];
}

export interface TranscriptionProvider {
  transcribe(input: TranscriptionInput): Promise<TranscriptionResult>;
}

export interface OcrProvider {
  extractText(input: OcrInput): Promise<OcrResult>;
}

export interface ClassificationProvider {
  classify(input: ClassificationInput): Promise<ClassificationResult>;
}

export interface ExtractionProvider {
  extract(input: ExtractionInput): Promise<ExtractionResult>;
}
