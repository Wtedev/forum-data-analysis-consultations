import { NextResponse } from "next/server";
import { z } from "zod";

import { badRequest, serverError } from "@/lib/admin-api";
import {
  getAdminCredentialsFromEnv,
  INVALID_CREDENTIALS_MESSAGE,
  setSessionCookie,
  signSession,
  verifyAdminCredentials,
} from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.email("Invalid email or password"),
  password: z.string().min(1, "Invalid email or password"),
});

const PLACEHOLDER_PASSWORD_HASH =
  "$2a$10$000000000000000000000000000000000000000000000000000000";

export async function POST(request: Request) {
  if (!getAdminCredentialsFromEnv()) {
    console.error("Admin login is not configured: ADMIN_EMAIL and ADMIN_PASSWORD are required");
    return serverError("Unable to sign in");
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid request");
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(INVALID_CREDENTIALS_MESSAGE);
  }

  const { email, password } = parsed.data;

  if (!verifyAdminCredentials(email, password)) {
    return badRequest(INVALID_CREDENTIALS_MESSAGE);
  }

  const configured = getAdminCredentialsFromEnv()!;

  try {
    const admin = await getPrisma().adminUser.upsert({
      where: { email: configured.email },
      update: { name: configured.name, role: "ADMIN" },
      create: {
        email: configured.email,
        name: configured.name,
        passwordHash: PLACEHOLDER_PASSWORD_HASH,
        role: "ADMIN",
      },
      select: { id: true, name: true, email: true, role: true },
    });

    const token = signSession({
      sub: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin login failed:", error);
    return serverError("Unable to sign in");
  }
}
