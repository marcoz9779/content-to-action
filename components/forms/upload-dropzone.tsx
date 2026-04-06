"use client";

import { useCallback, useState } from "react";
import { Upload, FileVideo, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

interface UploadDropzoneProps {
  onFileSelected: (file: File) => void;
  onFileClear: () => void;
  selectedFile: File | null;
  uploading: boolean;
  error?: string;
  disabled?: boolean;
}

export function UploadDropzone({
  onFileSelected,
  onFileClear,
  selectedFile,
  uploading,
  error,
  disabled,
}: UploadDropzoneProps) {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragging(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) onFileSelected(file);
    },
    [disabled, onFileSelected]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelected(file);
    },
    [onFileSelected]
  );

  if (selectedFile) {
    return (
      <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <FileVideo className="h-8 w-8 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
          </div>
          {!uploading && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onFileClear}
              aria-label={t.newAnalysis.removeFile}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {uploading && (
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full animate-pulse rounded-full bg-primary" style={{ width: "60%" }} />
          </div>
        )}
        {error && (
          <p className="mt-2 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label
        htmlFor="file-upload"
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">{t.newAnalysis.dropzoneText}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {t.newAnalysis.dropzoneHint}
        </p>
        <input
          id="file-upload"
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          onChange={handleFileInput}
          disabled={disabled}
          className="sr-only"
        />
      </label>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
