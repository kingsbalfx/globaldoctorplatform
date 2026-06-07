import { c as createClient } from "./supabase-CHf_0O8y.js";
const supabaseUrl = "https://vordkasqninjhhsljluf.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvcmRrYXNxbmluamhoc2xqbHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NDA4NDgsImV4cCI6MjA5MzIxNjg0OH0.DuKCIp34Q36ZwSN1PWgwSiiXTzm9azjMdnqkZhNW_-k";
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    flowType: "pkce",
    detectSessionInUrl: false,
    persistSession: true,
    autoRefreshToken: true
  }
});
const isSupabaseConfigured = Boolean(supabaseKey);
async function recoverInvalidSupabaseSession() {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.auth.getSession();
  if (error && /refresh token|invalid/i.test(error.message || "")) {
    await supabase.auth.signOut({ scope: "local" }).catch(() => null);
  }
}
void recoverInvalidSupabaseSession().catch(() => null);
export {
  supabase as s
};
