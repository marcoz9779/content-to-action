import { createServiceClient } from "@/lib/supabase/server";
import { detectPlatform } from "@/lib/source/detect-platform";
import { resolveSource, cleanupVideoFile } from "@/lib/source/resolve";
import { transcribeAudio } from "@/lib/ai/transcription";
import { cleanupFrames } from "@/lib/ai/vision";
import { runPipeline } from "@/lib/ai/pipeline";
import { PROGRESS_MAP } from "@/lib/constants";
import type { JobStatus } from "@/types";

interface JobRecord {
  id: string;
  source_type: string;
  source_url: string | null;
  upload_path: string | null;
  caption_text: string | null;
  comment_text: string | null;
}

async function updateJobStatus(
  jobId: string,
  status: JobStatus,
  extra?: Record<string, unknown>
) {
  const supabase = createServiceClient();
  await supabase
    .from("analysis_jobs")
    .update({
      status,
      progress_percent: PROGRESS_MAP[status] ?? 0,
      ...extra,
    })
    .eq("id", jobId);
}

async function failJob(jobId: string, errorMessage: string) {
  await updateJobStatus(jobId, "failed", {
    error_message: errorMessage,
    progress_percent: 0,
  });
}

export async function processJob(jobId: string): Promise<void> {
  const supabase = createServiceClient();

  const { data: job, error: fetchError } = await supabase
    .from("analysis_jobs")
    .select("*")
    .eq("id", jobId)
    .single<JobRecord>();

  if (fetchError || !job) {
    console.error(`Job ${jobId} not found:`, fetchError);
    return;
  }

  let videoPath: string | null = null;
  let framePaths: string[] = [];

  try {
    // Stage: fetching_source
    await updateJobStatus(jobId, "fetching_source");

    let transcript: string | null = null;
    let ocrText: string | null = null;
    let sourceTitle: string | null = null;
    let sourceCreator: string | null = null;
    let sourceCaption: string | null = null;
    let thumbnailUrl: string | null = null;

    const platform =
      job.source_type === "url" && job.source_url
        ? detectPlatform(job.source_url)
        : "unknown";

    if (job.source_type === "url" && job.source_url) {
      const resolution = await resolveSource(job.source_url, platform);
      sourceTitle = resolution.title;
      sourceCreator = resolution.creator;
      thumbnailUrl = resolution.thumbnailUrl;
      sourceCaption = resolution.caption;
      videoPath = resolution.videoPath;

      if (!resolution.resolved) {
        console.log(`Source not resolved for job ${jobId}: ${resolution.fallbackMessage}`);
      }
    }

    await supabase
      .from("analysis_jobs")
      .update({ source_platform: platform })
      .eq("id", jobId);

    // Stage: transcribing
    await updateJobStatus(jobId, "transcribing");

    if (videoPath) {
      try {
        const transcriptionResult = await transcribeAudio(videoPath);
        transcript = transcriptionResult.text;
        console.log(`Transcription complete for job ${jobId}: ${transcript.length} chars`);
      } catch (error) {
        console.error(`Transcription failed for job ${jobId}:`, error);
        // Add warning to result — transcription failed but we can still try with caption
      }
    } else {
      console.log(`No video file for job ${jobId} — skipping transcription`);
    }

    // Stage: extracting_ocr — use GPT-4o Vision on video frames
    await updateJobStatus(jobId, "extracting_ocr");

    if (videoPath) {
      try {
        const { extractKeyFrames: extractFn, analyzeFrames: analyzeFn } = await import("@/lib/ai/vision");
        const hasFFmpeg = await import("fs/promises").then((f) => f.access("/opt/homebrew/bin/ffmpeg").then(() => true).catch(() => false));
        if (hasFFmpeg) {
          framePaths = await extractFn(videoPath, 4);
          if (framePaths.length > 0) {
            ocrText = await analyzeFn(framePaths);
            console.log(`Vision analysis complete for job ${jobId}: ${ocrText.length} chars`);
          }
        } else {
          console.log(`ffmpeg not available for job ${jobId} — skipping frame analysis`);
        }
      } catch (error) {
        console.error(`Vision analysis failed for job ${jobId}:`, error);
      }
    }

    // Merge captions — include source title as additional context if nothing else available
    const captionParts = [job.caption_text, sourceCaption].filter(Boolean);
    // If we have a title but no other content, use title as minimal context
    if (captionParts.length === 0 && sourceTitle) {
      captionParts.push(sourceTitle);
    }
    const effectiveCaption = captionParts.join("\n\n");

    const hasContent =
      effectiveCaption.trim() ||
      job.comment_text?.trim() ||
      transcript ||
      ocrText;

    if (!hasContent) {
      await failJob(
        jobId,
        "Kein Inhalt zum Analysieren verfügbar. Das Video konnte nicht heruntergeladen oder transkribiert werden. Bitte füge den Caption-Text des Videos hinzu oder lade das Video direkt hoch."
      );
      return;
    }

    // Stage: classifying
    await updateJobStatus(jobId, "classifying");

    // Run full AI pipeline
    const pipelineResult = await runPipeline({
      transcript,
      ocrText,
      captionText: effectiveCaption || null,
      commentText: job.comment_text,
    });

    await updateJobStatus(jobId, "structuring");

    // Store artifacts
    await supabase.from("analysis_artifacts").insert({
      job_id: jobId,
      raw_transcript: transcript,
      raw_ocr_text: ocrText,
      raw_caption_text: effectiveCaption || null,
      raw_comment_text: job.comment_text,
      detected_language: null,
      source_title: sourceTitle,
      source_creator: sourceCreator,
      source_metadata: {},
    });

    // Store result
    const { data: result, error: resultError } = await supabase
      .from("analysis_results")
      .insert({
        job_id: jobId,
        content_type: pipelineResult.classification.contentType,
        title: pipelineResult.extraction.output.title,
        summary: pipelineResult.extraction.output.summary,
        confidence_score: pipelineResult.classification.confidence,
        warnings: pipelineResult.extraction.warnings,
        missing_information: pipelineResult.extraction.missingInformation,
        structured_output: pipelineResult.extraction.output,
        thumbnail_url: thumbnailUrl,
        source_creator: sourceCreator,
        source_url: job.source_url,
      })
      .select("id")
      .single<{ id: string }>();

    if (resultError || !result) {
      await failJob(jobId, "Failed to save analysis result.");
      return;
    }

    // Store tags
    const tags =
      "tags" in pipelineResult.extraction.output
        ? (pipelineResult.extraction.output as { tags?: string[] }).tags ?? []
        : [];
    if (tags.length > 0) {
      await supabase.from("result_tags").insert(
        tags.map((tag: string) => ({
          result_id: result.id,
          tag,
          category: "auto",
        }))
      );
    }

    await updateJobStatus(jobId, "completed");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    console.error(`Job ${jobId} failed:`, error);
    await failJob(jobId, message);
  } finally {
    if (videoPath) await cleanupVideoFile(videoPath);
    if (framePaths.length > 0) await cleanupFrames(framePaths);
  }
}
