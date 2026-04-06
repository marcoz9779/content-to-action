"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/shared/page-transition";
import { useTranslation } from "@/lib/i18n";
import {
  ArrowLeft,
  ArrowRight,
  X,
  Globe,
  Lock,
  Link as LinkIcon,
  Check,
  Clock,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import type { ContentType } from "@/types";

interface CollectionItem {
  id: string;
  resultId: string;
  addedAt: string;
  title: string;
  contentType: string;
  summary: string;
  confidenceScore: number;
  resultCreatedAt: string;
}

interface CollectionDetail {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  shareToken: string;
  createdAt: string;
  updatedAt: string;
  items: CollectionItem[];
}

export default function CollectionDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const collectionId = params.collectionId as string;

  const [collection, setCollection] = useState<CollectionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Inline editing
  const [editingName, setEditingName] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [descValue, setDescValue] = useState("");

  // Share link copied
  const [copied, setCopied] = useState(false);

  const fetchCollection = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/collections/${collectionId}`);
      if (response.ok) {
        const data = (await response.json()) as CollectionDetail;
        setCollection(data);
        setNameValue(data.name);
        setDescValue(data.description ?? "");
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  const updateCollection = async (updates: Record<string, unknown>) => {
    try {
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        const updated = await response.json();
        setCollection((prev) =>
          prev ? { ...prev, ...updated, items: prev.items } : prev
        );
        toast.success("Collection updated");
      } else {
        toast.error("Failed to update collection");
      }
    } catch {
      toast.error("Failed to update collection");
    }
  };

  const handleSaveName = () => {
    if (nameValue.trim() && nameValue.trim() !== collection?.name) {
      updateCollection({ name: nameValue.trim() });
    }
    setEditingName(false);
  };

  const handleSaveDesc = () => {
    if (descValue !== (collection?.description ?? "")) {
      updateCollection({ description: descValue });
    }
    setEditingDesc(false);
  };

  const handleTogglePublic = () => {
    if (!collection) return;
    updateCollection({ isPublic: !collection.isPublic });
  };

  const handleCopyLink = () => {
    if (!collection) return;
    const url = `${window.location.origin}/app/collections/shared/${collection.shareToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleRemoveItem = async (resultId: string) => {
    try {
      const response = await fetch(
        `/api/collections/${collectionId}/items?resultId=${resultId}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        setCollection((prev) =>
          prev
            ? {
                ...prev,
                items: prev.items.filter((item) => item.resultId !== resultId),
              }
            : prev
        );
        toast.success("Item removed");
      } else {
        toast.error("Failed to remove item");
      }
    } catch {
      toast.error("Failed to remove item");
    }
  };

  if (loading) {
    return (
      <PageTransition className="container max-w-2xl py-8">
        <div className="space-y-4">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-96 animate-pulse rounded bg-muted" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="h-16 animate-pulse rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!collection) {
    return (
      <PageTransition className="container max-w-2xl py-8">
        <EmptyState
          title="Collection not found"
          description="This collection may have been deleted."
          action={
            <Button asChild variant="outline">
              <Link href="/app/collections">Back to collections</Link>
            </Button>
          }
        />
      </PageTransition>
    );
  }

  return (
    <PageTransition className="container max-w-2xl py-8">
      {/* Back link */}
      <Link
        href="/app/collections"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to collections
      </Link>

      {/* Collection header */}
      <div className="mb-6 space-y-3">
        {/* Name */}
        {editingName ? (
          <div className="flex items-center gap-2">
            <Input
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveName();
                if (e.key === "Escape") {
                  setNameValue(collection.name);
                  setEditingName(false);
                }
              }}
              autoFocus
              className="text-2xl font-bold"
            />
            <Button size="sm" onClick={handleSaveName}>
              <Check className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <h1
            className="group flex cursor-pointer items-center gap-2 text-2xl font-bold"
            onClick={() => setEditingName(true)}
          >
            {collection.name}
            <Pencil className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </h1>
        )}

        {/* Description */}
        {editingDesc ? (
          <div className="space-y-2">
            <Textarea
              value={descValue}
              onChange={(e) => setDescValue(e.target.value)}
              placeholder="Add a description..."
              autoFocus
              rows={2}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveDesc}>
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setDescValue(collection.description ?? "");
                  setEditingDesc(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p
            className="group cursor-pointer text-sm text-muted-foreground"
            onClick={() => setEditingDesc(true)}
          >
            {collection.description || "Click to add a description..."}
            <Pencil className="ml-1 inline h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
          </p>
        )}

        {/* Share controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTogglePublic}
          >
            {collection.isPublic ? (
              <>
                <Globe className="mr-1 h-3.5 w-3.5" />
                Public
              </>
            ) : (
              <>
                <Lock className="mr-1 h-3.5 w-3.5" />
                Private
              </>
            )}
          </Button>
          {collection.isPublic && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
            >
              {copied ? (
                <>
                  <Check className="mr-1 h-3.5 w-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <LinkIcon className="mr-1 h-3.5 w-3.5" />
                  Copy share link
                </>
              )}
            </Button>
          )}
          <span className="text-xs text-muted-foreground">
            {collection.items.length}{" "}
            {collection.items.length === 1 ? "item" : "items"}
          </span>
        </div>
      </div>

      {/* Items list */}
      {collection.items.length === 0 ? (
        <EmptyState
          title="No items yet"
          description="Add analysis results to this collection from the history page."
          action={
            <Button asChild variant="outline">
              <Link href="/app/history">Browse history</Link>
            </Button>
          }
        />
      ) : (
        <StaggerContainer className="space-y-3">
          {collection.items.map((item) => (
            <StaggerItem key={item.id}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/app/results/${item.resultId}`}
                      className="min-w-0 flex-1 space-y-1"
                    >
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="secondary" className="text-xs">
                          {t.contentTypes[item.contentType as ContentType] ??
                            item.contentType}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(item.confidenceScore * 100)}%
                        </span>
                      </div>
                      <h3 className="font-medium leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.summary}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(item.resultCreatedAt)}
                      </div>
                    </Link>
                    <div className="flex flex-col items-center gap-2">
                      <Link href={`/app/results/${item.resultId}`}>
                        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </Link>
                      <button
                        onClick={() => handleRemoveItem(item.resultId)}
                        className="rounded p-1 text-muted-foreground/50 transition-colors hover:text-destructive"
                        title="Remove from collection"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </PageTransition>
  );
}
