import { redirect } from "next/navigation";
import { getSession, isStaff } from "@/lib/session";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getSession();
  if (isStaff(session)) redirect("/admin");
  if (session?.role === "client") redirect("/cliente");
  return <LoginForm />;
}
