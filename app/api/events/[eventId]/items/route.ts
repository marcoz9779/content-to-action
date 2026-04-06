import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { ApiError } from "@/types";

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
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const supabase = createServiceClient();

    // Fetch event to get team_id
    const { data: event } = await supabase
      .from("events")
      .select("team_id")
      .eq("id", eventId)
      .single<{ team_id: string }>();

    if (!event) {
      return NextResponse.json<ApiError>(
        { error: "Event not found." },
        { status: 404 }
      );
    }

    const { data: items, error } = await supabase
      .from("event_items")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Items fetch error:", error);
      return NextResponse.json<ApiError>(
        { error: "Failed to fetch items." },
        { status: 500 }
      );
    }

    // Fetch team members for assignment info
    const { data: members } = await supabase
      .from("team_members")
      .select("id, display_name, color")
      .eq("team_id", event.team_id);

    const membersMap = new Map<string, MemberRow>();
    for (const m of (members ?? []) as MemberRow[]) {
      membersMap.set(m.id, m);
    }

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("Items list error:", error);
    return NextResponse.json<ApiError>(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const body = (await request.json()) as unknown;

    if (
      !body ||
      typeof body !== "object" ||
      !("itemName" in body)
    ) {
      return NextResponse.json<ApiError>(
        { error: "Missing required field: itemName." },
        { status: 400 }
      );
    }

    const { itemName, quantity, category, assignedTo } = body as {
      itemName: string;
      quantity?: string;
      category?: string;
      assignedTo?: string;
    };

    if (!itemName.trim()) {
      return NextResponse.json<ApiError>(
        { error: "Item name is required." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Verify event exists
    const { data: event } = await supabase
      .from("events")
      .select("id, team_id")
      .eq("id", eventId)
      .single<{ id: string; team_id: string }>();

    if (!event) {
      return NextResponse.json<ApiError>(
        { error: "Event not found." },
        { status: 404 }
      );
    }

    const { data: item, error } = await supabase
      .from("event_items")
      .insert({
        event_id: eventId,
        item_name: itemName.trim(),
        quantity: quantity?.trim() ?? null,
        category: category ?? null,
        assigned_to: assignedTo ?? null,
      })
      .select("*")
      .single<ItemRow>();

    if (error || !item) {
      console.error("Item creation error:", error);
      return NextResponse.json<ApiError>(
        { error: "Failed to add item." },
        { status: 500 }
      );
    }

    // Fetch assigned member info if assigned
    let assignedMember = null;
    if (item.assigned_to) {
      const { data: member } = await supabase
        .from("team_members")
        .select("id, display_name, color")
        .eq("id", item.assigned_to)
        .single<MemberRow>();
      if (member) {
        assignedMember = {
          id: member.id,
          displayName: member.display_name,
          color: member.color,
        };
      }
    }

    return NextResponse.json({
      id: item.id,
      itemName: item.item_name,
      quantity: item.quantity,
      category: item.category,
      assignedTo: item.assigned_to,
      assignedMember,
      checked: item.checked,
      createdAt: item.created_at,
    });
  } catch (error) {
    console.error("Item add error:", error);
    return NextResponse.json<ApiError>(
      { error: "An unexpected error occurred." },
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

    if (!body || typeof body !== "object" || !("itemId" in body)) {
      return NextResponse.json<ApiError>(
        { error: "Missing required field: itemId." },
        { status: 400 }
      );
    }

    const { itemId, checked, assignedTo, quantity, itemName, category } = body as {
      itemId: string;
      checked?: boolean;
      assignedTo?: string | null;
      quantity?: string | null;
      itemName?: string;
      category?: string | null;
    };

    const updates: Record<string, unknown> = {};
    if (checked !== undefined) updates.checked = checked;
    if (assignedTo !== undefined) updates.assigned_to = assignedTo;
    if (quantity !== undefined) updates.quantity = quantity;
    if (itemName !== undefined) updates.item_name = itemName.trim();
    if (category !== undefined) updates.category = category;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json<ApiError>(
        { error: "No fields to update." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { data: item, error } = await supabase
      .from("event_items")
      .update(updates)
      .eq("id", itemId)
      .eq("event_id", eventId)
      .select("*")
      .single<ItemRow>();

    if (error || !item) {
      return NextResponse.json<ApiError>(
        { error: "Failed to update item." },
        { status: 500 }
      );
    }

    // Fetch assigned member info
    let assignedMember = null;
    if (item.assigned_to) {
      const { data: member } = await supabase
        .from("team_members")
        .select("id, display_name, color")
        .eq("id", item.assigned_to)
        .single<MemberRow>();
      if (member) {
        assignedMember = {
          id: member.id,
          displayName: member.display_name,
          color: member.color,
        };
      }
    }

    return NextResponse.json({
      id: item.id,
      itemName: item.item_name,
      quantity: item.quantity,
      category: item.category,
      assignedTo: item.assigned_to,
      assignedMember,
      checked: item.checked,
      createdAt: item.created_at,
    });
  } catch (error) {
    console.error("Item update error:", error);
    return NextResponse.json<ApiError>(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json<ApiError>(
        { error: "Missing query param: itemId." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { error } = await supabase
      .from("event_items")
      .delete()
      .eq("id", itemId)
      .eq("event_id", eventId);

    if (error) {
      console.error("Item delete error:", error);
      return NextResponse.json<ApiError>(
        { error: "Failed to delete item." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Item delete error:", error);
    return NextResponse.json<ApiError>(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
