import { getTranscriptionProvider } from "./providers";
import type { TranscriptionResult } from "@/types";

export async function transcribeAudio(
  filePath: string,
  language?: string
): Promise<TranscriptionResult> {
  const provider = getTranscriptionProvider();
  return provider.transcribe({ filePath, language });
}
