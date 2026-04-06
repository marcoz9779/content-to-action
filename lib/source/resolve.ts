import type { SourcePlatform } from "@/types";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import os from "os";
import crypto from "crypto";
import fs from "fs/promises";

const execFileAsync = promisify(execFile);

const YT_DLP_BIN = process.env.YT_DLP_PATH ?? (process.platform === "darwin" ? "/opt/homebrew/bin/yt-dlp" : "/usr/local/bin/yt-dlp");

export interface SourceResolution {
  resolved: boolean;
  videoPath: string | null;
  thumbnailUrl: string | null;
  title: string | null;
  creator: string | null;
  caption: string | null;
  duration: number | null;
  fallbackMessage: string | null;
}

async function binaryExists(binPath: string): Promise<boolean> {
  try {
    await fs.access(binPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Try to get basic metadata via oEmbed (works without yt-dlp).
 * Supports YouTube, TikTok, Instagram.
 */
async function resolveViaOEmbed(url: string): Promise<{ title: string | null; thumbnailUrl: string | null; creator: string | null; caption: string | null }> {
  // Try oEmbed endpoints
  const oembedEndpoints = [
    { match: /youtube\.com|youtu\.be/, endpoint: `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json` },
    { match: /tiktok\.com/, endpoint: `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}` },
  ];

  for (const { match, endpoint } of oembedEndpoints) {
    if (!match.test(url)) continue;
    try {
      const response = await fetch(endpoint, { signal: AbortSignal.timeout(10000) });
      if (!response.ok) continue;
      const data = (await response.json()) as Record<string, unknown>;
      const title = (data.title as string) ?? null;
      return {
        title,
        thumbnailUrl: (data.thumbnail_url as string) ?? null,
        creator: (data.author_name as string) ?? null,
        caption: title,
      };
    } catch {
      continue;
    }
  }

  // Fallback: Try to fetch page HTML and extract og:title/og:description
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ContentToAction/1.0)",
      },
    });
    if (response.ok) {
      const html = await response.text();
      const ogTitle = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"/) ??
                      html.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:title"/);
      const ogDesc = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"/) ??
                     html.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:description"/);
      const ogImage = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"/) ??
                      html.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:image"/);

      const title = ogTitle?.[1] ?? null;
      const description = ogDesc?.[1] ?? null;

      if (title || description) {
        return {
          title,
          thumbnailUrl: ogImage?.[1] ?? null,
          creator: null,
          caption: description ?? title,
        };
      }
    }
  } catch {
    // Ignore fallback errors
  }

  return { title: null, thumbnailUrl: null, creator: null, caption: null };
}

export async function resolveSource(
  url: string,
  _platform: SourcePlatform
): Promise<SourceResolution> {
  let title: string | null = null;
  let creator: string | null = null;
  let caption: string | null = null;
  let thumbnailUrl: string | null = null;
  let duration: number | null = null;

  const hasYtDlp = await binaryExists(YT_DLP_BIN);

  if (hasYtDlp) {
    // Full yt-dlp path: metadata + video download
    try {
      const { stdout } = await execFileAsync(
        YT_DLP_BIN,
        ["--dump-json", "--no-download", url],
        { timeout: 30000 }
      );

      const metadata = JSON.parse(stdout) as Record<string, unknown>;
      title = (metadata.title as string) ?? null;
      creator = (metadata.uploader as string) ?? (metadata.channel as string) ?? null;
      caption = (metadata.description as string) ?? null;
      thumbnailUrl = (metadata.thumbnail as string) ?? null;
      duration = typeof metadata.duration === "number" ? metadata.duration : null;
    } catch (error) {
      console.error("yt-dlp metadata extraction failed:", error);
    }

    // Download the video
    try {
      const tmpDir = os.tmpdir();
      const filename = `cta-${crypto.randomUUID()}`;
      const outputTemplate = path.join(tmpDir, `${filename}.%(ext)s`);

      await execFileAsync(
        YT_DLP_BIN,
        [
          "-f", "worst[ext=mp4]/worst",
          "--no-playlist",
          "--max-filesize", "50m",
          "-o", outputTemplate,
          url,
        ],
        { timeout: 120000 }
      );

      const files = await fs.readdir(tmpDir);
      const downloaded = files.find((f) => f.startsWith(filename));

      if (downloaded) {
        return {
          resolved: true,
          videoPath: path.join(tmpDir, downloaded),
          thumbnailUrl,
          title,
          creator,
          caption,
          duration,
          fallbackMessage: null,
        };
      }
    } catch (error) {
      console.error("yt-dlp video download failed:", error);
    }

    // yt-dlp exists but download failed
    return {
      resolved: false,
      videoPath: null,
      thumbnailUrl,
      title,
      creator,
      caption,
      duration,
      fallbackMessage: "Video konnte nicht heruntergeladen werden. Bitte füge den Caption-Text hinzu.",
    };
  }

  // No yt-dlp available (e.g. Vercel) — use oEmbed fallback for metadata + thumbnail + caption
  console.log("yt-dlp not available, using oEmbed fallback");
  const oembed = await resolveViaOEmbed(url);
  title = oembed.title;
  thumbnailUrl = oembed.thumbnailUrl;
  creator = oembed.creator;
  caption = oembed.caption;

  return {
    resolved: false,
    videoPath: null,
    thumbnailUrl,
    title,
    creator,
    caption,
    duration: null,
    fallbackMessage: caption
      ? null // We have caption from oEmbed, can proceed with text analysis
      : "Video-Download ist auf dem Server nicht verfügbar. Bitte füge den Caption-Text hinzu oder lade das Video direkt hoch.",
  };
}

export async function cleanupVideoFile(videoPath: string): Promise<void> {
  try {
    await fs.unlink(videoPath);
  } catch {
    // Ignore cleanup errors
  }
}
