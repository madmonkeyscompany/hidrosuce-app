import { redirect, notFound } from "next/navigation";
import { getSession, isStaff } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import type { Client, Equipment } from "@/lib/types";
import { UnlockForm } from "./unlock-form";

export const dynamic = "force-dynamic";

export default async function QrAccess({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const supa = supabaseAdmin();

  const { data } = await supa
    .from("equipment")
    .select("id, client_id, serial_number, label, clients(name)")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const e = data as unknown as Pick<Equipment, "id" | "client_id" | "serial_number" | "label"> & {
    clients: Pick<Client, "name">;
  };

  // Já logado: equipe vê pelo painel; cliente dono vai direto ao histórico.
  if (isStaff(session)) redirect(`/admin/equipamentos/${e.id}`);
  if (session?.role === "client" && session.clientId === e.client_id) {
    redirect(`/cliente/equipamento/${e.id}`);
  }

  // Caso contrário: pede a senha (o equipamento já identifica o cliente).
  return (
    <UnlockForm
      equipmentId={e.id}
      clientName={e.clients?.name ?? ""}
      equipmentLabel={e.label}
      serial={e.serial_number}
    />
  );
}
