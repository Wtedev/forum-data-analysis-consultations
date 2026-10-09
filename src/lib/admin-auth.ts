import "server-only";

import type { AdminRole } from "@prisma/client";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

import { ADMIN_COOKIE, SESSION_MAX_AGE } from "@/lib/admin-cookie";

export { ADMIN_COOKIE } from "@/lib/admin-cookie";

export const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password";

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  role: AdminRole;
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return secret;
}

export function getAdminCredentialsFromEnv(): {
  email: string;
  password: string;
  name: string;
} | null {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Admin";

  if (!email || !password) {
    return null;
  }

  return { email, password, name };
}

function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let index = 0; index < a.length; index += 1) {
    result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }

  return result === 0;
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  const configured = getAdminCredentialsFromEnv();
  if (!configured) {
    return false;
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!timingSafeEqualString(normalizedEmail, configured.email)) {
    return false;
  }

  return timingSafeEqualString(password, configured.password);
}

export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}
