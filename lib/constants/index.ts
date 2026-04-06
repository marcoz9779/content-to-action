export const JOB_STATUS = {
  QUEUED: "queued",
  FETCHING_SOURCE: "fetching_source",
  TRANSCRIBING: "transcribing",
  EXTRACTING_OCR: "extracting_ocr",
  CLASSIFYING: "classifying",
  STRUCTURING: "structuring",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export const SOURCE_TYPES = {
  URL: "url",
  UPLOAD: "upload",
} as const;

export const SOURCE_PLATFORMS = {
  INSTAGRAM: "instagram",
  TIKTOK: "tiktok",
  FACEBOOK: "facebook",
  YOUTUBE: "youtube",
  UNKNOWN: "unknown",
} as const;

export const CONTENT_TYPES = {
  RECIPE: "recipe",
  BUSINESS: "business",
  DIY: "diy",
  WORKOUT: "workout",
  TRAVEL: "travel",
  FASHION: "fashion",
  TECH_REVIEW: "tech_review",
  EDUCATION: "education",
  OTHER: "other",
} as const;

export const PROGRESS_MAP: Record<string, number> = {
  queued: 5,
  fetching_source: 15,
  transcribing: 35,
  extracting_ocr: 50,
  classifying: 65,
  structuring: 85,
  completed: 100,
  failed: 0,
};

export const ALLOWED_UPLOAD_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
] as const;

export const ALLOWED_UPLOAD_EXTENSIONS = [".mp4", ".mov", ".webm"] as const;

export const POLLING_INTERVAL_MS = 2000;

export const CONTENT_TYPE_LABELS: Record<string, string> = {
  recipe: "Recipe",
  business: "Business",
  diy: "DIY",
  workout: "Workout",
  travel: "Travel",
  fashion: "Fashion",
  tech_review: "Tech Review",
  education: "Education",
  other: "Other",
};

export const JOB_STATUS_LABELS: Record<string, string> = {
  queued: "Queued",
  fetching_source: "Fetching content",
  transcribing: "Transcribing audio",
  extracting_ocr: "Reading on-screen text",
  classifying: "Detecting content type",
  structuring: "Structuring output",
  completed: "Complete",
  failed: "Failed",
};
