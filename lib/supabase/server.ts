import { createClient } from "@supabase/supabase-js";
import { getEnv } from "@/lib/security/env";

// Server-side Supabase client with service role key
// Use this for job processing and server-side operations
export function createServiceClient() {
  const env = getEnv();
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
