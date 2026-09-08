import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import { NewTecnicoForm } from "./new-tecnico-form";
import { TecnicoRow } from "./tecnico-row";

export const dynamic = "force-dynamic";

type StaffRow = {
  id: string;
  username: string;
  name: string;
  role: "super_admin" | "tecnico";
  is_active: boolean;
  created_at: string;
};

export default async function TecnicosPage() {
  const session = await getSession();
  if (session?.role !== "super_admin") redirect("/admin");

  const supa = supabaseAdmin();
  const { data } = await supa
    .from("staff")
    .select("id, username, name, role, is_active, created_at")
    .order("created_at", { ascending: true });

  const staff = (data ?? []) as StaffRow[];

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-3xl tracking-wide">EQUIPE</h1>
          <p className="text-sm text-[color:var(--color-muted)]">
            Super admin e técnicos com acesso ao painel.
          </p>
        </div>
        <NewTecnicoForm />
      </div>

      <div className="grid gap-3">
        {staff.map((s) => (
          <TecnicoRow key={s.id} staff={s} />
        ))}
      </div>
    </div>
  );
}
