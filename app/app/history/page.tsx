"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/shared/page-transition";
import { useTranslation } from "@/lib/i18n";
import { Search, ArrowRight, Clock, Trash2, Tag, X } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import type { ContentType } from "@/types";

interface ResultListItem {
  id: string;
  jobId: string;
  contentType: string;
  title: string;
  summary: string;
  confidenceScore: number;
  thumbnailUrl: string | null;
  createdAt: string;
  tags: string[];
}

interface TagCount {
  tag: string;
  count: number;
}

const FILTER_TYPES = ["all", "recipe", "business", "diy", "workout", "travel", "fashion", "tech_review", "education", "other"] as const;

export default function HistoryPage() {
  const { t } = useTranslation();
  const [results, setResults] = useState<ResultListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [availableTags, setAvailableTags] = useState<TagCount[]>([]);
  const [tagsLoading, setTagsLoading] = useState(true);

  // Fetch available tags
  useEffect(() => {
    async function fetchTags() {
      setTagsLoading(true);
      try {
        const response = await fetch("/api/tags");
        if (response.ok) {
          const data = (await response.json()) as { tags: TagCount[] };
          setAvailableTags(data.tags);
        }
      } catch {
        // Silent fail
      } finally {
        setTagsLoading(false);
      }
    }
    fetchTags();
  }, []);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("contentType", filter);
      if (search.trim()) params.set("search", search.trim());
      if (selectedTag) params.set("tag", selectedTag);
      const response = await fetch(`/api/results?${params}`);
      if (response.ok) {
        const data = (await response.json()) as { results: ResultListItem[] };
        setResults(data.results);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [filter, search, selectedTag]);

  useEffect(() => {
    const timer = setTimeout(fetchResults, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchResults, search]);

  const handleTagClick = (tag: string) => {
    setSelectedTag((prev) => (prev === tag ? null : tag));
  };

  return (
    <PageTransition className="container max-w-2xl py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t.saved.title}</h1>
        <p className="mt-1 text-muted-foreground">{t.saved.description}</p>
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTER_TYPES.map((type) => (
            <Button
              key={type}
              variant={filter === type ? "default" : "outline"}
              size="sm"
              className="text-xs"
              onClick={() => setFilter(type)}
            >
              {type === "all" ? "All" : t.contentTypes[type as ContentType] ?? type}
            </Button>
          ))}
        </div>

        {/* Tag filter section */}
        {!tagsLoading && availableTags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Tag className="h-3 w-3" />
              <span>Tags</span>
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag(null)}
                  className="ml-1 inline-flex items-center gap-0.5 rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted-foreground/20"
                >
                  Clear
                  <X className="h-2.5 w-2.5" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.slice(0, 20).map(({ tag, count }) => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                  <span className="text-[10px] opacity-60">({count})</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          title={search || selectedTag ? "No results found" : t.saved.emptyTitle}
          description={search || selectedTag ? "Try a different search term or filter." : t.saved.emptyDesc}
          action={
            !search && !selectedTag ? (
              <Button asChild variant="outline">
                <Link href="/app/new">{t.saved.emptyCta}</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <StaggerContainer className="space-y-3">
          {results.map((result) => (
            <StaggerItem key={result.id}>
              <Link href={`/app/results/${result.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {result.thumbnailUrl && (
                        <div className="hidden shrink-0 overflow-hidden rounded-lg sm:block">
                          <img
                            src={result.thumbnailUrl}
                            alt={result.title}
                            className="h-20 w-28 object-cover"
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge variant="secondary" className="text-xs">
                            {t.contentTypes[result.contentType as ContentType] ?? result.contentType}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(result.confidenceScore * 100)}%
                          </span>
                        </div>
                        <h3 className="font-medium leading-tight">{result.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{result.summary}</p>
                        {result.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {result.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDate(result.createdAt)}
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (confirm("Dieses Ergebnis löschen?")) {
                              fetch(`/api/results/${result.id}/delete`, { method: "DELETE" })
                                .then(() => {
                                  setResults((prev) => prev.filter((r) => r.id !== result.id));
                                  toast.success("Gelöscht");
                                })
                                .catch(() => toast.error("Fehler beim Löschen"));
                            }
                          }}
                          className="rounded p-1 text-muted-foreground/50 transition-colors hover:text-destructive"
                          title="Delete"
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
