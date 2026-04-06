"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UploadDropzone } from "@/components/forms/upload-dropzone";
import { OptionalTextInputs } from "@/components/forms/optional-text-inputs";
import { ChefHat, Link2, Loader2, Upload, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function NewAnalysisPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sourceUrl, setSourceUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadPath, setUploadPath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [captionText, setCaptionText] = useState("");
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(true);

  const analyzeButtonRef = useRef<HTMLButtonElement>(null);

  // Pre-fill URL from query param
  useEffect(() => {
    const urlParam = searchParams.get("url");
    if (urlParam) {
      setSourceUrl(urlParam);
      // Auto-focus the analyze button after a short delay
      setTimeout(() => {
        analyzeButtonRef.current?.focus();
      }, 300);
    }
  }, [searchParams]);

  async function handleFileSelected(file: File) {
    setSelectedFile(file);
    setUploadError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const data = (await response.json()) as { uploadPath: string } | { error: string };
      if (!response.ok) {
        setUploadError((data as { error: string }).error);
        setUploadPath(null);
      } else {
        setUploadPath((data as { uploadPath: string }).uploadPath);
      }
    } catch {
      setUploadError(t.newAnalysis.errorUploadFailed);
      setUploadPath(null);
    } finally {
      setUploading(false);
    }
  }

  function handleFileClear() {
    setSelectedFile(null);
    setUploadPath(null);
    setUploadError(null);
  }

  async function handleAnalyze() {
    setError(null);
    setLoading(true);
    try {
      const body: Record<string, string> = {};

      // Determine source type based on what's available
      if (sourceUrl.trim()) {
        body.sourceType = "url";
        body.sourceUrl = sourceUrl.trim();
      } else if (uploadPath) {
        body.sourceType = "upload";
        body.uploadPath = uploadPath;
      } else {
        setError("Bitte gib eine URL ein oder lade ein Video hoch.");
        setLoading(false);
        return;
      }

      if (captionText.trim()) body.captionText = captionText.trim();
      if (commentText.trim()) body.commentText = commentText.trim();

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await response.json()) as { jobId: string; resultId?: string; status?: string } | { error: string; details?: string };
      if (!response.ok) {
        const errorData = data as { error: string; details?: string };
        setError(errorData.details ?? errorData.error);
        return;
      }
      const successData = data as { jobId: string; resultId?: string; status?: string };
      // If processing completed synchronously (Vercel), go directly to result
      if (successData.resultId) {
        router.push(`/app/results/${successData.resultId}`);
      } else {
        // Fallback to polling page (local dev with async processing)
        router.push(`/app/jobs/${successData.jobId}`);
      }
    } catch {
      setError(t.newAnalysis.errorGeneric);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleAnalyze();
  }

  const isDisabled = loading || (!sourceUrl.trim() && !uploadPath);

  return (
    <div className="container max-w-2xl py-8 md:py-12">
      {/* Page header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
          <ChefHat className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Rezept extrahieren</h1>
        <p className="mt-2 text-muted-foreground">
          Füge die URL eines Rezept-Videos ein und erhalte ein strukturiertes Rezept.
        </p>
      </div>

      <Card className="border-0 shadow-lg shadow-primary/5">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Primary: URL Input */}
            <div className="space-y-3">
              <Label htmlFor="recipe-url" className="flex items-center gap-2 text-base font-medium">
                <Link2 className="h-4 w-4 text-primary" />
                Rezept-URL einfügen
              </Label>
              <div className="relative">
                <Input
                  id="recipe-url"
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://tiktok.com/... oder instagram.com/reel/..."
                  disabled={loading}
                  className="h-14 rounded-xl border-2 border-muted pl-4 pr-4 text-base transition-all focus:border-primary md:text-lg"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Füge eine URL von TikTok, Instagram, YouTube, Facebook oder einer beliebigen Website ein
              </p>
            </div>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-4 text-sm text-muted-foreground">oder</span>
              </div>
            </div>

            {/* Secondary: Upload */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Upload className="h-4 w-4" />
                Video hochladen
              </Label>
              <UploadDropzone
                onFileSelected={handleFileSelected}
                onFileClear={handleFileClear}
                selectedFile={selectedFile}
                uploading={uploading}
                error={uploadError ?? undefined}
                disabled={loading}
              />
            </div>

            {/* Caption hint — important for URL analysis */}
            {sourceUrl.trim() && !captionText.trim() && !uploadPath && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                <strong>Tipp:</strong> {sourceUrl.includes("instagram.com")
                  ? "Instagram-Videos benötigen den Caption-Text. Kopiere die Beschreibung des Posts und füge sie unten ein."
                  : "Füge den Caption-Text des Videos hinzu für die beste Analyse-Qualität."}
              </div>
            )}

            {/* Collapsible optional inputs */}
            <div className="border-t pt-4">
              <button
                type="button"
                onClick={() => setShowOptions(!showOptions)}
                className="flex w-full items-center justify-between rounded-lg py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <span>Weitere Optionen</span>
                {showOptions ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {showOptions && (
                <div className="mt-4">
                  <OptionalTextInputs
                    captionText={captionText}
                    commentText={commentText}
                    onCaptionChange={setCaptionText}
                    onCommentChange={setCommentText}
                    disabled={loading}
                  />
                </div>
              )}
            </div>

            {/* Error display */}
            {error && (
              <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            {/* Submit button */}
            <Button
              ref={analyzeButtonRef}
              type="submit"
              size="lg"
              className="h-14 w-full gap-2 rounded-xl text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40"
              disabled={isDisabled || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Rezept wird extrahiert...
                </>
              ) : (
                <>
                  <ChefHat className="h-5 w-5" />
                  Rezept extrahieren
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
