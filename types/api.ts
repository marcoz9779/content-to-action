import type { SourceType, JobStatus, ContentType } from "./database";
import type { StructuredOutput } from "./outputs";

export interface AnalyzeRequest {
  sourceType: SourceType;
  sourceUrl?: string;
  uploadPath?: string;
  captionText?: string;
  commentText?: string;
}

export interface AnalyzeResponse {
  jobId: string;
  status: JobStatus;
}

export interface UploadResponse {
  uploadPath: string;
}

export interface JobStatusResponse {
  id: string;
  status: JobStatus;
  progressPercent: number;
  errorMessage: string | null;
  resultId: string | null;
}

export interface ResultResponse {
  id: string;
  jobId: string;
  contentType: ContentType;
  title: string;
  summary: string;
  confidenceScore: number;
  warnings: string[];
  missingInformation: string[];
  structuredOutput: StructuredOutput;
  thumbnailUrl: string | null;
  sourceCreator: string | null;
  sourceUrl: string | null;
  createdAt: string;
}

export interface ExportRequest {
  format: "text" | "json";
}

export interface HealthResponse {
  status: "ok";
  timestamp: string;
}

export interface ApiError {
  error: string;
  details?: string;
}
