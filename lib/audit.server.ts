import "server-only";
import { supabaseAdmin } from "./supabase";
import { getSession, isStaff } from "./session";

// Registra uma ação da equipe no log de auditoria. Best-effort: nunca quebra
// a ação principal se o log falhar.
export async function logAudit(action: string, entity: string, detail?: string): Promise<void> {
  try {
    const session = await getSession();
    if (!isStaff(session)) return;
    await supabaseAdmin()
      .from("audit_log")
      .insert({
        actor_type: session.role,
        actor_name: session.name,
        action,
        entity,
        detail: detail ?? null,
      });
  } catch {
    /* ignore */
  }
}
