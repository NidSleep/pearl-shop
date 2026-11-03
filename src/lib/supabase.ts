import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { requireEnv } from "./env";

let publicClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

/** Fresh anon client for each auth operation: never share signed-in state. */
export function createAuthClient(): SupabaseClient {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
  );
}

/**
 * Anon client: respects Row Level Security.
 * Use for reading public data such as products.
 */
export function getPublicClient(): SupabaseClient {
  publicClient ??= createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    { auth: { persistSession: false } },
  );
  return publicClient;
}

/**
 * Admin client: BYPASSES Row Level Security.
 * Only use in server code for payments or after explicit admin authorization.
 */
export function getAdminClient(): SupabaseClient {
  adminClient ??= createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } },
  );
  return adminClient;
}
