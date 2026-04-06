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

interface ItemRow {
  id: string;
  event_id: string;
  item_name: string;
  quantity: string | null;
  category: string | null;
  assigned_to: string | null;
  checked: boolean;
  created_at: string;
}

interface MemberRow {
  id: string;
  display_name: string;
  color: string;
  role: string;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const supabase = createServiceClient();

    const { data: event, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single<EventRow>();

    if (error || !event) {
      return NextResponse.json<ApiError>(
        { error: "Event not found." },
        { status: 404 }
      );
    }

    // Fetch items
    const { data: items } = await supabase
      .from("event_items")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });

    // Fetch team members for assignment display
    const { data: members } = await supabase
      .from("team_members")
      .select("id, display_name, color, role")
      .eq("team_id", event.team_id);

    const membersMap = new Map<string, MemberRow>();
    for (const m of (members ?? []) as MemberRow[]) {
      membersMap.set(m.id, m);
    }

    return NextResponse.json({
      id: event.id,
      teamId: event.team_id,
      name: event.name,
      description: event.description,
      eventDate: event.event_date,
      createdAt: event.created_at,
      items: ((items ?? []) as ItemRow[]).map((item) => {
        const assignedMember = item.assigned_to
          ? membersMap.get(item.assigned_to)
          : null;
        return {
          id: item.id,
          itemName: item.item_name,
          quantity: item.quantity,
          category: item.category,
          assignedTo: item.assigned_to,
          assignedMember: assignedMember
            ? {
                id: assignedMember.id,
                displayName: assignedMember.display_name,
                color: assignedMember.color,
              }
            : null,
          checked: item.checked,
          createdAt: item.created_at,
        };
      }),
      members: ((members ?? []) as MemberRow[]).map((m) => ({
        id: m.id,
        displayName: m.display_name,
        color: m.color,
        role: m.role,
      })),
    });
  } catch (error) {
    console.error("Event fetch error:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to fetch event." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const body = (await request.json()) as unknown;

    if (!body || typeof body !== "object") {
      return NextResponse.json<ApiError>(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const { name, description, eventDate } = body as {
      name?: string;
      description?: string;
      eventDate?: string | null;
    };

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description?.trim() ?? null;
    if (eventDate !== undefined) updates.event_date = eventDate;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json<ApiError>(
        { error: "No fields to update." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { data: event, error } = await supabase
      .from("events")
      .update(updates)
      .eq("id", eventId)
      .select("*")
      .single<EventRow>();

    if (error || !event) {
      return NextResponse.json<ApiError>(
        { error: "Failed to update event." },
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
    console.error("Event update error:", error);
    return NextResponse.json<ApiError>(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const supabase = createServiceClient();

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId);

    if (error) {
      console.error("Event delete error:", error);
      return NextResponse.json<ApiError>(
        { error: "Failed to delete event." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Event delete error:", error);
    return NextResponse.json<ApiError>(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
