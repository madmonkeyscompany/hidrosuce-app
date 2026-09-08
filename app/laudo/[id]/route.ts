import { NextResponse } from "next/server";
import { getSession, isStaff } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

// Serve o laudo em PDF via URL assinada temporária, checando permissão:
// equipe vê tudo; cliente só os laudos dos próprios equipamentos.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.redirect(new URL("/", req.url));

  const supa = supabaseAdmin();
  const { data } = await supa
    .from("maintenance_records")
    .select("laudo_path, equipment(client_id)")
    .eq("id", id)
    .maybeSingle();

  const rec = data as unknown as {
    laudo_path: string | null;
    equipment: { client_id: string } | null;
  } | null;

  if (!rec || !rec.laudo_path) {
    return new NextResponse("Laudo não encontrado.", { status: 404 });
  }

  if (!isStaff(session)) {
    if (session.role !== "client" || session.clientId !== rec.equipment?.client_id) {
      return new NextResponse("Sem permissão.", { status: 403 });
    }
  }

  const { data: signed, error } = await supa.storage
    .from("laudos")
    .createSignedUrl(rec.laudo_path, 60);

  if (error || !signed) {
    return new NextResponse("Não foi possível abrir o laudo.", { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
