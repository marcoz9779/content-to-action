import { createServiceClient } from "@/lib/supabase/server";
import { getEnv } from "@/lib/security/env";
import { ALLOWED_UPLOAD_TYPES } from "@/lib/constants";
import crypto from "crypto";

const BUCKET_NAME = "uploads";

export interface UploadResult {
  success: boolean;
  path: string | null;
  error: string | null;
}

export function validateFileType(mimeType: string): boolean {
  return (ALLOWED_UPLOAD_TYPES as readonly string[]).includes(mimeType);
}

export function validateFileSize(sizeBytes: number): boolean {
  const env = getEnv();
  const maxBytes = env.MAX_UPLOAD_MB * 1024 * 1024;
  return sizeBytes <= maxBytes;
}

function generateSafeFilename(originalName: string): string {
  const extension = originalName.split(".").pop()?.toLowerCase() ?? "mp4";
  const safeExtension = ["mp4", "mov", "webm"].includes(extension)
    ? extension
    : "mp4";
  const id = crypto.randomUUID();
  return `${id}.${safeExtension}`;
}

export async function uploadFile(file: File): Promise<UploadResult> {
  if (!validateFileType(file.type)) {
    return {
      success: false,
      path: null,
      error: `Invalid file type: ${file.type}. Accepted: MP4, MOV, WebM.`,
    };
  }

  if (!validateFileSize(file.size)) {
    const env = getEnv();
    return {
      success: false,
      path: null,
      error: `File too large. Maximum size: ${env.MAX_UPLOAD_MB}MB.`,
    };
  }

  const safeName = generateSafeFilename(file.name);
  const filePath = `${BUCKET_NAME}/${safeName}`;

  const supabase = createServiceClient();
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(safeName, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return {
      success: false,
      path: null,
      error: "Failed to upload file. Please try again.",
    };
  }

  return {
    success: true,
    path: filePath,
    error: null,
  };
}
