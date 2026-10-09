import { NextResponse } from "next/server";
import { z } from "zod";

import { badRequest, serverError } from "@/lib/admin-api";
import { setSessionCookie, signSession } from "@/lib/admin-auth";
import { hashInviteToken } from "@/lib/invite-token";
import { hashPassword } from "@/lib/password";
import { getPrisma } from "@/lib/prisma";

const acceptSchema = z
  .object({
    token: z.string().min(20),
    password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
  });

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("طلب غير صالح");
  }

  const parsed = acceptSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "بيانات الدعوة غير صالحة");
  }

  try {
    const invite = await getPrisma().consultantInvite.findUnique({
      where: { tokenHash: hashInviteToken(parsed.data.token) },
    });

    if (!invite || invite.acceptedAt || invite.expiresAt.getTime() < Date.now()) {
      return badRequest("الدعوة غير صالحة أو انتهت");
    }

    const passwordHash = await hashPassword(parsed.data.password);

    const consultant = await getPrisma().$transaction(async (tx) => {
      const user = await tx.adminUser.create({
        data: {
          email: invite.email,
          name: invite.name,
          passwordHash,
          role: "CONSULTANT",
          consultantKey: invite.consultantKey,
        },
        select: { id: true, name: true, email: true, role: true, consultantKey: true },
      });

      await tx.consultantInvite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      });

      return user;
    });

    if (!consultant.consultantKey) {
      return serverError("تعذر تفعيل الحساب");
    }

    const token = signSession({
      sub: consultant.id,
      email: consultant.email,
      name: consultant.name,
      role: consultant.role,
      consultantId: consultant.consultantKey,
    });
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      redirectTo: "/consultant",
    });
  } catch (error) {
    console.error("Failed to accept consultant invite", error);
    return serverError("تعذر تفعيل الحساب");
  }
}
