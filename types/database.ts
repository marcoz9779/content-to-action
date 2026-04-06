export type JobStatus =
  | "queued"
  | "fetching_source"
  | "transcribing"
  | "extracting_ocr"
  | "classifying"
  | "structuring"
  | "completed"
  | "failed";

export type SourceType = "url" | "upload";

export type SourcePlatform =
  | "instagram"
  | "tiktok"
  | "facebook"
  | "youtube"
  | "unknown";

export type ContentType = "recipe" | "business" | "diy" | "workout" | "travel" | "fashion" | "tech_review" | "education" | "other";

export interface AnalysisJob {
  id: string;
  userId: string | null;
  sourceType: SourceType;
  sourcePlatform: SourcePlatform;
  sourceUrl: string | null;
  uploadPath: string | null;
  captionText: string | null;
  commentText: string | null;
  status: JobStatus;
  progressPercent: number;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisArtifact {
  id: string;
  jobId: string;
  rawTranscript: string | null;
  rawOcrText: string | null;
  rawCaptionText: string | null;
  rawCommentText: string | null;
  detectedLanguage: string | null;
  sourceTitle: string | null;
  sourceCreator: string | null;
  sourceMetadata: Record<string, unknown>;
  createdAt: string;
}

export interface AnalysisResult {
  id: string;
  jobId: string;
  userId: string | null;
  contentType: ContentType;
  title: string;
  summary: string;
  confidenceScore: number;
  warnings: string[];
  missingInformation: string[];
  structuredOutput: Record<string, unknown>;
  createdAt: string;
}

export interface SavedResult {
  id: string;
  userId: string;
  resultId: string;
  createdAt: string;
}

export interface AnalyticsEvent {
  id: string;
  userId: string | null;
  eventName: string;
  eventPayload: Record<string, unknown>;
  createdAt: string;
}
