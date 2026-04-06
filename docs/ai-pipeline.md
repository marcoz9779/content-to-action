# AI Pipeline

## Overview

The AI pipeline transforms raw content (video, text, captions) into structured, actionable output. It is designed as a layered system with provider abstraction at each stage.

## Pipeline Stages

```
Input → Normalize → Transcribe → OCR → Consolidate → Classify → Extract → Persist
```

### 1. Input Normalization
- Sanitize and validate input text (captions, comments)
- Detect source platform from URL
- Prepare metadata

### 2. Source Resolution
- Resolve URL to downloadable content (where possible)
- Fall back to caption/comment text if video cannot be fetched
- Upload path used directly for uploaded files

### 3. Transcription
- Extract speech from video/audio
- Provider interface: `TranscriptionProvider`
- Default: OpenAI Whisper
- Returns raw transcript text

### 4. OCR (Optical Character Recognition)
- Extract on-screen text from video frames
- Provider interface: `OcrProvider`
- MVP: stub implementation (caption text as proxy)
- Returns raw OCR text

### 5. Consolidation
- Merge transcript, OCR text, caption, and comment into a single context block
- Deduplicate overlapping content
- Prepare for classification

### 6. Classification
- Determine content type: recipe, business, diy, workout, other
- Uses consolidated text as input
- Returns content type + confidence score
- Provider interface: `ClassificationProvider`

### 7. Structured Extraction
- Type-specific extraction using dedicated prompts
- Each content type has its own prompt template and output schema
- Provider interface: `ExtractionProvider`
- Validates output against Zod schema
- Flags missing/uncertain data as warnings

### 8. Persistence
- Store artifacts (transcript, OCR, metadata)
- Store final result with structured output
- Update job status to completed

## Provider Interfaces

```typescript
interface TranscriptionProvider {
  transcribe(input: TranscriptionInput): Promise<TranscriptionResult>;
}

interface OcrProvider {
  extractText(input: OcrInput): Promise<OcrResult>;
}

interface ClassificationProvider {
  classify(input: ClassificationInput): Promise<ClassificationResult>;
}

interface ExtractionProvider {
  extract(input: ExtractionInput): Promise<ExtractionResult>;
}
```

## Prompt Design Principles

- Request strict JSON output
- Enumerate expected fields
- Include rules for missing/uncertain data
- Never hallucinate — mark unknown data explicitly
- Separate observed facts from inferred structure
- Keep outputs concise and actionable

## Error Handling

- If transcription fails → use caption/comment text only
- If classification fails → mark job as failed with clear error
- If extraction fails → mark job as failed, store raw response for debugging
- If Zod validation fails → mark job as failed, log validation errors
- Never crash the app — all failures are handled gracefully
