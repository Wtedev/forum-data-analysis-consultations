import { NextResponse } from "next/server";
import type { ConsultationStatus, Priority } from "@prisma/client";
import { z } from "zod";

import { ALL_PRIORITIES, ALL_STATUSES, STATUS_LABELS } from "@/lib/admin-labels";
import { notifyConsultationAssigned, notifyStatusChanged } from "@/lib/consultation-mail";
import { canAccessConsultation, canManageConsultation } from "@/lib/admin-auth";
import { badRequest, notFound, requireAdminApi, serverError } from "@/lib/admin-api";
import { consultationDetailInclude } from "@/lib/admin-queries";
import { serializeConsultationDetail } from "@/lib/admin-serialize";
import { getPrisma } from "@/lib/prisma";

const updateSchema = z.object({
  status: z.enum(ALL_STATUSES).optional(),
  priority: z.enum(ALL_PRIORITIES).optional(),
  assignedToId: z.string().min(1).nullable().optional(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if (!auth.session) return auth.response!;

  const { id } = await context.params;

  try {
    const consultation = await getPrisma().consultation.findUnique({
      where: { id },
      include: consultationDetailInclude,
    });

    if (!consultation || !canAccessConsultation(auth.session, consultation)) {
      return notFound("الطلب غير موجود");
    }

    return NextResponse.json({
      success: true,
      data: serializeConsultationDetail(consultation),
    });
  } catch (error) {
    console.error("Failed to fetch consultation:", error);
    return serverError("تعذر تحميل الطلب");
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if (!auth.session) return auth.response!;

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("طلب غير صالح");
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("بيانات التحديث غير صالحة");
  }

  if (!parsed.data.status && !parsed.data.priority && parsed.data.assignedToId === undefined) {
    return badRequest("لا توجد بيانات للتحديث");
  }

  if (parsed.data.assignedToId !== undefined && auth.session.role !== "ADMIN") {
    return badRequest("إسناد الطلب متاح للإدارة فقط");
  }

  try {
    const existing = await getPrisma().consultation.findUnique({ where: { id } });
    if (!existing || !canAccessConsultation(auth.session, existing)) {
      return notFound("الطلب غير موجود");
    }
    if (!canManageConsultation(auth.session, existing)) {
      return badRequest("اختر الطلب أولاً قبل تعديله");
    }

    const updates: {
      status?: ConsultationStatus;
      priority?: Priority;
      closedAt?: Date | null;
      assignedToId?: string | null;
    } = {};
    let assigneeName: string | null = null;

    if (parsed.data.assignedToId) {
      const assignee = await getPrisma().adminUser.findFirst({
        where: { id: parsed.data.assignedToId, role: "CONSULTANT" },
        select: { id: true, name: true },
      });
      if (!assignee) return badRequest("المستشار غير موجود");
      updates.assignedToId = assignee.id;
      assigneeName = assignee.name;
    } else if (parsed.data.assignedToId === null) {
      updates.assignedToId = null;
    }

    if (parsed.data.status) {
      updates.status = parsed.data.status;
      updates.closedAt = parsed.data.status === "CLOSED" ? new Date() : null;
    }

    if (parsed.data.priority) {
      updates.priority = parsed.data.priority;
    }

    const consultation = await getPrisma().$transaction(async (tx) => {
      const updated = await tx.consultation.update({
        where: { id },
        data: updates,
        include: consultationDetailInclude,
      });

      const descriptions: string[] = [];

      if (parsed.data.status && parsed.data.status !== existing.status) {
        descriptions.push(
          `تغيير الحالة من «${STATUS_LABELS[existing.status]}» إلى «${STATUS_LABELS[parsed.data.status]}»`,
        );
      }

      if (parsed.data.priority && parsed.data.priority !== existing.priority) {
        descriptions.push(`تحديث الأولوية إلى ${parsed.data.priority}`);
      }

      if (parsed.data.assignedToId !== undefined && parsed.data.assignedToId !== existing.assignedToId) {
        descriptions.push(assigneeName ? `إسناد الطلب إلى ${assigneeName}` : "إلغاء إسناد الطلب");
      }

      if (descriptions.length > 0) {
        await tx.activityLog.create({
          data: {
            adminUserId: auth.session!.sub,
            consultationId: id,
            actionType: "CONSULTATION_UPDATED",
            description: descriptions.join(" — "),
          },
        });
      }

      return updated;
    });

    if (
      parsed.data.assignedToId &&
      parsed.data.assignedToId !== existing.assignedToId
    ) {
      await notifyConsultationAssigned({
        id: consultation.id,
        referenceCode: consultation.referenceCode,
        fullName: consultation.fullName,
        email: consultation.email,
        consultationType: consultation.consultationType,
        preferredConsultant: consultation.preferredConsultant,
        assignedToId: parsed.data.assignedToId,
      });
    }

    if (parsed.data.status && parsed.data.status !== existing.status) {
      await notifyStatusChanged(
        {
          id: consultation.id,
          referenceCode: consultation.referenceCode,
          fullName: consultation.fullName,
          email: consultation.email,
          consultationType: consultation.consultationType,
          preferredConsultant: consultation.preferredConsultant,
          assignedToId: consultation.assignedToId,
        },
        parsed.data.status,
      );
    }

    return NextResponse.json({
      success: true,
      data: serializeConsultationDetail(consultation),
    });
  } catch (error) {
    console.error("Failed to update consultation:", error);
    return serverError("تعذر تحديث الطلب");
  }
}
