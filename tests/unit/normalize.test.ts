import { describe, it, expect } from "vitest";
import { normalizeContent } from "@/lib/ai/normalize";

describe("normalizeContent", () => {
  it("consolidates transcript and caption", () => {
    const result = normalizeContent({
      transcript: "I'm going to show you how to make pasta",
      ocrText: null,
      captionText: "Easy pasta recipe!",
      commentText: null,
    });
    expect(result).toContain("[TRANSCRIPT]");
    expect(result).toContain("make pasta");
    expect(result).toContain("[CAPTION]");
    expect(result).toContain("Easy pasta recipe!");
  });

  it("includes all available text sources", () => {
    const result = normalizeContent({
      transcript: "transcript text",
      ocrText: "screen text",
      captionText: "caption text",
      commentText: "comment text",
    });
    expect(result).toContain("[TRANSCRIPT]");
    expect(result).toContain("[ON-SCREEN TEXT]");
    expect(result).toContain("[CAPTION]");
    expect(result).toContain("[COMMENTS]");
  });

  it("skips null or empty sources", () => {
    const result = normalizeContent({
      transcript: null,
      ocrText: null,
      captionText: "only caption",
      commentText: "",
    });
    expect(result).not.toContain("[TRANSCRIPT]");
    expect(result).not.toContain("[ON-SCREEN TEXT]");
    expect(result).toContain("[CAPTION]");
    expect(result).not.toContain("[COMMENTS]");
  });

  it("throws when no content is available", () => {
    expect(() =>
      normalizeContent({
        transcript: null,
        ocrText: null,
        captionText: null,
        commentText: null,
      })
    ).toThrow("No content available");
  });

  it("throws when all content is empty strings", () => {
    expect(() =>
      normalizeContent({
        transcript: "",
        ocrText: "",
        captionText: "",
        commentText: "",
      })
    ).toThrow("No content available");
  });
});
