import OpenAI from "openai";
import { getEnv } from "@/lib/security/env";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import os from "os";
import fs from "fs/promises";

const execFileAsync = promisify(execFile);

const FFMPEG_BIN = process.env.FFMPEG_PATH ?? (process.platform === "darwin" ? "/opt/homebrew/bin/ffmpeg" : "/usr/bin/ffmpeg");

/**
 * Extract key frames from a video file using ffmpeg.
 * Returns paths to extracted frame images.
 */
export async function extractKeyFrames(
  videoPath: string,
  maxFrames = 4
): Promise<string[]> {
  const tmpDir = os.tmpdir();
  const prefix = `cta-frame-${Date.now()}`;

  try {
    // Extract frames at even intervals, output as JPEG
    await execFileAsync(
      FFMPEG_BIN,
      [
        "-i", videoPath,
        "-vf", `fps=1/${Math.max(5, 30 / maxFrames)},scale=512:-1`, // ~1 frame every N seconds
        "-frames:v", String(maxFrames),
        "-q:v", "8",
        path.join(tmpDir, `${prefix}-%02d.jpg`),
      ],
      { timeout: 30000 }
    );

    // Find extracted frames
    const files = await fs.readdir(tmpDir);
    const frames = files
      .filter((f) => f.startsWith(prefix) && f.endsWith(".jpg"))
      .sort()
      .map((f) => path.join(tmpDir, f));

    return frames;
  } catch (error) {
    console.error("Frame extraction failed:", error);
    return [];
  }
}

/**
 * Analyze video frames using GPT-4o Vision to extract on-screen text and visual context.
 */
export async function analyzeFrames(framePaths: string[]): Promise<string> {
  if (framePaths.length === 0) return "";

  const env = getEnv();
  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

  // Read frames as base64
  const imageContents: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [];

  for (const framePath of framePaths) {
    try {
      const buffer = await fs.readFile(framePath);
      const base64 = buffer.toString("base64");
      imageContents.push({
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${base64}`,
          detail: "low",
        },
      });
    } catch {
      // Skip unreadable frames
    }
  }

  if (imageContents.length === 0) return "";

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze these video frames. Extract:
1. Any on-screen text (titles, captions, labels, ingredient lists, steps shown)
2. Visual context (what is being shown, demonstrated, or prepared)
3. Any measurements, quantities, or technical details visible

Be factual and concise. List everything you observe. Do not hallucinate or guess what isn't visible.`,
          },
          ...imageContents,
        ],
      },
    ],
    temperature: 0.1,
    max_tokens: 1000,
  });

  return response.choices[0]?.message?.content ?? "";
}

/**
 * Clean up extracted frame files.
 */
export async function cleanupFrames(framePaths: string[]): Promise<void> {
  for (const p of framePaths) {
    try { await fs.unlink(p); } catch { /* ignore */ }
  }
}
