import { NextResponse } from "next/server";
import { z } from "zod";

import { badRequest, requireAdminApi, serverError } from "@/lib/admin-api";
import { appUrl } from "@/lib/app-url";
import { inviteEmail } from "@/lib/consultation-mail";
import { ASSIGNABLE_CONSULTANTS, consultantShortLabel, isAssignableConsultant } from "@/lib/consultants";
import { createInviteToken } from "@/lib/invite-token";
import { sendEmail } from "@/lib/mail";
import { getPrisma } from "@/lib/prisma";

const consultantKeys = ASSIGNABLE_CONSULTANTS.map((item) => item.id) as [
  (typeof ASSIGNABLE_CONSULTANTS)[number]["id"],
  ...(typeof ASSIGNABLE_CONSULTANTS)[number]["id"][],
];

const inviteSchema = z.object({
  consultantKey: z.enum(consultantKeys),
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
  if (!parsed.success || !isAssignableConsultant(parsed.data.consultantKey)) {
    return badRequest("اختر المستشار وأدخل بريداً صحيحاً");
  }

  const email = parsed.data.email.trim().toLowerCase();
  const consultantKey = parsed.data.consultantKey;
  const name = consultantShortLabel(consultantKey);
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

    if (existing?.consultantKey === consultantKey) {
      return badRequest("لهذا المستشار حساب مفعّل بالفعل");
    }

    if (existing?.email === email) {
      return badRequest("هذا البريد مرتبط بحساب آخر");
    }

    const { token, tokenHash } = createInviteToken();
    const expiresAt = new Date(Date.now() + INVITE_DAYS * 24 * 60 * 60 * 1000);

    await getPrisma().$transaction([
      getPrisma().consultantInvite.deleteMany({
        where: { consultantKey, acceptedAt: null },
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
    const message = inviteEmail({ name, acceptUrl });
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
