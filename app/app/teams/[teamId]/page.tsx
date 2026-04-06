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
  Users,
  Plus,
  Trash2,
  Copy,
  Share2,
  Check,
  X,
  CalendarDays,
  UserPlus,
  Palette,
  PartyPopper,
  ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const PRESET_COLORS = [
  "#6336f5",
  "#ef4444",
  "#22c55e",
  "#f59e0b",
  "#3b82f6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

interface TeamMember {
  id: string;
  displayName: string;
  color: string;
  role: string;
  createdAt: string;
}

interface Team {
  id: string;
  name: string;
  inviteCode: string;
  ownerMemberId: string | null;
  createdAt: string;
  members: TeamMember[];
}

interface TeamEvent {
  id: string;
  teamId: string;
  name: string;
  description: string | null;
  eventDate: string | null;
  createdAt: string;
}

export default function TeamDetailPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = use(params);
  const router = useRouter();

  const [team, setTeam] = useState<Team | null>(null);
  const [events, setEvents] = useState<TeamEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit name
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState("");

  // Add member
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberColor, setNewMemberColor] = useState(PRESET_COLORS[3]);
  const [addingMember, setAddingMember] = useState(false);

  // Create event
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [creatingEvent, setCreatingEvent] = useState(false);

  const [copied, setCopied] = useState(false);

  const fetchTeam = useCallback(async () => {
    try {
      const response = await fetch(`/api/teams/${teamId}`);
      if (!response.ok) throw new Error("Failed to fetch team");
      const data = (await response.json()) as Team;
      setTeam(data);
      setEditName(data.name);
    } catch {
      toast.error("Fehler beim Laden des Teams");
    }
  }, [teamId]);

  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch(`/api/events?teamId=${teamId}`);
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = (await response.json()) as { events: TeamEvent[] };
      setEvents(data.events);
    } catch {
      toast.error("Fehler beim Laden der Events");
    }
  }, [teamId]);

  useEffect(() => {
    Promise.all([fetchTeam(), fetchEvents()]).finally(() => setLoading(false));
  }, [fetchTeam, fetchEvents]);

  async function handleUpdateName() {
    if (!editName.trim() || editName.trim() === team?.name) {
      setEditingName(false);
      return;
    }
    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (!response.ok) throw new Error("Failed to update");
      setTeam((prev) => (prev ? { ...prev, name: editName.trim() } : prev));
      setEditingName(false);
      toast.success("Team-Name aktualisiert");
    } catch {
      toast.error("Fehler beim Aktualisieren");
    }
  }

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    setAddingMember(true);
    try {
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: newMemberName.trim(),
          color: newMemberColor,
        }),
      });
      if (!response.ok) throw new Error("Failed to add member");
      const member = (await response.json()) as TeamMember;
      setTeam((prev) =>
        prev ? { ...prev, members: [...prev.members, member] } : prev
      );
      setNewMemberName("");
      setNewMemberColor(PRESET_COLORS[3]);
      setShowAddMember(false);
      toast.success(`${member.displayName} hinzugefugt!`);
    } catch {
      toast.error("Fehler beim Hinzufugen");
    } finally {
      setAddingMember(false);
    }
  }

  async function handleRemoveMember(memberId: string, memberName: string) {
    if (!confirm(`"${memberName}" wirklich entfernen?`)) return;
    try {
      const response = await fetch(
        `/api/teams/${teamId}/members?memberId=${memberId}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        const err = (await response.json()) as { error: string };
        throw new Error(err.error);
      }
      setTeam((prev) =>
        prev
          ? { ...prev, members: prev.members.filter((m) => m.id !== memberId) }
          : prev
      );
      toast.success(`${memberName} entfernt`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Fehler beim Entfernen";
      toast.error(message);
    }
  }

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!eventName.trim()) return;
    setCreatingEvent(true);
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId,
          name: eventName.trim(),
          description: eventDescription.trim() || undefined,
          eventDate: eventDate || undefined,
        }),
      });
      if (!response.ok) throw new Error("Failed to create event");
      const newEvent = (await response.json()) as TeamEvent;
      setEvents((prev) => [...prev, newEvent]);
      setEventName("");
      setEventDescription("");
      setEventDate("");
      setShowCreateEvent(false);
      toast.success("Event erstellt!");
    } catch {
      toast.error("Fehler beim Erstellen des Events");
    } finally {
      setCreatingEvent(false);
    }
  }

  async function handleDeleteEvent(eventId: string, name: string) {
    if (!confirm(`"${name}" wirklich löschen?`)) return;
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      toast.success("Event geloscht");
    } catch {
      toast.error("Fehler beim Löschen");
    }
  }

  async function handleCopyInvite() {
    if (!team) return;
    await navigator.clipboard.writeText(team.inviteCode);
    setCopied(true);
    toast.success("Einladungscode kopiert!");
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    if (!team) return;
    const shareText = `Tritt meinem Team "${team.name}" bei! Einladungscode: ${team.inviteCode}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: team.name, text: shareText });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success("Einladungstext kopiert!");
    }
  }

  async function handleDeleteTeam() {
    if (!team) return;
    if (!confirm(`Team "${team.name}" wirklich löschen? Alle Events und Daten gehen verloren.`))
      return;
    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      toast.success("Team geloscht");
      router.push("/app/teams");
    } catch {
      toast.error("Fehler beim Löschen des Teams");
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
              <div className="h-20 rounded bg-muted" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="container max-w-2xl py-8">
        <PageTransition>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">Team nicht gefunden.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push("/app/teams")}
              >
                Zuruck zu Teams
              </Button>
            </CardContent>
          </Card>
        </PageTransition>
      </div>
    );
  }

  return (
    <PageTransition className="container max-w-2xl py-8">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 gap-1.5 -ml-2"
        onClick={() => router.push("/app/teams")}
      >
        <ChevronLeft className="h-4 w-4" />
        Alle Teams
      </Button>

      {/* Team Header */}
      <SlideUp>
        <div className="mb-6">
          {editingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-2xl font-bold h-auto py-1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUpdateName();
                  if (e.key === "Escape") {
                    setEditingName(false);
                    setEditName(team.name);
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
                  setEditName(team.name);
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
              {team.name}
            </h1>
          )}
          <p className="mt-1 text-sm text-muted-foreground">
            Erstellt am{" "}
            {new Date(team.createdAt).toLocaleDateString("de-CH", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </SlideUp>

      {/* Invite Section */}
      <SlideUp delay={0.05}>
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Einladungscode
                </p>
                <p className="text-lg font-mono font-bold">{team.inviteCode}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyInvite}
                  className="gap-1.5"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  Kopieren
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="gap-1.5"
                >
                  <Share2 className="h-4 w-4" />
                  Teilen
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </SlideUp>

      {/* Members Section */}
      <SlideUp delay={0.1}>
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Mitglieder ({team.members.length})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddMember(!showAddMember)}
                className="gap-1.5"
              >
                <UserPlus className="h-4 w-4" />
                Hinzufugen
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Add Member Form */}
            {showAddMember && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-4 p-4 rounded-lg border bg-muted/50"
              >
                <form onSubmit={handleAddMember} className="space-y-3">
                  <Input
                    placeholder="Name des Mitglieds"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    disabled={addingMember}
                  />
                  <div>
                    <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                      <Palette className="h-3.5 w-3.5" />
                      Farbe
                    </label>
                    <div className="flex gap-2 mt-1">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewMemberColor(color)}
                          className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110"
                          style={{
                            backgroundColor: color,
                            borderColor:
                              newMemberColor === color
                                ? "white"
                                : "transparent",
                            boxShadow:
                              newMemberColor === color
                                ? `0 0 0 2px ${color}`
                                : "none",
                          }}
                          aria-label={`Farbe ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={addingMember || !newMemberName.trim()}
                    >
                      {addingMember ? "Wird hinzugefugt..." : "Hinzufugen"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAddMember(false)}
                    >
                      Abbrechen
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Members List */}
            <div className="space-y-2">
              {team.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: member.color }}
                    >
                      {member.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{member.displayName}</p>
                      <div className="flex items-center gap-1.5">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: member.color }}
                        />
                        {member.role === "owner" && (
                          <Badge variant="secondary" className="text-xs">
                            Admin
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {member.role !== "owner" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        handleRemoveMember(member.id, member.displayName)
                      }
                      aria-label={`${member.displayName} entfernen`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </SlideUp>

      {/* Events Section */}
      <SlideUp delay={0.15}>
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <PartyPopper className="h-5 w-5" />
                Events ({events.length})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateEvent(!showCreateEvent)}
                className="gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Neues Event
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Create Event Form */}
            {showCreateEvent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-4 p-4 rounded-lg border bg-muted/50"
              >
                <form onSubmit={handleCreateEvent} className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Event-Name
                    </label>
                    <Input
                      placeholder="z.B. Grillparty"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      disabled={creatingEvent}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Beschreibung (optional)
                    </label>
                    <Input
                      placeholder="z.B. Samstagabend bei Marco"
                      value={eventDescription}
                      onChange={(e) => setEventDescription(e.target.value)}
                      disabled={creatingEvent}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Datum (optional)
                    </label>
                    <Input
                      type="datetime-local"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      disabled={creatingEvent}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={creatingEvent || !eventName.trim()}
                    >
                      {creatingEvent ? "Erstelle..." : "Event erstellen"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCreateEvent(false)}
                    >
                      Abbrechen
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Events List */}
            {events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarDays className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Noch keine Events erstellt.</p>
              </div>
            ) : (
              <StaggerContainer className="space-y-2">
                {events.map((event) => (
                  <StaggerItem key={event.id}>
                    <div
                      className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() =>
                        router.push(
                          `/app/teams/${teamId}/events/${event.id}`
                        )
                      }
                    >
                      <div className="flex items-center gap-3">
                        <PartyPopper className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{event.name}</p>
                          {event.eventDate && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              {new Date(event.eventDate).toLocaleDateString(
                                "de-CH",
                                {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          )}
                          {event.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEvent(event.id, event.name);
                          }}
                          aria-label={`${event.name} löschen`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </CardContent>
        </Card>
      </SlideUp>

      {/* Danger Zone */}
      <SlideUp delay={0.2}>
        <Card className="border-destructive/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-destructive">Team löschen</p>
                <p className="text-sm text-muted-foreground">
                  Alle Events und Mitglieder werden entfernt.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteTeam}
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Löschen
              </Button>
            </div>
          </CardContent>
        </Card>
      </SlideUp>
    </PageTransition>
  );
}
