import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE = "hs_session";
const secretKey = () => new TextEncoder().encode(process.env.SESSION_SECRET || "dev-inseguro");

export type StaffRole = "super_admin" | "tecnico";

export type Session =
  | { role: StaffRole; staffId: string; name: string; username: string }
  | { role: "client"; clientId: string; clientName: string; cnpj: string };

export function isStaff(s: Session | null): s is Extract<Session, { role: StaffRole }> {
  return !!s && (s.role === "super_admin" || s.role === "tecnico");
}

export async function createSession(payload: Session): Promise<void> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey());
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload as unknown as Session;
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}
