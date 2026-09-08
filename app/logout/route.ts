import { NextResponse } from "next/server";
import { destroySession } from "@/lib/session";

// Rota de logout: apaga o cookie de sessão e volta pro login.
// Usada quando a conta (equipe ou cliente) foi removida/desativada.
export async function GET(req: Request) {
  await destroySession();
  return NextResponse.redirect(new URL("/", req.url));
}
