"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/shared/page-transition";
import { useAuth } from "@/lib/supabase/auth";
import { Eye, Plus, Trash2, Instagram, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface WatchedAccount {
  id: string;
  platform: string;
  accountHandle: string;
  isActive: boolean;
  lastCheckedAt: string | null;
  createdAt: string;
}

const PLATFORMS = [
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "tiktok", label: "TikTok", icon: Eye },
  { value: "youtube", label: "YouTube", icon: Eye },
  { value: "facebook", label: "Facebook", icon: Eye },
] as const;

export default function WatchPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [watches, setWatches] = useState<WatchedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [handle, setHandle] = useState("");
  const [platform, setPlatform] = useState<string>("instagram");
  const [adding, setAdding] = useState(false);

  const fetchWatches = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/watch?userId=${user.id}`);
      if (response.ok) {
        const data = (await response.json()) as { watches: WatchedAccount[] };
        setWatches(data.watches);
      }
    } catch {
      // Silent
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    fetchWatches();
  }, [user, router, fetchWatches]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !handle.trim()) return;
    setAdding(true);
    try {
      const response = await fetch("/api/watch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, platform, accountHandle: handle.trim() }),
      });
      if (response.ok) {
        toast.success(`Watching @${handle.trim()}`);
        setHandle("");
        fetchWatches();
      } else {
        const err = (await response.json()) as { error: string };
        toast.error(err.error);
      }
    } catch {
      toast.error("Failed to add");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/watch?id=${id}`, { method: "DELETE" });
      setWatches((prev) => prev.filter((w) => w.id !== id));
      toast.success("Removed");
    } catch {
      toast.error("Failed");
    }
  }

  if (!user) return null;

  return (
    <PageTransition className="container max-w-2xl py-8">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Eye className="h-6 w-6" />
          Watch Accounts
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor accounts for new content. Coming soon: automatic analysis of new posts.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Add Account</CardTitle>
          <CardDescription>Enter an account handle to start watching</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {PLATFORMS.map((p) => (
                <Button
                  key={p.value}
                  type="button"
                  variant={platform === p.value ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                  onClick={() => setPlatform(p.value)}
                >
                  {p.label}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="@username"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                disabled={adding}
              />
              <Button type="submit" disabled={adding || !handle.trim()}>
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : watches.length === 0 ? (
        <EmptyState
          title="No accounts watched"
          description="Add an account above to start monitoring."
        />
      ) : (
        <StaggerContainer className="space-y-3">
          {watches.map((watch) => (
            <StaggerItem key={watch.id}>
              <Card>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Eye className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">@{watch.accountHandle}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">{watch.platform}</Badge>
                        {watch.isActive ? (
                          <span className="text-emerald-600">Active</span>
                        ) : (
                          <span className="text-muted-foreground">Paused</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(watch.id)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </PageTransition>
  );
}
