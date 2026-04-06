import type {
  ClassificationProvider,
  ExtractionProvider,
  TranscriptionProvider,
  OcrProvider,
} from "@/types";
import {
  OpenAIClassificationProvider,
  OpenAIExtractionProvider,
  OpenAITranscriptionProvider,
} from "./openai";
import { StubOcrProvider } from "./stub-ocr";

export function getClassificationProvider(): ClassificationProvider {
  return new OpenAIClassificationProvider();
}

export function getExtractionProvider(): ExtractionProvider {
  return new OpenAIExtractionProvider();
}

export function getTranscriptionProvider(): TranscriptionProvider {
  return new OpenAITranscriptionProvider();
}

export function getOcrProvider(): OcrProvider {
  return new StubOcrProvider();
}
