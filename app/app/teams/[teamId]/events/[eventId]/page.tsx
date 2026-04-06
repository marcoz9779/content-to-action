"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  PageTransition,
  SlideUp,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/page-transition";
import {
  Plus,
  Trash2,
  Copy,
  Share2,
  Check,
  X,
  CalendarDays,
  ShoppingCart,
  PartyPopper,
  ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const CATEGORIES = [
  "Fleisch & Grillgut",
  "Salate & Beilagen",
  "Getranke",
  "Brot & Snacks",
  "Dessert",
  "Besteck & Geschirr",
  "Sonstiges",
];

interface AssignedMember {
  id: string;
  displayName: string;
  color: string;
}

interface EventItem {
  id: string;
  itemName: string;
  quantity: string | null;
  category: string | null;
  assignedTo: string | null;
  assignedMember: AssignedMember | null;
  checked: boolean;
  createdAt: string;
}

interface EventMember {
  id: string;
  displayName: string;
  color: string;
  role: string;
}

interface EventData {
  id: string;
  teamId: string;
  name: string;
  description: string | null;
  eventDate: string | null;
  createdAt: string;
  items: EventItem[];
  members: EventMember[];
}

export default function EventPage({
  params,
}: {
  params: Promise<{ teamId: string; eventId: string }>;
}) {
  const { teamId, eventId } = use(params);
  const router = useRouter();

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);

  // Add item form
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("");
  const [newItemAssignedTo, setNewItemAssignedTo] = useState("");
  const [addingItem, setAddingItem] = useState(false);

  // Filter by person
  const [filterMemberId, setFilterMemberId] = useState<string | null>(null);

  // Edit event name
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState("");

  const fetchEvent = useCallback(async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) throw new Error("Failed to fetch event");
      const data = (await response.json()) as EventData;
      setEvent(data);
      setEditName(data.name);
    } catch {
      toast.error("Fehler beim Laden des Events");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItemName.trim()) return;
    setAddingItem(true);
    try {
      const response = await fetch(`/api/events/${eventId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemName: newItemName.trim(),
          quantity: newItemQuantity.trim() || undefined,
          category: newItemCategory || undefined,
          assignedTo: newItemAssignedTo || undefined,
        }),
      });
      if (!response.ok) throw new Error("Failed to add item");
      const item = (await response.json()) as EventItem;
      setEvent((prev) =>
        prev ? { ...prev, items: [...prev.items, item] } : prev
      );
      setNewItemName("");
      setNewItemQuantity("");
      // Keep category and assignment for quick consecutive adds
      toast.success("Hinzugefugt!");
    } catch {
      toast.error("Fehler beim Hinzufugen");
    } finally {
      setAddingItem(false);
    }
  }

  async function handleToggleChecked(item: EventItem) {
    try {
      const response = await fetch(`/api/events/${eventId}/items`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item.id,
          checked: !item.checked,
        }),
      });
      if (!response.ok) throw new Error("Failed to update");
      const updated = (await response.json()) as EventItem;
      setEvent((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((i) => (i.id === updated.id ? updated : i)),
            }
          : prev
      );
    } catch {
      toast.error("Fehler beim Aktualisieren");
    }
  }

  async function handleChangeAssignment(itemId: string, memberId: string | null) {
    try {
      const response = await fetch(`/api/events/${eventId}/items`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          assignedTo: memberId,
        }),
      });
      if (!response.ok) throw new Error("Failed to update");
      const updated = (await response.json()) as EventItem;
      setEvent((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((i) => (i.id === updated.id ? updated : i)),
            }
          : prev
      );
    } catch {
      toast.error("Fehler beim Zuweisen");
    }
  }

  async function handleDeleteItem(itemId: string) {
    try {
      const response = await fetch(
        `/api/events/${eventId}/items?itemId=${itemId}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to delete");
      setEvent((prev) =>
        prev
          ? { ...prev, items: prev.items.filter((i) => i.id !== itemId) }
          : prev
      );
      toast.success("Geloscht");
    } catch {
      toast.error("Fehler beim Löschen");
    }
  }

  async function handleUpdateName() {
    if (!editName.trim() || editName.trim() === event?.name) {
      setEditingName(false);
      return;
    }
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (!response.ok) throw new Error("Failed to update");
      setEvent((prev) => (prev ? { ...prev, name: editName.trim() } : prev));
      setEditingName(false);
      toast.success("Event-Name aktualisiert");
    } catch {
      toast.error("Fehler beim Aktualisieren");
    }
  }

  async function handleShareEvent() {
    if (!event) return;

    const lines: string[] = [];
    lines.push(`--- ${event.name} ---`);
    if (event.eventDate) {
      lines.push(
        `Datum: ${new Date(event.eventDate).toLocaleDateString("de-CH", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}`
      );
    }
    if (event.description) {
      lines.push(event.description);
    }
    lines.push("");

    // Group by member
    const memberItems = new Map<string, EventItem[]>();
    const unassigned: EventItem[] = [];

    for (const item of event.items) {
      if (item.assignedMember) {
        const existing = memberItems.get(item.assignedMember.displayName) ?? [];
        existing.push(item);
        memberItems.set(item.assignedMember.displayName, existing);
      } else {
        unassigned.push(item);
      }
    }

    for (const [memberName, items] of memberItems.entries()) {
      lines.push(`${memberName}:`);
      for (const item of items) {
        const checkMark = item.checked ? "[x]" : "[ ]";
        const qty = item.quantity ? ` (${item.quantity})` : "";
        lines.push(`  ${checkMark} ${item.itemName}${qty}`);
      }
      lines.push("");
    }

    if (unassigned.length > 0) {
      lines.push("Nicht zugewiesen:");
      for (const item of unassigned) {
        const checkMark = item.checked ? "[x]" : "[ ]";
        const qty = item.quantity ? ` (${item.quantity})` : "";
        lines.push(`  ${checkMark} ${item.itemName}${qty}`);
      }
    }

    const text = lines.join("\n");

    if (navigator.share) {
      try {
        await navigator.share({ title: event.name, text });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Event-Übersicht kopiert!");
    }
  }

  if (loading) {
    return (
      <div className="container max-w-2xl py-8">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-4 w-64 rounded bg-muted" />
          <Card>
            <CardContent className="p-6">
              <div className="h-32 rounded bg-muted" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container max-w-2xl py-8">
        <PageTransition>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">Event nicht gefunden.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push(`/app/teams/${teamId}`)}
              >
                Zuruck zum Team
              </Button>
            </CardContent>
          </Card>
        </PageTransition>
      </div>
    );
  }

  const filteredItems = filterMemberId
    ? event.items.filter((item) => item.assignedTo === filterMemberId)
    : event.items;

  // Summary: per-member stats
  const memberStats = event.members.map((member) => {
    const items = event.items.filter((i) => i.assignedTo === member.id);
    const done = items.filter((i) => i.checked).length;
    return { ...member, total: items.length, done };
  });

  return (
    <PageTransition className="container max-w-2xl py-8 pb-24">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 gap-1.5 -ml-2"
        onClick={() => router.push(`/app/teams/${teamId}`)}
      >
        <ChevronLeft className="h-4 w-4" />
        Zuruck zum Team
      </Button>

      {/* Event Header */}
      <SlideUp>
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <PartyPopper className="h-6 w-6 text-primary" />
            {editingName ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-2xl font-bold h-auto py-1"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUpdateName();
                    if (e.key === "Escape") {
                      setEditingName(false);
                      setEditName(event.name);
                    }
                  }}
                />
                <Button size="sm" onClick={handleUpdateName}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingName(false);
                    setEditName(event.name);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <h1
                className="text-2xl font-bold cursor-pointer hover:text-primary transition-colors"
                onClick={() => setEditingName(true)}
                title="Klicken zum Bearbeiten"
              >
                {event.name}
              </h1>
            )}
          </div>
          {event.eventDate && (
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 ml-8">
              <CalendarDays className="h-4 w-4" />
              {new Date(event.eventDate).toLocaleDateString("de-CH", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
          {event.description && (
            <p className="text-sm text-muted-foreground mt-1 ml-8">
              {event.description}
            </p>
          )}

          {/* Share button */}
          <div className="flex gap-2 mt-3 ml-8">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareEvent}
              className="gap-1.5"
            >
              <Share2 className="h-4 w-4" />
              Teilen
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const url = window.location.href;
                await navigator.clipboard.writeText(url);
                toast.success("Link kopiert!");
              }}
              className="gap-1.5"
            >
              <Copy className="h-4 w-4" />
              Link kopieren
            </Button>
          </div>
        </div>
      </SlideUp>

      {/* Filter by Person */}
      <SlideUp delay={0.05}>
        <div className="mb-6">
          <p className="text-sm font-medium mb-2 text-muted-foreground">
            Filtern nach Person
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterMemberId(null)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterMemberId === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Alle ({event.items.length})
            </button>
            {event.members.map((member) => {
              const count = event.items.filter(
                (i) => i.assignedTo === member.id
              ).length;
              return (
                <button
                  key={member.id}
                  onClick={() =>
                    setFilterMemberId(
                      filterMemberId === member.id ? null : member.id
                    )
                  }
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    filterMemberId === member.id
                      ? "text-white ring-2 ring-offset-2"
                      : "text-white opacity-80 hover:opacity-100"
                  }`}
                  style={{
                    backgroundColor: member.color,
                    outlineColor:
                      filterMemberId === member.id ? member.color : undefined,
                  }}
                >
                  {member.displayName} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </SlideUp>

      {/* Add Item Form */}
      <SlideUp delay={0.1}>
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Artikel hinzufugen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddItem} className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="z.B. Bratwurst, Ketchup, Bier..."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  disabled={addingItem}
                  className="flex-1"
                />
                <Input
                  placeholder="Menge"
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(e.target.value)}
                  disabled={addingItem}
                  className="w-24"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  disabled={addingItem}
                  className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Kategorie wahlen...</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <select
                  value={newItemAssignedTo}
                  onChange={(e) => setNewItemAssignedTo(e.target.value)}
                  disabled={addingItem}
                  className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Zuweisen an...</option>
                  {event.members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.displayName}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                type="submit"
                disabled={addingItem || !newItemName.trim()}
                className="gap-1.5"
              >
                <Plus className="h-4 w-4" />
                {addingItem ? "Wird hinzugefugt..." : "Hinzufugen"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </SlideUp>

      {/* Items Grid */}
      <SlideUp delay={0.15}>
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-1">
                {filterMemberId
                  ? "Keine Artikel für diese Person"
                  : "Noch keine Artikel"}
              </h3>
              <p className="text-muted-foreground text-sm">
                {filterMemberId
                  ? "Weise dieser Person Artikel zu."
                  : "Füge oben den ersten Artikel hinzu."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <StaggerContainer className="grid gap-3 sm:grid-cols-2">
            {filteredItems.map((item) => (
              <StaggerItem key={item.id}>
                <Card
                  className={`transition-all ${
                    item.checked ? "opacity-60" : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <button
                        onClick={() => handleToggleChecked(item)}
                        className={`mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                          item.checked
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-muted-foreground/30 hover:border-primary"
                        }`}
                        aria-label={
                          item.checked ? "Als offen markieren" : "Abhaken"
                        }
                      >
                        {item.checked && <Check className="h-3 w-3" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        {/* Item name + quantity */}
                        <p
                          className={`font-medium ${
                            item.checked ? "line-through" : ""
                          }`}
                        >
                          {item.itemName}
                          {item.quantity && (
                            <span className="text-muted-foreground font-normal ml-1.5">
                              ({item.quantity})
                            </span>
                          )}
                        </p>

                        {/* Category */}
                        {item.category && (
                          <Badge
                            variant="outline"
                            className="text-xs mt-1 font-normal"
                          >
                            {item.category}
                          </Badge>
                        )}

                        {/* Assigned Member Badge */}
                        {item.assignedMember ? (
                          <div className="mt-2">
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                              style={{
                                backgroundColor: item.assignedMember.color,
                              }}
                            >
                              <span
                                className="h-2 w-2 rounded-full bg-white/40"
                              />
                              {item.assignedMember.displayName}
                            </span>
                          </div>
                        ) : (
                          <div className="mt-2">
                            <select
                              value=""
                              onChange={(e) =>
                                handleChangeAssignment(
                                  item.id,
                                  e.target.value || null
                                )
                              }
                              className="text-xs h-7 rounded border border-dashed border-muted-foreground/30 bg-transparent px-2 text-muted-foreground"
                            >
                              <option value="">Zuweisen...</option>
                              {event.members.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.displayName}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Delete */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive flex-shrink-0"
                        onClick={() => handleDeleteItem(item.id)}
                        aria-label="Artikel löschen"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </SlideUp>

      {/* Summary Section */}
      {event.items.length > 0 && (
        <SlideUp delay={0.2}>
          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Übersicht</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {memberStats.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: member.color }}
                      >
                        {member.displayName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{member.displayName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {member.done}/{member.total} erledigt
                      </span>
                      {member.total > 0 && (
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: member.color }}
                            initial={{ width: 0 }}
                            animate={{
                              width: `${
                                member.total > 0
                                  ? (member.done / member.total) * 100
                                  : 0
                              }%`,
                            }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Unassigned count */}
                {(() => {
                  const unassigned = event.items.filter(
                    (i) => !i.assignedTo
                  ).length;
                  if (unassigned > 0) {
                    return (
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold">
                            ?
                          </div>
                          <span className="font-medium text-muted-foreground">
                            Nicht zugewiesen
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {unassigned}{" "}
                          {unassigned === 1 ? "Artikel" : "Artikel"}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Total */}
                <div className="pt-3 border-t flex items-center justify-between">
                  <span className="font-semibold">Gesamt</span>
                  <span className="font-semibold">
                    {event.items.filter((i) => i.checked).length}/
                    {event.items.length} erledigt
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </SlideUp>
      )}
    </PageTransition>
  );
}
