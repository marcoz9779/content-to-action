"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/shared/page-transition";
import { useAuth } from "@/lib/supabase/auth";
import { Folder, FolderPlus, Trash2, ArrowRight, Clock } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

interface Collection {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  shareToken: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function CollectionsPage() {
  
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchCollections = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/collections?userId=${user.id}`);
      if (response.ok) {
        const data = (await response.json()) as { collections: Collection[] };
        setCollections(data.collections);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleCreate = async () => {
    if (!user || !newName.trim()) return;
    setCreating(true);
    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, name: newName.trim() }),
      });
      if (response.ok) {
        const created = (await response.json()) as Collection;
        setCollections((prev) => [created, ...prev]);
        setNewName("");
        toast.success("Collection created");
      } else {
        toast.error("Failed to create collection");
      }
    } catch {
      toast.error("Failed to create collection");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (collectionId: string) => {
    if (!confirm("Delete this collection?")) return;
    try {
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setCollections((prev) => prev.filter((c) => c.id !== collectionId));
        toast.success("Collection deleted");
      } else {
        toast.error("Failed to delete collection");
      }
    } catch {
      toast.error("Failed to delete collection");
    }
  };

  return (
    <PageTransition className="container max-w-2xl py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Collections</h1>
        <p className="mt-1 text-muted-foreground">
          Group your analysis results into collections.
        </p>
      </div>

      {/* Create new collection form */}
      <div className="mb-6 flex gap-2">
        <Input
          placeholder="New collection name..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreate();
          }}
          disabled={creating}
        />
        <Button
          onClick={handleCreate}
          disabled={creating || !newName.trim()}
          className="shrink-0"
        >
          <FolderPlus className="mr-2 h-4 w-4" />
          Create
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-16 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : collections.length === 0 ? (
        <EmptyState
          title="No collections yet"
          description="Create your first collection to start organizing your analysis results."
        />
      ) : (
        <StaggerContainer className="space-y-3">
          {collections.map((collection) => (
            <StaggerItem key={collection.id}>
              <Link href={`/app/collections/${collection.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Folder className="h-4 w-4 text-primary" />
                          <h3 className="font-medium leading-tight">
                            {collection.name}
                          </h3>
                        </div>
                        {collection.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {collection.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>
                            {collection.itemCount}{" "}
                            {collection.itemCount === 1 ? "item" : "items"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(collection.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDelete(collection.id);
                          }}
                          className="rounded p-1 text-muted-foreground/50 transition-colors hover:text-destructive"
                          title="Delete collection"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </PageTransition>
  );
}
