import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import { formatBRL, type Equipment, type MaintenanceRecord } from "@/lib/types";
import { HistoryTimeline } from "@/app/_components/history-timeline";
import { PrintButton } from "@/app/_components/print-button";

export const dynamic = "force-dynamic";

export default async function ClienteEquip({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (session?.role !== "client") redirect("/");
  const { id } = await params;
  const supa = supabaseAdmin();

  const { data: equip } = await supa
    .from("equipment")
    .select("id, client_id, serial_number, label, brand, model")
    .eq("id", id)
    .maybeSingle();

  // Isolamento: o equipamento precisa ser do cliente logado.
  if (!equip || (equip as Equipment).client_id !== session.clientId) notFound();
  const e = equip as Equipment;

  const { data: recData } = await supa
    .from("maintenance_records")
    .select("id, equipment_id, type, description, value_cents, performed_at, laudo_path, technician_name, created_at")
    .eq("equipment_id", id)
    .order("performed_at", { ascending: false })
    .order("created_at", { ascending: false });

  const records = (recData ?? []) as MaintenanceRecord[];
  const total = records.reduce((s, r) => s + (r.value_cents ?? 0), 0);

  return (
    <div>
      <Link href="/cliente" className="text-sm text-[color:var(--color-muted)] hover:text-white no-print">
        ← Meus equipamentos
      </Link>

      <div className="flex items-start justify-between gap-3 mt-3 mb-6">
        <div>
          <div className="hidden print:block text-sm text-[color:var(--color-muted)] mb-1">
            {session.clientName} · Hidro Suce
          </div>
          <h1 className="font-display text-3xl tracking-wide">{e.label || "Equipamento"}</h1>
          <p className="text-sm font-mono text-[color:var(--color-blue-strong)] mt-0.5">
            {e.serial_number}
          </p>
          <p className="text-xs text-[color:var(--color-muted)] mt-1">
            {[e.brand, e.model].filter(Boolean).join(" · ") || "—"}
          </p>
        </div>
        <PrintButton />
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="card px-4 py-3">
          <div className="text-xs text-[color:var(--color-faint)]">Manutenções</div>
          <div className="font-display text-2xl">{records.length}</div>
        </div>
        <div className="card px-4 py-3">
          <div className="text-xs text-[color:var(--color-faint)]">Total investido</div>
          <div className="font-display text-2xl">{formatBRL(total)}</div>
        </div>
      </div>

      <h2 className="text-sm font-medium text-[color:var(--color-steel)] mb-3">
        Histórico de manutenções
      </h2>
      <HistoryTimeline records={records} />
    </div>
  );
}
