import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Disable persistence and auto-refresh in tests to prevent process leaks
    persistSession:
      typeof window !== "undefined" && process.env.NODE_ENV !== "test",
    detectSessionInUrl: false,
    autoRefreshToken: process.env.NODE_ENV !== "test",
  },
});
