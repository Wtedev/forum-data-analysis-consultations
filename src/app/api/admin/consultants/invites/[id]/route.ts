import { NextResponse } from "next/server";

import { badRequest, notFound, requireAdminApi, serverError } from "@/lib/admin-api";
import { getPrisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if (!auth.session) return auth.response!;
  if (auth.session.role !== "ADMIN") {
    return badRequest("حذف الدعوة متاح للإدارة فقط");
  }

  const { id } = await context.params;

  try {
    const invite = await getPrisma().consultantInvite.findUnique({
      where: { id },
      select: { id: true, name: true, acceptedAt: true },
    });

    if (!invite || invite.acceptedAt) {
      return notFound("الدعوة غير موجودة");
    }

    await getPrisma().consultantInvite.delete({ where: { id: invite.id } });

    return NextResponse.json({
      success: true,
      message: `حُذفت دعوة ${invite.name}`,
    });
  } catch (error) {
    console.error("Failed to delete consultant invite", error);
    return serverError("تعذر حذف الدعوة");
  }
}
