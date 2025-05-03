import { createBrowserClient } from "@supabase/ssr";

// A singleton pattern is used to ensure that the Supabase client is only created once. 
// We need to use it in every route
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
