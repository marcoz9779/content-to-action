"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  PageTransition,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/page-transition";
import { Users, Plus, Copy, Check, UserPlus, Palette } from "lucide-react";
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

export default function TeamsPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  // Create team form
  const [showCreate, setShowCreate] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerColor, setOwnerColor] = useState(PRESET_COLORS[0]);
  const [creating, setCreating] = useState(false);

  // Join team form
  const [showJoin, setShowJoin] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinName, setJoinName] = useState("");
  const [joinColor, setJoinColor] = useState(PRESET_COLORS[2]);
  const [joining, setJoining] = useState(false);

  // Copy state per team
  const [copiedTeamId, setCopiedTeamId] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    try {
      const response = await fetch("/api/teams");
      if (!response.ok) throw new Error("Failed to fetch teams");
      const data = (await response.json()) as { teams: Team[] };
      setTeams(data.teams);
    } catch {
      toast.error("Fehler beim Laden der Teams");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  async function handleCreateTeam(e: React.FormEvent) {
    e.preventDefault();
    if (!teamName.trim() || !ownerName.trim()) return;
    setCreating(true);
    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: teamName.trim(),
          ownerName: ownerName.trim(),
          ownerColor,
        }),
      });
      if (!response.ok) {
        const err = (await response.json()) as { error: string };
        throw new Error(err.error);
      }
      const newTeam = (await response.json()) as Team;
      setTeams((prev) => [newTeam, ...prev]);
      setTeamName("");
      setOwnerName("");
      setOwnerColor(PRESET_COLORS[0]);
      setShowCreate(false);
      toast.success("Team erstellt!");

      // Store the member ID locally so the user can track membership
      if (newTeam.members[0]) {
        localStorage.setItem(`team_member_${newTeam.id}`, newTeam.members[0].id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Fehler beim Erstellen";
      toast.error(message);
    } finally {
      setCreating(false);
    }
  }

  async function handleJoinTeam(e: React.FormEvent) {
    e.preventDefault();
    if (!joinCode.trim() || !joinName.trim()) return;
    setJoining(true);
    try {
      const response = await fetch("/api/teams/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteCode: joinCode.trim(),
          displayName: joinName.trim(),
          color: joinColor,
        }),
      });
      if (!response.ok) {
        const err = (await response.json()) as { error: string };
        throw new Error(err.error);
      }
      const data = (await response.json()) as { team: Team; memberId: string };
      // Store membership
      localStorage.setItem(`team_member_${data.team.id}`, data.memberId);
      setTeams((prev) => {
        const exists = prev.find((t) => t.id === data.team.id);
        if (exists) {
          return prev.map((t) => (t.id === data.team.id ? data.team : t));
        }
        return [data.team, ...prev];
      });
      setJoinCode("");
      setJoinName("");
      setJoinColor(PRESET_COLORS[2]);
      setShowJoin(false);
      toast.success(`Team "${data.team.name}" beigetreten!`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Fehler beim Beitreten";
      toast.error(message);
    } finally {
      setJoining(false);
    }
  }

  async function handleCopyInviteCode(teamId: string, code: string) {
    await navigator.clipboard.writeText(code);
    setCopiedTeamId(teamId);
    toast.success("Einladungscode kopiert!");
    setTimeout(() => setCopiedTeamId(null), 2000);
  }

  return (
    <PageTransition className="container max-w-2xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Teams
          </h1>
          <p className="mt-1 text-muted-foreground">
            Erstelle Teams, lade Freunde ein und verwalte gemeinsame Events.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <Button
          onClick={() => {
            setShowCreate(!showCreate);
            setShowJoin(false);
          }}
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Neues Team
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setShowJoin(!showJoin);
            setShowCreate(false);
          }}
          className="gap-1.5"
        >
          <UserPlus className="h-4 w-4" />
          Team beitreten
        </Button>
      </div>

      {/* Create Team Form */}
      {showCreate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Neues Team erstellen</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Team-Name
                  </label>
                  <Input
                    placeholder="z.B. Familie Muller"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    disabled={creating}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Dein Name
                  </label>
                  <Input
                    placeholder="z.B. Marco"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    disabled={creating}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5 block">
                    <Palette className="h-4 w-4" />
                    Deine Farbe
                  </label>
                  <div className="flex gap-2 mt-1.5">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setOwnerColor(color)}
                        className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110"
                        style={{
                          backgroundColor: color,
                          borderColor:
                            ownerColor === color ? "white" : "transparent",
                          boxShadow:
                            ownerColor === color
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
                    disabled={creating || !teamName.trim() || !ownerName.trim()}
                  >
                    {creating ? "Erstelle..." : "Team erstellen"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowCreate(false)}
                  >
                    Abbrechen
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Join Team Form */}
      {showJoin && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team beitreten</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinTeam} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Einladungscode
                  </label>
                  <Input
                    placeholder="Code eingeben..."
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    disabled={joining}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Dein Name
                  </label>
                  <Input
                    placeholder="z.B. Lisa"
                    value={joinName}
                    onChange={(e) => setJoinName(e.target.value)}
                    disabled={joining}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5 block">
                    <Palette className="h-4 w-4" />
                    Deine Farbe
                  </label>
                  <div className="flex gap-2 mt-1.5">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setJoinColor(color)}
                        className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110"
                        style={{
                          backgroundColor: color,
                          borderColor:
                            joinColor === color ? "white" : "transparent",
                          boxShadow:
                            joinColor === color
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
                    disabled={joining || !joinCode.trim() || !joinName.trim()}
                  >
                    {joining ? "Beitritt..." : "Beitreten"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowJoin(false)}
                  >
                    Abbrechen
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Teams List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-5 w-32 rounded bg-muted mb-3" />
                <div className="h-4 w-48 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : teams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">Noch keine Teams</h3>
            <p className="text-muted-foreground text-sm">
              Erstelle ein neues Team oder tritt einem bestehenden bei.
            </p>
          </CardContent>
        </Card>
      ) : (
        <StaggerContainer className="space-y-4">
          {teams.map((team) => (
            <StaggerItem key={team.id}>
              <Card
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => router.push(`/app/teams/${team.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold truncate">
                        {team.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>
                          {team.members.length}{" "}
                          {team.members.length === 1 ? "Mitglied" : "Mitglieder"}
                        </span>
                      </div>
                    </div>

                    {/* Member avatars */}
                    <div className="flex -space-x-2 ml-4">
                      {team.members.slice(0, 5).map((member) => (
                        <div
                          key={member.id}
                          className="h-8 w-8 rounded-full border-2 border-background flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: member.color }}
                          title={member.displayName}
                        >
                          {member.displayName.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {team.members.length > 5 && (
                        <div className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-bold">
                          +{team.members.length - 5}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Invite Code */}
                  <div className="mt-4 flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono text-xs">
                      Code: {team.inviteCode}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyInviteCode(team.id, team.inviteCode);
                      }}
                      aria-label="Einladungscode kopieren"
                    >
                      {copiedTeamId === team.id ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
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
