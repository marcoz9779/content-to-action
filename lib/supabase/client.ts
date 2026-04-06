"use client";

import { createClient } from "@supabase/supabase-js";
import { getPublicEnv } from "@/lib/security/env";

let client: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (client) return client;

  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();
  client = createClient(supabaseUrl, supabaseAnonKey);
  return client;
}
