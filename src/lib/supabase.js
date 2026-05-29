import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    [
      "Supabase env vars missing.",
      "Required:",
      "- VITE_SUPABASE_URL",
      "- VITE_SUPABASE_ANON_KEY",
      "",
      "Fix:",
      "1) Create a .env.local file (recommended) or .env",
      "2) Add the variables",
      "3) Restart the dev server",
    ].join("\n"),
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);