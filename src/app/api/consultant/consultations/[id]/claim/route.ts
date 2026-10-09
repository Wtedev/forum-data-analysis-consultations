import { NextResponse } from "next/server";

import { badRequest, notFound, requireAdminApi, serverError } from "@/lib/admin-api";
import { getPrisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if (!auth.session) return auth.response!;
  if (auth.session.role !== "CONSULTANT" || !auth.session.consultantId) {
    return badRequest("اختيار الطلب متاح للمستشار");
  }

  const { id } = await context.params;

  try {
    const claimed = await getPrisma().consultation.updateMany({
      where: {
        id,
        assignedToId: null,
        preferredConsultant: "NO_PREFERENCE",
      },
      data: { assignedToId: auth.session.sub },
    });

    if (claimed.count === 0) {
      const existing = await getPrisma().consultation.findUnique({
        where: { id },
        select: { id: true },
      });
      if (!existing) return notFound("الطلب غير موجود");
      return badRequest("اختار هذا الطلب مستشار آخر");
    }

    await getPrisma().activityLog.create({
      data: {
        adminUserId: auth.session.sub,
        consultationId: id,
        actionType: "CONSULTATION_CLAIMED",
        description: `اختار ${auth.session.name} الطلب`,
      },
    });

    return NextResponse.json({
      success: true,
      assignedTo: { id: auth.session.sub, name: auth.session.name },
    });
  } catch (error) {
    console.error("Failed to claim consultation", error);
    return serverError("تعذر اختيار الطلب");
  }
}
