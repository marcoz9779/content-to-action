"use client";

import { Button } from "@/components/ui/button";
import { CheckSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface ShoppingItem {
  name: string;
  quantity?: string;
  checked: boolean;
}

interface AppleRemindersExportProps {
  listName: string;
  items: ShoppingItem[];
}

/**
 * Exports shopping list items to Apple Reminders via .ics (VTODO) file.
 * This works on iOS, macOS, and any calendar app that supports VTODO.
 */
export function AppleRemindersExport({ listName, items }: AppleRemindersExportProps) {
  const [loading, setLoading] = useState(false);

  function generateIcs(): string {
    const unchecked = items.filter((i) => !i.checked);
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    let ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Content to Action//Shopping List//DE",
      "X-WR-CALNAME:" + listName,
    ].join("\r\n");

    for (const item of unchecked) {
      const uid = crypto.randomUUID();
      const summary = item.quantity ? `${item.quantity} ${item.name}` : item.name;
      ics += "\r\n" + [
        "BEGIN:VTODO",
        `UID:${uid}`,
        `DTSTAMP:${timestamp}`,
        `SUMMARY:${summary}`,
        "STATUS:NEEDS-ACTION",
        `CATEGORIES:${listName}`,
        "END:VTODO",
      ].join("\r\n");
    }

    ics += "\r\nEND:VCALENDAR";
    return ics;
  }

  async function handleExport() {
    setLoading(true);
    try {
      const unchecked = items.filter((i) => !i.checked);
      if (unchecked.length === 0) {
        toast.error("Keine offenen Artikel zum Exportieren");
        setLoading(false);
        return;
      }

      // Try native share first (iOS)
      if (navigator.share && navigator.canShare) {
        const icsContent = generateIcs();
        const blob = new Blob([icsContent], { type: "text/calendar" });
        const file = new File([blob], `${listName}.ics`, { type: "text/calendar" });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: listName,
            files: [file],
          });
          toast.success("An Erinnerungen gesendet");
          setLoading(false);
          return;
        }
      }

      // Fallback: Download .ics file
      const icsContent = generateIcs();
      const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${listName}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Einkaufsliste als Erinnerungen heruntergeladen");
    } catch (error) {
      // User cancelled share — not an error
      if ((error as Error)?.name !== "AbortError") {
        toast.error("Export fehlgeschlagen");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={loading} className="gap-1.5">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckSquare className="h-4 w-4" />}
      <span className="hidden sm:inline">Erinnerungen</span>
    </Button>
  );
}
