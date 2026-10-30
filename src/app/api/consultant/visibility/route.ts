import { NextResponse } from "next/server";
import { z } from "zod";

import { badRequest, requireAdminApi, serverError } from "@/lib/admin-api";
import { getPrisma } from "@/lib/prisma";

const bodySchema = z.object({
  visible: z.boolean(),
});

export async function PATCH(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.session) return auth.response!;
  if (auth.session.role !== "CONSULTANT" || !auth.session.consultantId) {
    return badRequest("هذا الإجراء متاح للمستشار");
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return badRequest("البيانات غير مكتملة");

  try {
    const updated = await getPrisma().adminUser.updateMany({
      where: {
        id: auth.session.sub,
        role: "CONSULTANT",
        consultantKey: auth.session.consultantId,
      },
      data: { visibleToApplicants: parsed.data.visible },
    });
    if (updated.count === 0) return badRequest("تعذر تحديث الظهور");

    return NextResponse.json({ success: true, visible: parsed.data.visible });
  } catch (error) {
    console.error("Failed to update consultant visibility", error);
    return serverError("تعذر تحديث الظهور");
  }
}
