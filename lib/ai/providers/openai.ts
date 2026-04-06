import OpenAI from "openai";
import { getEnv } from "@/lib/security/env";
import type {
  ClassificationProvider,
  ClassificationInput,
  ClassificationResult,
  ExtractionProvider,
  ExtractionInput,
  ExtractionResult,
  TranscriptionProvider,
  TranscriptionInput,
  TranscriptionResult,
} from "@/types";
import { classificationOutputSchema, structuredOutputSchema } from "@/lib/ai/schemas";
import { buildClassificationPrompt } from "@/lib/ai/prompts/classify";
import { buildRecipeExtractionPrompt } from "@/lib/ai/prompts/extract-recipe";
import { buildBusinessExtractionPrompt } from "@/lib/ai/prompts/extract-business";
import { buildDIYExtractionPrompt } from "@/lib/ai/prompts/extract-diy";
import { buildWorkoutExtractionPrompt } from "@/lib/ai/prompts/extract-workout";
import { buildTravelExtractionPrompt } from "@/lib/ai/prompts/extract-travel";
import { buildFashionExtractionPrompt } from "@/lib/ai/prompts/extract-fashion";
import { buildTechReviewExtractionPrompt } from "@/lib/ai/prompts/extract-tech-review";
import { buildEducationExtractionPrompt } from "@/lib/ai/prompts/extract-education";
import { buildOtherExtractionPrompt } from "@/lib/ai/prompts/extract-other";
import type { ContentType } from "@/types";

function getOpenAIClient(): OpenAI {
  const env = getEnv();
  return new OpenAI({ apiKey: env.OPENAI_API_KEY });
}

const EXTRACTION_PROMPT_BUILDERS: Record<ContentType, (text: string) => string> = {
  recipe: buildRecipeExtractionPrompt,
  business: buildBusinessExtractionPrompt,
  diy: buildDIYExtractionPrompt,
  workout: buildWorkoutExtractionPrompt,
  travel: buildTravelExtractionPrompt,
  fashion: buildFashionExtractionPrompt,
  tech_review: buildTechReviewExtractionPrompt,
  education: buildEducationExtractionPrompt,
  other: buildOtherExtractionPrompt,
};

export class OpenAIClassificationProvider implements ClassificationProvider {
  async classify(input: ClassificationInput): Promise<ClassificationResult> {
    const env = getEnv();
    const client = getOpenAIClient();
    const prompt = buildClassificationPrompt(input.text);

    const response = await client.chat.completions.create({
      model: env.OPENAI_MODEL_CLASSIFY,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty classification response from OpenAI");
    }

    const parsed = JSON.parse(content) as unknown;
    const validated = classificationOutputSchema.parse(parsed);

    return {
      contentType: validated.contentType,
      confidence: validated.confidence,
    };
  }
}

export class OpenAIExtractionProvider implements ExtractionProvider {
  async extract(input: ExtractionInput): Promise<ExtractionResult> {
    const env = getEnv();
    const client = getOpenAIClient();

    const promptBuilder = EXTRACTION_PROMPT_BUILDERS[input.contentType];
    const prompt = promptBuilder(input.text);

    const response = await client.chat.completions.create({
      model: env.OPENAI_MODEL_EXTRACT,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty extraction response from OpenAI");
    }

    const parsed = JSON.parse(content) as unknown;
    const validated = structuredOutputSchema.parse(parsed);

    // Extract warnings and missing info from the validated output
    const warnings = "warnings" in validated ? (validated.warnings as string[]) : [];
    const missingInformation =
      "missingInformation" in validated
        ? (validated.missingInformation as string[])
        : [];

    return {
      output: validated,
      warnings,
      missingInformation,
    };
  }
}

export class OpenAITranscriptionProvider implements TranscriptionProvider {
  async transcribe(input: TranscriptionInput): Promise<TranscriptionResult> {
    const client = getOpenAIClient();

    // Read the file from the provided path
    const fs = await import("fs");
    const fileStream = fs.createReadStream(input.filePath);

    const response = await client.audio.transcriptions.create({
      model: "whisper-1",
      file: fileStream,
      ...(input.language ? { language: input.language } : {}),
    });

    return {
      text: response.text,
      language: input.language ?? null,
      durationSeconds: null,
    };
  }
}
