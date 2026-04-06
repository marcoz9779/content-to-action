import { describe, it, expect, vi } from "vitest";
import { validateFileType, validateFileSize } from "@/lib/storage/upload";

// Mock getEnv for file size validation
vi.mock("@/lib/security/env", () => ({
  getEnv: () => ({
    MAX_UPLOAD_MB: 50,
  }),
}));

describe("validateFileType", () => {
  it("accepts MP4", () => {
    expect(validateFileType("video/mp4")).toBe(true);
  });

  it("accepts MOV", () => {
    expect(validateFileType("video/quicktime")).toBe(true);
  });

  it("accepts WebM", () => {
    expect(validateFileType("video/webm")).toBe(true);
  });

  it("rejects non-video types", () => {
    expect(validateFileType("image/jpeg")).toBe(false);
    expect(validateFileType("application/pdf")).toBe(false);
    expect(validateFileType("text/plain")).toBe(false);
  });

  it("rejects non-allowed video types", () => {
    expect(validateFileType("video/avi")).toBe(false);
    expect(validateFileType("video/mkv")).toBe(false);
  });
});

describe("validateFileSize", () => {
  it("accepts files under limit", () => {
    expect(validateFileSize(10 * 1024 * 1024)).toBe(true); // 10MB
  });

  it("accepts files at exact limit", () => {
    expect(validateFileSize(50 * 1024 * 1024)).toBe(true); // 50MB
  });

  it("rejects files over limit", () => {
    expect(validateFileSize(51 * 1024 * 1024)).toBe(false); // 51MB
  });
});
