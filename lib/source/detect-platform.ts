import type { SourcePlatform } from "@/types";

const PLATFORM_PATTERNS: Array<{ platform: SourcePlatform; patterns: RegExp[] }> = [
  {
    platform: "instagram",
    patterns: [
      /(?:www\.)?instagram\.com\/(?:reel|p|stories)\//i,
      /(?:www\.)?instagr\.am\//i,
    ],
  },
  {
    platform: "tiktok",
    patterns: [
      /(?:www\.)?tiktok\.com\/@[^/]+\/video\//i,
      /(?:www\.)?tiktok\.com\/t\//i,
      /vm\.tiktok\.com\//i,
    ],
  },
  {
    platform: "facebook",
    patterns: [
      /(?:www\.)?facebook\.com\/.*\/videos\//i,
      /(?:www\.)?facebook\.com\/reel\//i,
      /(?:www\.)?fb\.watch\//i,
    ],
  },
  {
    platform: "youtube",
    patterns: [
      /(?:www\.)?youtube\.com\/shorts\//i,
      /(?:www\.)?youtu\.be\//i,
      /(?:www\.)?youtube\.com\/watch/i,
    ],
  },
];

export function detectPlatform(url: string): SourcePlatform {
  try {
    const normalized = url.trim().toLowerCase();
    for (const { platform, patterns } of PLATFORM_PATTERNS) {
      for (const pattern of patterns) {
        if (pattern.test(normalized)) {
          return platform;
        }
      }
    }
    return "unknown";
  } catch {
    return "unknown";
  }
}

export function isSupportedPlatform(platform: SourcePlatform): boolean {
  return platform !== "unknown";
}
