"use client";

import { useState, useEffect } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/supabase/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SaveButtonProps {
  resultId: string;
}

export function SaveButton({ resultId }: SaveButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Check if already saved
    fetch(`/api/save?resultId=${resultId}&userId=${user.id}&check=1`)
      .then(() => { /* We'd need a GET endpoint, skip for now */ })
      .catch(() => {});
  }, [user, resultId]);

  async function handleToggle() {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    setLoading(true);
    try {
      if (saved) {
        const response = await fetch(
          `/api/save?resultId=${resultId}&userId=${user.id}`,
          { method: "DELETE" }
        );
        if (response.ok) {
          setSaved(false);
          toast.success("Removed from saved");
        }
      } else {
        const response = await fetch("/api/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resultId, userId: user.id }),
        });
        if (response.ok) {
          setSaved(true);
          toast.success("Saved");
        }
      }
    } catch {
      toast.error("Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={loading}
      title={user ? (saved ? "Remove" : "Save") : "Sign in to save"}
    >
      {saved ? (
        <BookmarkCheck className="h-4 w-4 text-primary" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
    </Button>
  );
}
