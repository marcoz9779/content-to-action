import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { ApiError } from "@/types";

interface EventRow {
  id: string;
  team_id: string;
  name: string;
  description: string | null;
  event_date: string | null;
  created_at: string;
  updated_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");

    if (!teamId) {
      return NextResponse.json<ApiError>(
        { error: "Missing query param: teamId." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { data: events, error } = await supabase
      .from("events")
      .select("*")
      .eq("team_id", teamId)
      .order("event_date", { ascending: true, nullsFirst: false });

    if (error) {
      console.error("Events fetch error:", error);
      return NextResponse.json<ApiError>(
        { error: "Failed to fetch events." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      events: ((events ?? []) as EventRow[]).map((e) => ({
        id: e.id,
        teamId: e.team_id,
        name: e.name,
        description: e.description,
        eventDate: e.event_date,
        createdAt: e.created_at,
      })),
    });
  } catch (error) {
    console.error("Events list error:", error);
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
      !("teamId" in body) ||
      !("name" in body)
    ) {
      return NextResponse.json<ApiError>(
        { error: "Missing required fields: teamId, name." },
        { status: 400 }
      );
    }

    const { teamId, name, description, eventDate } = body as {
      teamId: string;
      name: string;
      description?: string;
      eventDate?: string;
    };

    if (!name.trim()) {
      return NextResponse.json<ApiError>(
        { error: "Event name is required." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Verify team exists
    const { data: team } = await supabase
      .from("teams")
      .select("id")
      .eq("id", teamId)
      .single<{ id: string }>();

    if (!team) {
      return NextResponse.json<ApiError>(
        { error: "Team not found." },
        { status: 404 }
      );
    }

    const { data: event, error } = await supabase
      .from("events")
      .insert({
        team_id: teamId,
        name: name.trim(),
        description: description?.trim() ?? null,
        event_date: eventDate ?? null,
      })
      .select("*")
      .single<EventRow>();

    if (error || !event) {
      console.error("Event creation error:", error);
      return NextResponse.json<ApiError>(
        { error: "Failed to create event." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: event.id,
      teamId: event.team_id,
      name: event.name,
      description: event.description,
      eventDate: event.event_date,
      createdAt: event.created_at,
    });
  } catch (error) {
    console.error("Event create error:", error);
    return NextResponse.json<ApiError>(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
