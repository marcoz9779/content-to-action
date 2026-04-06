import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { ApiError } from "@/types";

interface TeamRow {
  id: string;
  name: string;
  invite_code: string;
  owner_member_id: string | null;
  created_at: string;
  updated_at: string;
}

interface MemberRow {
  id: string;
  team_id: string;
  display_name: string;
  color: string;
  role: string;
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const supabase = createServiceClient();

    // If userId is provided, filter teams where this user is a member
    // For MVP without auth, list all teams or filter by a stored member reference
    // We list all teams since this is an anonymous-friendly MVP
    let query = supabase
      .from("teams")
      .select("*")
      .order("created_at", { ascending: false });

    if (userId) {
      // Get team IDs where this userId exists as a member
      const { data: memberships } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("id", userId);

      if (memberships && memberships.length > 0) {
        const teamIds = memberships.map((m: { team_id: string }) => m.team_id);
        query = query.in("id", teamIds);
      } else {
        return NextResponse.json({ teams: [] });
      }
    }

    const { data: teams, error } = await query;

    if (error) {
      console.error("Teams fetch error:", error);
      return NextResponse.json<ApiError>(
        { error: "Failed to fetch teams." },
        { status: 500 }
      );
    }

    // Fetch members for each team
    const teamIds = (teams as TeamRow[]).map((t) => t.id);
    const { data: allMembers } = await supabase
      .from("team_members")
      .select("*")
      .in("team_id", teamIds.length > 0 ? teamIds : ["__none__"]);

    const membersByTeam = new Map<string, MemberRow[]>();
    for (const member of (allMembers ?? []) as MemberRow[]) {
      const existing = membersByTeam.get(member.team_id) ?? [];
      existing.push(member);
      membersByTeam.set(member.team_id, existing);
    }

    const teamsWithMembers = (teams as TeamRow[]).map((team) => ({
      id: team.id,
      name: team.name,
      inviteCode: team.invite_code,
      ownerMemberId: team.owner_member_id,
      createdAt: team.created_at,
      members: (membersByTeam.get(team.id) ?? []).map((m) => ({
        id: m.id,
        displayName: m.display_name,
        color: m.color,
        role: m.role,
        createdAt: m.created_at,
      })),
    }));

    return NextResponse.json({ teams: teamsWithMembers });
  } catch (error) {
    console.error("Teams list error:", error);
    return NextResponse.json<ApiError>(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;

    if (
      !body ||
      typeof body !== "object" ||
      !("name" in body) ||
      !("ownerName" in body) ||
      !("ownerColor" in body)
    ) {
      return NextResponse.json<ApiError>(
        { error: "Missing required fields: name, ownerName, ownerColor." },
        { status: 400 }
      );
    }

    const { name, ownerName, ownerColor } = body as {
      name: string;
      ownerName: string;
      ownerColor: string;
    };

    if (!name.trim() || !ownerName.trim()) {
      return NextResponse.json<ApiError>(
        { error: "Name and owner name are required." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Create the team
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .insert({ name: name.trim() })
      .select("*")
      .single<TeamRow>();

    if (teamError || !team) {
      console.error("Team creation error:", teamError);
      return NextResponse.json<ApiError>(
        { error: "Failed to create team." },
        { status: 500 }
      );
    }

    // Create the owner member
    const { data: member, error: memberError } = await supabase
      .from("team_members")
      .insert({
        team_id: team.id,
        display_name: ownerName.trim(),
        color: ownerColor,
        role: "owner",
      })
      .select("*")
      .single<MemberRow>();

    if (memberError || !member) {
      console.error("Member creation error:", memberError);
      // Clean up team
      await supabase.from("teams").delete().eq("id", team.id);
      return NextResponse.json<ApiError>(
        { error: "Failed to create team member." },
        { status: 500 }
      );
    }

    // Update team with owner_member_id
    await supabase
      .from("teams")
      .update({ owner_member_id: member.id })
      .eq("id", team.id);

    return NextResponse.json({
      id: team.id,
      name: team.name,
      inviteCode: team.invite_code,
      ownerMemberId: member.id,
      createdAt: team.created_at,
      members: [
        {
          id: member.id,
          displayName: member.display_name,
          color: member.color,
          role: member.role,
          createdAt: member.created_at,
        },
      ],
    });
  } catch (error) {
    console.error("Team create error:", error);
    return NextResponse.json<ApiError>(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
