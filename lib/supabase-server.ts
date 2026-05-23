import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Creates an instance of the Supabase client configured to run in the server context,
 * using the cookies containing the authenticated user's access token if present.
 */
export async function getSupabaseServer() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sb-access-token")?.value || "";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    },
    auth: {
      persistSession: false,
    },
  });
}
