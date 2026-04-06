import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage/upload";
import type { UploadResponse, ApiError } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json<ApiError>(
        { error: "No file provided. Please select a video file to upload." },
        { status: 400 }
      );
    }

    const result = await uploadFile(file);

    if (!result.success || !result.path) {
      const status = result.error?.includes("too large") ? 413 : 400;
      return NextResponse.json<ApiError>(
        { error: result.error ?? "Upload failed." },
        { status }
      );
    }

    return NextResponse.json<UploadResponse>({ uploadPath: result.path });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json<ApiError>(
      { error: "An unexpected error occurred during upload." },
      { status: 500 }
    );
  }
}
