import { createServiceClient } from "@/lib/supabase/server";

export type AnalyticsEventName =
  | "analysis_started"
  | "analysis_completed"
  | "analysis_failed"
  | "result_copied"
  | "result_exported"
  | "result_saved";

export async function trackEvent(
  eventName: AnalyticsEventName,
  payload: Record<string, unknown> = {},
  userId?: string | null
): Promise<void> {
  try {
    const supabase = createServiceClient();
    await supabase.from("analytics_events").insert({
      user_id: userId ?? null,
      event_name: eventName,
      event_payload: payload,
    });
  } catch (error) {
    // Analytics should never crash the app
    console.error("Analytics tracking failed:", error);
  }
}
