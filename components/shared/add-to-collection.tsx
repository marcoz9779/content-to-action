"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/supabase/auth";
import { FolderPlus, Check, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Collection {
  id: string;
  name: string;
  itemCount: number;
}

interface AddToCollectionProps {
  resultId: string;
}

export function AddToCollection({ resultId }: AddToCollectionProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowCreate(false);
        setNewName("");
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const fetchCollections = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/collections?userId=${user.id}`);
      if (response.ok) {
        const data = (await response.json()) as { collections: Collection[] };
        setCollections(data.collections);
      }

      // Check which collections already contain this result
      // We'll need to check each one — or we can be clever and
      // check all at once by fetching each collection's items
      // For simplicity, we'll determine membership as the user toggles
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setOpen(!open);
    if (!open) {
      fetchCollections();
      setCheckedIds(new Set());
    }
  };

  const handleToggle = async (collectionId: string) => {
    const isChecked = checkedIds.has(collectionId);

    if (isChecked) {
      // Remove from collection
      try {
        const response = await fetch(
          `/api/collections/${collectionId}/items?resultId=${resultId}`,
          { method: "DELETE" }
        );
        if (response.ok) {
          setCheckedIds((prev) => {
            const next = new Set(prev);
            next.delete(collectionId);
            return next;
          });
          toast.success("Removed from collection");
        } else {
          toast.error("Failed to remove from collection");
        }
      } catch {
        toast.error("Failed to remove from collection");
      }
    } else {
      // Add to collection
      try {
        const response = await fetch(
          `/api/collections/${collectionId}/items`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ resultId }),
          }
        );
        if (response.ok) {
          setCheckedIds((prev) => new Set(prev).add(collectionId));
          toast.success("Added to collection");
        } else {
          const data = await response.json();
          if (response.status === 409) {
            // Already in collection, mark as checked
            setCheckedIds((prev) => new Set(prev).add(collectionId));
            toast.info("Already in collection");
          } else {
            toast.error(data.error || "Failed to add to collection");
          }
        }
      } catch {
        toast.error("Failed to add to collection");
      }
    }
  };

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
        setShowCreate(false);

        // Auto-add the result to the new collection
        const addResponse = await fetch(
          `/api/collections/${created.id}/items`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ resultId }),
          }
        );
        if (addResponse.ok) {
          setCheckedIds((prev) => new Set(prev).add(created.id));
          toast.success("Collection created and item added");
        } else {
          toast.success("Collection created");
        }
      } else {
        toast.error("Failed to create collection");
      }
    } catch {
      toast.error("Failed to create collection");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button variant="outline" size="sm" onClick={handleOpen}>
        <FolderPlus className="mr-2 h-4 w-4" />
        Add to collection
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border bg-popover p-2 shadow-lg">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {collections.length === 0 && !showCreate && (
                <p className="px-2 py-3 text-center text-sm text-muted-foreground">
                  No collections yet
                </p>
              )}

              <div className="max-h-48 overflow-y-auto">
                {collections.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => handleToggle(col.id)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent"
                  >
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded border">
                      {checkedIds.has(col.id) && (
                        <Check className="h-3 w-3 text-primary" />
                      )}
                    </div>
                    <span className="truncate">{col.name}</span>
                  </button>
                ))}
              </div>

              <div className="mt-1 border-t pt-1">
                {showCreate ? (
                  <div className="flex gap-1 p-1">
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Collection name..."
                      className="h-8 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCreate();
                        if (e.key === "Escape") {
                          setShowCreate(false);
                          setNewName("");
                        }
                      }}
                      autoFocus
                      disabled={creating}
                    />
                    <Button
                      size="sm"
                      className="h-8 shrink-0"
                      onClick={handleCreate}
                      disabled={creating || !newName.trim()}
                    >
                      {creating ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCreate(true)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <Plus className="h-4 w-4" />
                    Create new collection
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
