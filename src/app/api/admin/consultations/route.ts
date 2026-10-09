import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { z } from "zod";

import { ALL_STATUSES } from "@/lib/admin-labels";
import { requireAdminApi, serverError } from "@/lib/admin-api";
import { serializeConsultationListItem } from "@/lib/admin-serialize";
import { getPrisma } from "@/lib/prisma";

const querySchema = z.object({
  q: z.string().optional(),
  status: z.enum(ALL_STATUSES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.session) return auth.response!;

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    q: searchParams.get("q") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "معاملات البحث غير صالحة" },
      { status: 400 },
    );
  }

  const { q, status, page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Prisma.ConsultationWhereInput = {};

  if (status) {
    where.status = status;
  }

  if (q?.trim()) {
    const term = q.trim();
    where.OR = [
      { referenceCode: { contains: term, mode: "insensitive" } },
      { fullName: { contains: term, mode: "insensitive" } },
      { phone: { contains: term } },
      { email: { contains: term, mode: "insensitive" } },
    ];
  }

  try {
    const [total, rows, statusCounts, newCount] = await Promise.all([
      getPrisma().consultation.count({ where }),
      getPrisma().consultation.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      getPrisma().consultation.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      getPrisma().consultation.count({ where: { status: "NEW" } }),
    ]);

    const stats = {
      total: await getPrisma().consultation.count(),
      new: newCount,
      byStatus: Object.fromEntries(
        statusCounts.map((item) => [item.status, item._count._all]),
      ),
    };

    return NextResponse.json({
      success: true,
      data: rows.map(serializeConsultationListItem),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      stats,
    });
  } catch (error) {
    console.error("Failed to list consultations:", error);
    return serverError("تعذر تحميل الطلبات");
  }
}
