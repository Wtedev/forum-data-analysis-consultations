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
    return badRequest("حذف المستشار متاح للإدارة فقط");
  }

  const { id } = await context.params;

  try {
    const consultant = await getPrisma().adminUser.findUnique({
      where: { id },
      select: { id: true, role: true, email: true, name: true },
    });

    if (!consultant || consultant.role !== "CONSULTANT") {
      return notFound("المستشار غير موجود");
    }

    await getPrisma().$transaction([
      getPrisma().consultationNote.updateMany({
        where: { adminUserId: consultant.id },
        data: { adminUserId: auth.session.sub },
      }),
      getPrisma().consultantInvite.deleteMany({
        where: { email: consultant.email },
      }),
      getPrisma().adminUser.delete({
        where: { id: consultant.id },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `حُذف ${consultant.name}`,
    });
  } catch (error) {
    console.error("Failed to delete consultant", error);
    return serverError("تعذر حذف المستشار");
  }
}
