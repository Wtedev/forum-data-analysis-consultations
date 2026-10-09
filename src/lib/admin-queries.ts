import type { ConsultationStatus, Prisma } from "@prisma/client";

import { serializeConsultationDetail, serializeConsultationListItem } from "@/lib/admin-serialize";
import { getPrisma } from "@/lib/prisma";

export const consultationDetailInclude = {
  assignedTo: { select: { id: true, name: true } },
  notes: {
    orderBy: { createdAt: "desc" as const },
    include: { adminUser: { select: { name: true } } },
  },
  activityLogs: {
    orderBy: { createdAt: "desc" as const },
    take: 30,
    include: { adminUser: { select: { name: true } } },
  },
};

export async function listConsultationsForAdmin(options: {
  q?: string;
  status?: ConsultationStatus;
  page?: number;
  limit?: number;
}) {
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  const skip = (page - 1) * limit;

  const where: Prisma.ConsultationWhereInput = {};

  if (options.status) {
    where.status = options.status;
  }

  if (options.q?.trim()) {
    const term = options.q.trim();
    where.OR = [
      { referenceCode: { contains: term, mode: "insensitive" } },
      { fullName: { contains: term, mode: "insensitive" } },
      { phone: { contains: term } },
      { email: { contains: term, mode: "insensitive" } },
    ];
  }

  const [total, rows, statusCounts, newCount, allTotal] = await Promise.all([
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
    getPrisma().consultation.count(),
  ]);

  return {
    data: rows.map(serializeConsultationListItem),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
    stats: {
      total: allTotal,
      new: newCount,
      byStatus: Object.fromEntries(
        statusCounts.map((item) => [item.status, item._count._all]),
      ),
    },
  };
}

export async function getConsultationDetailForAdmin(id: string) {
  const consultation = await getPrisma().consultation.findUnique({
    where: { id },
    include: consultationDetailInclude,
  });

  if (!consultation) return null;

  return serializeConsultationDetail(consultation);
}
