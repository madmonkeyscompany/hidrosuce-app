import { createClient } from "@supabase/supabase-js";

// Cliente admin do Supabase — usa a SECRET KEY e ignora a RLS.
// USAR SOMENTE NO SERVIDOR (server components, route handlers, server actions).
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) throw new Error("Supabase env ausente (URL/SECRET).");
  return createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
