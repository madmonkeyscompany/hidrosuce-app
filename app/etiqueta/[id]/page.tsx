import { redirect, notFound } from "next/navigation";
import { getSession, isStaff } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import type { Client, Equipment } from "@/lib/types";
import { LabelView } from "./label-view";

export const dynamic = "force-dynamic";

export default async function LabelPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!isStaff(session)) redirect("/");

  const { id } = await params;
  const supa = supabaseAdmin();
  const { data } = await supa
    .from("equipment")
    .select("id, serial_number, label, clients(name)")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const e = data as unknown as Pick<Equipment, "id" | "serial_number" | "label"> & {
    clients: Pick<Client, "name">;
  };

  return (
    <LabelView
      equipmentId={e.id}
      serial={e.serial_number}
      label={e.label}
      clientName={e.clients?.name ?? ""}
    />
  );
}
