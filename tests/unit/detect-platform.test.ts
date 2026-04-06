import { describe, it, expect } from "vitest";
import { detectPlatform } from "@/lib/source/detect-platform";

describe("detectPlatform", () => {
  it("detects Instagram reel URLs", () => {
    expect(detectPlatform("https://www.instagram.com/reel/ABC123/")).toBe(
      "instagram"
    );
    expect(detectPlatform("https://instagram.com/reel/ABC123/")).toBe(
      "instagram"
    );
  });

  it("detects Instagram post URLs", () => {
    expect(detectPlatform("https://www.instagram.com/p/ABC123/")).toBe(
      "instagram"
    );
  });

  it("detects Instagram short URLs", () => {
    expect(detectPlatform("https://instagr.am/reel/ABC123")).toBe("instagram");
  });

  it("detects TikTok video URLs", () => {
    expect(
      detectPlatform("https://www.tiktok.com/@user/video/1234567890")
    ).toBe("tiktok");
  });

  it("detects TikTok short URLs", () => {
    expect(detectPlatform("https://vm.tiktok.com/ZMd123/")).toBe("tiktok");
  });

  it("detects Facebook video URLs", () => {
    expect(
      detectPlatform("https://www.facebook.com/watch/videos/1234567890")
    ).toBe("facebook");
  });

  it("detects Facebook reel URLs", () => {
    expect(detectPlatform("https://www.facebook.com/reel/1234567890")).toBe(
      "facebook"
    );
  });

  it("detects Facebook short URLs", () => {
    expect(detectPlatform("https://fb.watch/abc123/")).toBe("facebook");
  });

  it("detects YouTube Shorts URLs", () => {
    expect(detectPlatform("https://www.youtube.com/shorts/ABC123")).toBe(
      "youtube"
    );
  });

  it("detects YouTube watch URLs", () => {
    expect(
      detectPlatform("https://www.youtube.com/watch?v=ABC123")
    ).toBe("youtube");
  });

  it("detects YouTube short URLs", () => {
    expect(detectPlatform("https://youtu.be/ABC123")).toBe("youtube");
  });

  it("returns unknown for unsupported URLs", () => {
    expect(detectPlatform("https://example.com/video")).toBe("unknown");
    expect(detectPlatform("https://twitter.com/post/123")).toBe("unknown");
  });

  it("returns unknown for invalid input", () => {
    expect(detectPlatform("")).toBe("unknown");
    expect(detectPlatform("not a url")).toBe("unknown");
  });

  it("handles URLs case-insensitively", () => {
    expect(detectPlatform("https://WWW.INSTAGRAM.COM/Reel/ABC123/")).toBe(
      "instagram"
    );
  });
});
