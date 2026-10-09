import { NextResponse } from "next/server";
import { z } from "zod";

import { badRequest, requireAdminApi, serverError } from "@/lib/admin-api";
import { formatDateTime } from "@/lib/admin-labels";
import { getPrisma } from "@/lib/prisma";

const querySchema = z.object({
  unreadOnly: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.session) return auth.response!;

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    unreadOnly: searchParams.get("unreadOnly") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return badRequest("معاملات غير صالحة");
  }

  const { unreadOnly, limit } = parsed.data;

  try {
    const [notifications, unreadCount] = await Promise.all([
      getPrisma().notification.findMany({
        where: unreadOnly ? { isRead: false } : undefined,
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          consultation: {
            select: { id: true, referenceCode: true, fullName: true },
          },
        },
      }),
      getPrisma().notification.count({ where: { isRead: false } }),
    ]);

    return NextResponse.json({
      success: true,
      unreadCount,
      data: notifications.map((item) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        message: item.message,
        isRead: item.isRead,
        createdAt: item.createdAt.toISOString(),
        createdAtLabel: formatDateTime(item.createdAt),
        consultation: item.consultation,
      })),
    });
  } catch (error) {
    console.error("Failed to list notifications:", error);
    return serverError("تعذر تحميل الإشعارات");
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.session) return auth.response!;

  try {
    const result = await getPrisma().notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({
      success: true,
      updated: result.count,
    });
  } catch (error) {
    console.error("Failed to mark notifications read:", error);
    return serverError("تعذر تحديث الإشعارات");
  }
}
