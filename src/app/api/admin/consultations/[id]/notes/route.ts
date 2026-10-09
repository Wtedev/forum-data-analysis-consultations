import { NextResponse } from "next/server";
import { z } from "zod";

import { badRequest, notFound, requireAdminApi, serverError } from "@/lib/admin-api";
import { consultationDetailInclude } from "@/lib/admin-queries";
import { serializeConsultationDetail } from "@/lib/admin-serialize";
import { getPrisma } from "@/lib/prisma";

const noteSchema = z.object({
  note: z.string().trim().min(1, "الملاحظة مطلوبة").max(5000),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if (!auth.session) return auth.response!;

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("طلب غير صالح");
  }

  const parsed = noteSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("نص الملاحظة غير صالح");
  }

  try {
    const existing = await getPrisma().consultation.findUnique({ where: { id } });
    if (!existing) return notFound("الطلب غير موجود");

    const consultation = await getPrisma().$transaction(async (tx) => {
      await tx.consultationNote.create({
        data: {
          consultationId: id,
          adminUserId: auth.session!.sub,
          note: parsed.data.note,
        },
      });

      await tx.activityLog.create({
        data: {
          adminUserId: auth.session!.sub,
          consultationId: id,
          actionType: "NOTE_ADDED",
          description: "إضافة ملاحظة داخلية",
        },
      });

      return tx.consultation.findUniqueOrThrow({
        where: { id },
        include: consultationDetailInclude,
      });
    });

    return NextResponse.json({
      success: true,
      data: serializeConsultationDetail(consultation),
    });
  } catch (error) {
    console.error("Failed to add note:", error);
    return serverError("تعذر إضافة الملاحظة");
  }
}
