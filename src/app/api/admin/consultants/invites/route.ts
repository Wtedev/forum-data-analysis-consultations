import { NextResponse } from "next/server";
import { z } from "zod";

import { badRequest, requireAdminApi, serverError } from "@/lib/admin-api";
import { appUrl } from "@/lib/app-url";
import { consultantKeyForInvite } from "@/lib/consultant-directory";
import { inviteEmail } from "@/lib/consultation-mail";
import { createInviteToken } from "@/lib/invite-token";
import { sendEmail } from "@/lib/mail";
import { getPrisma } from "@/lib/prisma";

const inviteSchema = z.object({
  name: z.string().trim().min(2, "أدخل اسم المستشار").max(80),
  email: z.email("أدخل بريداً صحيحاً"),
});

const INVITE_DAYS = 7;

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.session) return auth.response!;
  if (auth.session.role !== "ADMIN") {
    return badRequest("دعوة المستشار متاحة للإدارة فقط");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("طلب غير صالح");
  }

  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "أدخل الاسم والبريد");
  }

  const email = parsed.data.email.trim().toLowerCase();
  const name = parsed.data.name.trim();
  const consultantKey = consultantKeyForInvite();
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (adminEmail && email === adminEmail) {
    return badRequest("هذا البريد مخصص لحساب الإدارة");
  }

  try {
    const existing = await getPrisma().adminUser.findFirst({
      where: {
        OR: [{ email }, { consultantKey }],
      },
      select: { email: true, consultantKey: true },
    });

    if (existing?.email === email || existing?.consultantKey === consultantKey) {
      return badRequest("هذا المستشار لديه حساب بالفعل");
    }

    const { token, tokenHash } = createInviteToken();
    const expiresAt = new Date(Date.now() + INVITE_DAYS * 24 * 60 * 60 * 1000);
    const loginUrl = `${appUrl()}/admin/login`;

    await getPrisma().$transaction([
      getPrisma().consultantInvite.deleteMany({
        where: { email, acceptedAt: null },
      }),
      getPrisma().consultantInvite.create({
        data: {
          email,
          name,
          consultantKey,
          tokenHash,
          expiresAt,
          createdById: auth.session.sub,
        },
      }),
    ]);

    const acceptUrl = `${appUrl()}/consultant/invite/${token}`;
    const message = inviteEmail({ name, acceptUrl, loginUrl });
    const sent = await sendEmail({ to: email, subject: message.subject, html: message.html });

    if (!sent.ok) {
      await getPrisma().consultantInvite.deleteMany({
        where: { tokenHash, acceptedAt: null },
      });
      return serverError(sent.message);
    }

    return NextResponse.json({
      success: true,
      message: `أُرسلت الدعوة إلى ${email}`,
    });
  } catch (error) {
    console.error("Failed to invite consultant", error);
    return serverError("تعذر إرسال الدعوة");
  }
}
