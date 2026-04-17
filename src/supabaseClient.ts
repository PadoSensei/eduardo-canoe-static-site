import { createClient } from "@supabase/supabase-js";

const supabaseUrl: string =
  (import.meta.env.VITE_SUPABASE_URL as string) || "https://mock.supabase.co";
const supabaseAnonKey: string =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || "placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Disable persistence and auto-refresh in tests to prevent process leaks
    persistSession:
      typeof window !== "undefined" && import.meta.env.MODE !== "test",
    detectSessionInUrl: false,
    autoRefreshToken: import.meta.env.MODE !== "test",
  },
});
