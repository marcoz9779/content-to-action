import { describe, it, expect } from "vitest";
import { analyzeRequestSchema, exportRequestSchema } from "@/lib/validation/schemas";

describe("analyzeRequestSchema", () => {
  it("accepts valid URL analysis request", () => {
    const result = analyzeRequestSchema.safeParse({
      sourceType: "url",
      sourceUrl: "https://instagram.com/reel/abc123/",
      captionText: "some caption",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid upload analysis request", () => {
    const result = analyzeRequestSchema.safeParse({
      sourceType: "upload",
      uploadPath: "uploads/abc-123.mp4",
    });
    expect(result.success).toBe(true);
  });

  it("rejects URL request without sourceUrl", () => {
    const result = analyzeRequestSchema.safeParse({
      sourceType: "url",
    });
    expect(result.success).toBe(false);
  });

  it("rejects upload request without uploadPath", () => {
    const result = analyzeRequestSchema.safeParse({
      sourceType: "upload",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid sourceType", () => {
    const result = analyzeRequestSchema.safeParse({
      sourceType: "invalid",
      sourceUrl: "https://example.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid URL format", () => {
    const result = analyzeRequestSchema.safeParse({
      sourceType: "url",
      sourceUrl: "not a url",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional caption and comment text", () => {
    const result = analyzeRequestSchema.safeParse({
      sourceType: "url",
      sourceUrl: "https://instagram.com/reel/abc123/",
      captionText: "caption here",
      commentText: "comment here",
    });
    expect(result.success).toBe(true);
  });

  it("rejects caption text exceeding max length", () => {
    const result = analyzeRequestSchema.safeParse({
      sourceType: "url",
      sourceUrl: "https://instagram.com/reel/abc123/",
      captionText: "a".repeat(10001),
    });
    expect(result.success).toBe(false);
  });
});

describe("exportRequestSchema", () => {
  it("accepts text format", () => {
    const result = exportRequestSchema.safeParse({ format: "text" });
    expect(result.success).toBe(true);
  });

  it("accepts json format", () => {
    const result = exportRequestSchema.safeParse({ format: "json" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid format", () => {
    const result = exportRequestSchema.safeParse({ format: "xml" });
    expect(result.success).toBe(false);
  });
});
