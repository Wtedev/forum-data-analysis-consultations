import { NextResponse } from "next/server";

import { canAccessConsultation } from "@/lib/admin-auth";
import { badRequest, notFound, requireAdminApi, serverError } from "@/lib/admin-api";
import { consultationDetailInclude } from "@/lib/admin-queries";
import { serializeConsultationDetail } from "@/lib/admin-serialize";
import { getPrisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string; noteId: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if (!auth.session) return auth.response!;

  const { id, noteId } = await context.params;

  try {
    const consultation = await getPrisma().consultation.findUnique({ where: { id } });
    if (!consultation || !canAccessConsultation(auth.session, consultation)) {
      return notFound("الطلب غير موجود");
    }

    const note = await getPrisma().consultationNote.findFirst({
      where: { id: noteId, consultationId: id },
      select: { id: true, adminUserId: true },
    });
    if (!note) return notFound("التعليق غير موجود");

    const isAuthor = note.adminUserId === auth.session.sub;
    if (auth.session.role !== "ADMIN" && !isAuthor) {
      return badRequest("حذف التعليق متاح لصاحبه");
    }

    const updated = await getPrisma().$transaction(async (tx) => {
      await tx.consultationNote.delete({ where: { id: note.id } });
      return tx.consultation.findUniqueOrThrow({
        where: { id },
        include: consultationDetailInclude,
      });
    });

    return NextResponse.json({
      success: true,
      data: serializeConsultationDetail(updated),
    });
  } catch (error) {
    console.error("Failed to delete note:", error);
    return serverError("تعذر حذف التعليق");
  }
}
