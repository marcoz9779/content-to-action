"use client";

import { useState } from "react";
import { Loader2, FileText, FileJson, FileDown, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { toast } from "sonner";

interface ExportMenuProps {
  resultId: string;
}

export function ExportMenu({ resultId }: ExportMenuProps) {
  const { t } = useTranslation();
  const [exporting, setExporting] = useState<string | null>(null);
  const [shared, setShared] = useState(false);

  async function handleExport(format: "text" | "json" | "pdf") {
    setExporting(format);
    try {
      const response = await fetch(`/api/export/${resultId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format }),
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") ?? "";
      const filenameMatch = disposition.match(/filename="(.+)"/);
      const ext = format === "json" ? "json" : format === "pdf" ? "pdf" : "txt";
      const filename = filenameMatch?.[1] ?? `export.${ext}`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(format.toUpperCase() + " exported");
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(null);
    }
  }

  async function handleShare() {
    const url = `${window.location.origin}/app/results/${resultId}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Content to Action", url });
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        toast.success("Link copied");
        setTimeout(() => setShared(false), 2000);
      }
    } catch {
      await navigator.clipboard.writeText(url);
      setShared(true);
      toast.success("Link copied");
      setTimeout(() => setShared(false), 2000);
    }
  }

  return (
    <div className="flex gap-1.5">
      <Button variant="outline" size="sm" onClick={() => handleExport("text")} disabled={!!exporting} title={t.results.exportText}>
        {exporting === "text" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
        <span className="hidden sm:inline">{t.results.exportText}</span>
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleExport("json")} disabled={!!exporting} title={t.results.exportJson}>
        {exporting === "json" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileJson className="h-4 w-4" />}
        <span className="hidden sm:inline">{t.results.exportJson}</span>
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleExport("pdf")} disabled={!!exporting} title="PDF">
        {exporting === "pdf" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
        <span className="hidden sm:inline">PDF</span>
      </Button>
      <Button variant="outline" size="sm" onClick={handleShare} title="Share">
        {shared ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      </Button>
    </div>
  );
}
