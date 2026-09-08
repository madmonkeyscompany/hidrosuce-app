import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import { formatBRL, type Equipment, type MaintenanceRecord, type Client } from "@/lib/types";
import { NewRecordForm } from "./new-record-form";
import { RecordRow } from "./record-row";

export const dynamic = "force-dynamic";

export default async function EquipmentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supa = supabaseAdmin();

  const { data: equip } = await supa
    .from("equipment")
    .select("id, client_id, serial_number, label, brand, model, created_at, clients(id, name, cnpj)")
    .eq("id", id)
    .maybeSingle();

  if (!equip) notFound();
  const e = equip as unknown as Equipment & { clients: Pick<Client, "id" | "name" | "cnpj"> };

  const { data: recData } = await supa
    .from("maintenance_records")
    .select("id, equipment_id, type, description, value_cents, performed_at, laudo_path, technician_name, created_at")
    .eq("equipment_id", id)
    .order("performed_at", { ascending: false })
    .order("created_at", { ascending: false });

  const records = (recData ?? []) as MaintenanceRecord[];
  const total = records.reduce((s, r) => s + (r.value_cents ?? 0), 0);

  const session = await getSession();
  const isSuper = session?.role === "super_admin";
  const currentName = session && "name" in session ? session.name : "";

  const { data: staffData } = await supa
    .from("staff")
    .select("name, role")
    .eq("is_active", true)
    .order("role", { ascending: true })
    .order("name", { ascending: true });
  const staffNames = (staffData ?? []).map((s) => (s as { name: string }).name);

  return (
    <div>
      <Link
        href={`/admin/clientes/${e.client_id}`}
        className="text-sm text-[color:var(--color-muted)] hover:text-white"
      >
        ← {e.clients?.name ?? "Cliente"}
      </Link>

      <div className="mt-3 mb-4">
        <h1 className="font-display text-2xl tracking-wide">{e.label || "Equipamento"}</h1>
        <p className="text-sm font-mono text-[color:var(--color-blue-strong)] mt-0.5">
          {e.serial_number}
        </p>
        <p className="text-xs text-[color:var(--color-muted)] mt-1">
          {[e.brand, e.model].filter(Boolean).join(" · ") || "sem marca/modelo"}
        </p>
      </div>
      <div className="flex items-center gap-2 mb-6">
        <NewRecordForm
          equipmentId={e.id}
          currentName={currentName}
          staffNames={staffNames}
          isSuper={isSuper}
        />
        <Link href={`/etiqueta/${e.id}`} className="btn btn-outline btn-sm">
          Etiqueta / QR
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="card px-4 py-3">
          <div className="text-xs text-[color:var(--color-faint)]">Registros</div>
          <div className="font-display text-2xl">{records.length}</div>
        </div>
        {isSuper ? (
          <div className="card px-4 py-3">
            <div className="text-xs text-[color:var(--color-faint)]">Total em manutenção</div>
            <div className="font-display text-2xl">{formatBRL(total)}</div>
          </div>
        ) : null}
      </div>

      <h2 className="text-sm font-medium text-[color:var(--color-steel)] mb-3">
        Histórico de manutenções
      </h2>

      {records.length === 0 ? (
        <div className="card p-10 text-center text-[color:var(--color-muted)]">
          Nenhuma manutenção registrada ainda para este equipamento.
        </div>
      ) : (
        <ol className="relative border-l border-[color:var(--color-line)] ml-1 grid gap-4">
          {records.map((r) => (
            <RecordRow
              key={r.id}
              record={r}
              equipmentId={e.id}
              currentName={currentName}
              staffNames={staffNames}
              isSuper={isSuper}
            />
          ))}
        </ol>
      )}
    </div>
  );
}
