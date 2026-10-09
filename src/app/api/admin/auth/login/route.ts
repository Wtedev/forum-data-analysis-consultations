import { NextResponse } from "next/server";
import { z } from "zod";

import { badRequest, serverError } from "@/lib/admin-api";
import {
  getAdminCredentialsFromEnv,
  INVALID_CREDENTIALS_MESSAGE,
  passwordsMatch,
  setSessionCookie,
  signSession,
  verifyAdminCredentials,
} from "@/lib/admin-auth";
import {
  consultantLoginConfigured,
  findConsultantAccount,
} from "@/lib/consultant-accounts";
import { getPrisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.email(INVALID_CREDENTIALS_MESSAGE),
  password: z.string().min(1, INVALID_CREDENTIALS_MESSAGE),
});

const PLACEHOLDER_PASSWORD_HASH =
  "$2a$10$000000000000000000000000000000000000000000000000000000";

export async function POST(request: Request) {
  if (!getAdminCredentialsFromEnv() && !consultantLoginConfigured()) {
    console.error("Staff login is not configured");
    return serverError("تعذر تسجيل الدخول");
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return badRequest("طلب غير صالح");
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(INVALID_CREDENTIALS_MESSAGE);
  }

  const { email, password } = parsed.data;

  try {
    if (verifyAdminCredentials(email, password)) {
      const configured = getAdminCredentialsFromEnv()!;
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
        consultantId: null,
      });

      await setSessionCookie(token);

      return NextResponse.json({
        success: true,
        redirectTo: "/admin",
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          consultantId: null,
        },
      });
    }

    const account = findConsultantAccount(email);
    if (!account || !passwordsMatch(password, account.password)) {
      return badRequest(INVALID_CREDENTIALS_MESSAGE);
    }

    const consultant = await getPrisma().adminUser.upsert({
      where: { email: account.email },
      update: { name: account.name, role: "CONSULTANT" },
      create: {
        email: account.email,
        name: account.name,
        passwordHash: PLACEHOLDER_PASSWORD_HASH,
        role: "CONSULTANT",
      },
      select: { id: true, name: true, email: true, role: true },
    });

    const token = signSession({
      sub: consultant.id,
      email: consultant.email,
      name: consultant.name,
      role: consultant.role,
      consultantId: account.id,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      redirectTo: "/consultant",
      admin: {
        id: consultant.id,
        name: consultant.name,
        email: consultant.email,
        role: consultant.role,
        consultantId: account.id,
      },
    });
  } catch (error) {
    console.error("Staff login failed:", error);
    return serverError("تعذر تسجيل الدخول");
  }
}
