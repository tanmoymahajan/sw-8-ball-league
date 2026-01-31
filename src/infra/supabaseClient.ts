import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !anon) {
    // This makes failures obvious during dev
    // eslint-disable-next-line no-console
    console.warn("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
}

console.log("Connecting to Supabase", import.meta.env.VITE_SUPABASE_URL);
export const supabase = createClient(url, anon);
