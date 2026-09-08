import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import type { Client } from "@/lib/types";
import { NewClientForm } from "../new-client-form";
import { ClientsBrowser } from "./clients-browser";

export const dynamic = "force-dynamic";

type ClientRow = Client & { equipment: { count: number }[] };

export default async function ClientesList() {
  const session = await getSession();
  const isSuper = session?.role === "super_admin";
  const supa = supabaseAdmin();
  const { data } = await supa
    .from("clients")
    .select("id, name, cnpj, is_active, created_at, equipment(count)")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as unknown as ClientRow[];
  const clients = rows.map((c) => ({
    id: c.id,
    name: c.name,
    cnpj: c.cnpj,
    created_at: c.created_at,
    active: c.is_active,
    equipCount: c.equipment?.[0]?.count ?? 0,
  }));

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-3xl tracking-wide">CLIENTES</h1>
          <p className="text-sm text-[color:var(--color-muted)]">
            {clients.length} {clients.length === 1 ? "empresa cadastrada" : "empresas cadastradas"}
          </p>
        </div>
        {isSuper ? <NewClientForm /> : null}
      </div>

      <ClientsBrowser clients={clients} />
    </div>
  );
}
