import { z } from "zod";

export const analyzeRequestSchema = z
  .object({
    sourceType: z.enum(["url", "upload"]),
    sourceUrl: z.string().url().optional(),
    uploadPath: z.string().min(1).optional(),
    captionText: z.string().max(10000).optional(),
    commentText: z.string().max(10000).optional(),
  })
  .refine(
    (data) => {
      if (data.sourceType === "url") return !!data.sourceUrl;
      if (data.sourceType === "upload") return !!data.uploadPath;
      return false;
    },
    {
      message:
        "sourceUrl is required for URL analysis, uploadPath is required for upload analysis",
    }
  );

export const exportRequestSchema = z.object({
  format: z.enum(["text", "json", "pdf"]),
});

export type AnalyzeRequestInput = z.infer<typeof analyzeRequestSchema>;
export type ExportRequestInput = z.infer<typeof exportRequestSchema>;
