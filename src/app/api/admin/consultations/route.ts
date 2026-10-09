import { NextResponse } from "next/server";
import { z } from "zod";

import { ALL_STATUSES } from "@/lib/admin-labels";
import { requireAdminApi, serverError } from "@/lib/admin-api";
import { consultationScope } from "@/lib/admin-auth";
import { listConsultationsForAdmin } from "@/lib/admin-queries";

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

  try {
    const result = await listConsultationsForAdmin({
      q,
      status,
      page,
      limit,
      consultantId: consultationScope(auth.session),
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Failed to list consultations:", error);
    return serverError("تعذر تحميل الطلبات");
  }
}
