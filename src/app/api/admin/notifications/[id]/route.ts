import { NextResponse } from "next/server";

import { notFound, requireAdminApi, serverError } from "@/lib/admin-api";
import { getPrisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(_request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if (!auth.session) return auth.response!;

  const { id } = await context.params;

  try {
    const existing = await getPrisma().notification.findUnique({ where: { id } });
    if (!existing) return notFound("الإشعار غير موجود");

    const notification = await getPrisma().notification.update({
      where: { id },
      data: { isRead: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: notification.id,
        isRead: notification.isRead,
      },
    });
  } catch (error) {
    console.error("Failed to update notification:", error);
    return serverError("تعذر تحديث الإشعار");
  }
}
