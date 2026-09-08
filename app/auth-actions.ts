"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession } from "@/lib/session";
import { verifyPassword } from "@/lib/password";
import { supabaseAdmin } from "@/lib/supabase";
import { onlyDigits } from "@/lib/types";

export type LoginState = { error?: string } | null;

// Login unificado: identifica se é equipe (usuário) ou cliente (CNPJ) e
// direciona pro painel certo.
export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const identifier = String(formData.get("identifier") || "").trim();
  const password = String(formData.get("password") || "");
  if (!identifier || !password) return { error: "Informe usuário/CNPJ e senha." };

  const supa = supabaseAdmin();

  // 1) Equipe (super admin / técnico) por usuário
  const { data: staff } = await supa
    .from("staff")
    .select("id, username, name, password_hash, role, is_active")
    .eq("username", identifier.toLowerCase())
    .maybeSingle();

  if (staff && staff.is_active && (await verifyPassword(password, staff.password_hash))) {
    await createSession({
      role: staff.role as "super_admin" | "tecnico",
      staffId: staff.id,
      name: staff.name,
      username: staff.username,
    });
    redirect("/admin");
  }

  // 2) Cliente por CNPJ
  const cnpj = onlyDigits(identifier);
  if (cnpj.length === 14) {
    const { data: client } = await supa
      .from("clients")
      .select("id, name, cnpj, password_hash, is_active")
      .eq("cnpj", cnpj)
      .maybeSingle();
    if (client && client.is_active && (await verifyPassword(password, client.password_hash))) {
      await createSession({
        role: "client",
        clientId: client.id,
        clientName: client.name,
        cnpj: client.cnpj,
      });
      redirect("/cliente");
    }
  }

  return { error: "Usuário/CNPJ ou senha incorretos." };
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/");
}

// Fluxo do QR: o equipamento já identifica o cliente, então pede só a senha.
export async function unlockByQr(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const equipmentId = String(formData.get("equipment_id") || "").trim();
  const password = String(formData.get("password") || "");
  if (!equipmentId || !password) return { error: "Informe a senha." };

  const supa = supabaseAdmin();
  const { data } = await supa
    .from("equipment")
    .select("id, client_id, clients(id, name, cnpj, password_hash, is_active)")
    .eq("id", equipmentId)
    .maybeSingle();

  const client = (data as unknown as {
    clients?: { id: string; name: string; cnpj: string; password_hash: string; is_active: boolean };
  } | null)?.clients;

  if (!data || !client || !client.is_active) return { error: "Acesso indisponível." };
  if (!(await verifyPassword(password, client.password_hash))) {
    return { error: "Senha incorreta." };
  }

  await createSession({
    role: "client",
    clientId: client.id,
    clientName: client.name,
    cnpj: client.cnpj,
  });
  redirect(`/cliente/equipamento/${equipmentId}`);
}
