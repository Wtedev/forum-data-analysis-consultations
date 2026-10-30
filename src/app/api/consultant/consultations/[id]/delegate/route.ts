import { NextResponse } from "next/server";

import { badRequest, notFound, requireAdminApi, serverError } from "@/lib/admin-api";
import { consultationDetailInclude } from "@/lib/admin-queries";
import { serializeConsultationDetail } from "@/lib/admin-serialize";
import { getPrisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if (!auth.session) return auth.response!;
  if (auth.session.role !== "CONSULTANT" || !auth.session.consultantId) {
    return badRequest("تفويض الاستشارة متاح للمستشار الذي يحملها");
  }

  const { id } = await context.params;

  try {
    const released = await getPrisma().consultation.updateMany({
      where: {
        id,
        assignedToId: auth.session.sub,
      },
      data: {
        assignedToId: null,
        preferredConsultant: "NO_PREFERENCE",
      },
    });

    if (released.count === 0) {
      const existing = await getPrisma().consultation.findUnique({
        where: { id },
        select: { id: true, assignedToId: true },
      });
      if (!existing) return notFound("الطلب غير موجود");
      return badRequest("تفويض الاستشارة متاح لمن هي مسندة إليه");
    }

    await getPrisma().activityLog.create({
      data: {
        adminUserId: auth.session.sub,
        consultationId: id,
        actionType: "CONSULTATION_DELEGATED",
        description: `فوّض ${auth.session.name} الاستشارة، وأصبحت متاحة للمستشارين`,
      },
    });

    const consultation = await getPrisma().consultation.findUniqueOrThrow({
      where: { id },
      include: consultationDetailInclude,
    });

    return NextResponse.json({
      success: true,
      data: serializeConsultationDetail(consultation),
    });
  } catch (error) {
    console.error("Failed to delegate consultation", error);
    return serverError("تعذر تفويض الاستشارة");
  }
}
