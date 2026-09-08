import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type LogRow = {
  id: string;
  actor_name: string;
  actor_type: string;
  action: string;
  entity: string;
  detail: string | null;
  created_at: string;
};

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

export default async function LogPage() {
  const session = await getSession();
  if (session?.role !== "super_admin") redirect("/admin/clientes");

  const supa = supabaseAdmin();
  const { data } = await supa
    .from("audit_log")
    .select("id, actor_name, actor_type, action, entity, detail, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  const rows = (data ?? []) as LogRow[];

  return (
    <div>
      <Link href="/admin" className="text-sm text-[color:var(--color-muted)] hover:text-white">
        ← Início
      </Link>
      <h1 className="font-display text-3xl tracking-wide mt-3">REGISTRO DE ALTERAÇÕES</h1>
      <p className="text-sm text-[color:var(--color-muted)] mb-6">
        Últimas ações da equipe (mais recentes primeiro).
      </p>

      {rows.length === 0 ? (
        <div className="card p-10 text-center text-[color:var(--color-muted)]">
          Nenhuma alteração registrada ainda.
        </div>
      ) : (
        <div className="grid gap-2">
          {rows.map((r) => (
            <div key={r.id} className="card p-3 flex items-center justify-between gap-3">
              <div className="text-sm min-w-0">
                <b>{r.actor_name}</b> {r.action}{" "}
                <span className="text-[color:var(--color-steel)]">{r.entity}</span>
                {r.detail ? (
                  <span className="text-[color:var(--color-muted)]"> · {r.detail}</span>
                ) : null}
              </div>
              <div className="text-xs text-[color:var(--color-faint)] whitespace-nowrap shrink-0">
                {fmtDateTime(r.created_at)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
