import type { ConsultationStatus, Prisma } from "@prisma/client";

import { canAccessConsultation, type SessionPayload } from "@/lib/admin-auth";
import { serializeConsultationDetail, serializeConsultationListItem } from "@/lib/admin-serialize";
import { consultantNamesByKey } from "@/lib/consultant-directory";
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

const ONGOING_STATUSES: ConsultationStatus[] = ["IN_REVIEW", "CONTACTED", "ANSWERED", "NEEDS_FOLLOW_UP"];

export type ConsultationAssignmentFilter = "mine" | "assigned" | "unassigned";
export type ConsultationStageFilter = "new" | "ongoing" | "closed";

function stageConstraint(stage?: ConsultationStageFilter): Prisma.ConsultationWhereInput {
  if (stage === "new") return { status: "NEW" };
  if (stage === "closed") return { status: "CLOSED" };
  if (stage === "ongoing") return { status: { in: ONGOING_STATUSES } };
  return {};
}

function assignmentConstraint(
  assignment: ConsultationAssignmentFilter | undefined,
  assigneeId?: string,
): Prisma.ConsultationWhereInput {
  if (assignment === "mine" && assigneeId) return { assignedToId: assigneeId };
  if (assignment === "assigned") return { assignedToId: { not: null } };
  if (assignment === "unassigned") return { assignedToId: null };
  return {};
}

export async function listConsultationsForAdmin(options: {
  q?: string;
  status?: ConsultationStatus;
  assignment?: ConsultationAssignmentFilter;
  stage?: ConsultationStageFilter;
  page?: number;
  limit?: number;
  access?: Prisma.ConsultationWhereInput;
  assigneeId?: string;
}) {
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  const skip = (page - 1) * limit;
  const scope: Prisma.ConsultationWhereInput = options.access ?? {};
  const filters: Prisma.ConsultationWhereInput[] = [scope];

  const activeStage = stageConstraint(options.stage);
  const activeAssignment = assignmentConstraint(options.assignment, options.assigneeId);

  if (options.stage) {
    filters.push(activeStage);
  } else if (options.status) {
    filters.push({ status: options.status });
  }

  if (options.assignment) {
    filters.push(activeAssignment);
  }

  if (options.q?.trim()) {
    const term = options.q.trim();
    filters.push({
      OR: [
        { referenceCode: { contains: term, mode: "insensitive" } },
        { fullName: { contains: term, mode: "insensitive" } },
        { phone: { contains: term } },
        { email: { contains: term, mode: "insensitive" } },
      ],
    });
  }

  const where: Prisma.ConsultationWhereInput = { AND: filters };

  const mineWhere: Prisma.ConsultationWhereInput | null = options.assigneeId
    ? { AND: [scope, { assignedToId: options.assigneeId }] }
    : null;
  const openPoolWhere: Prisma.ConsultationWhereInput | null = options.assigneeId
    ? { AND: [scope, { assignedToId: null }] }
    : null;

  const countWhere = (extra: Prisma.ConsultationWhereInput) =>
    getPrisma().consultation.count({ where: { AND: [scope, extra] } });

  const [total, rows, statusCounts, newCount, allTotal, mineCount, unassignedCount, segmentMine, segmentAssigned, segmentUnassigned, segmentNew, segmentOngoing, segmentClosed] = await Promise.all([
    getPrisma().consultation.count({ where }),
    getPrisma().consultation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { assignedTo: { select: { id: true, name: true } } },
    }),
    getPrisma().consultation.groupBy({
      by: ["status"],
      where: scope,
      _count: { _all: true },
    }),
    getPrisma().consultation.count({ where: { ...scope, status: "NEW" } }),
    getPrisma().consultation.count({ where: scope }),
    mineWhere ? getPrisma().consultation.count({ where: mineWhere }) : Promise.resolve(0),
    openPoolWhere ? getPrisma().consultation.count({ where: openPoolWhere }) : Promise.resolve(0),
    options.assigneeId ? countWhere({ AND: [activeStage, { assignedToId: options.assigneeId }] }) : Promise.resolve(0),
    countWhere({ AND: [activeStage, { assignedToId: { not: null } }] }),
    countWhere({ AND: [activeStage, { assignedToId: null }] }),
    countWhere({ AND: [activeAssignment, { status: "NEW" }] }),
    countWhere({ AND: [activeAssignment, { status: { in: ONGOING_STATUSES } }] }),
    countWhere({ AND: [activeAssignment, { status: "CLOSED" }] }),
  ]);

  const names = await consultantNamesByKey(rows.map((row) => row.preferredConsultant));

  return {
    data: rows.map((row) => {
      const item = serializeConsultationListItem(row);
      const name = names[item.preferredConsultantId];
      return name ? { ...item, preferredConsultantLabel: name } : item;
    }),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
    stats: {
      total: allTotal,
      new: newCount,
      mine: mineCount,
      unassigned: unassignedCount,
      byStatus: Object.fromEntries(
        statusCounts.map((item) => [item.status, item._count._all]),
      ),
      segments: {
        mine: segmentMine,
        assigned: segmentAssigned,
        unassigned: segmentUnassigned,
        new: segmentNew,
        ongoing: segmentOngoing,
        closed: segmentClosed,
      },
    },
  };
}

export async function getConsultationDetailForAdmin(id: string, session?: SessionPayload) {
  const consultation = await getPrisma().consultation.findUnique({
    where: { id },
    include: consultationDetailInclude,
  });

  if (!consultation) return null;
  if (session && !canAccessConsultation(session, consultation)) return null;

  const detail = serializeConsultationDetail(consultation);
  const names = await consultantNamesByKey([consultation.preferredConsultant]);
  const name = names[consultation.preferredConsultant];
  if (!name) return detail;

  return {
    ...detail,
    preferredConsultantLabel: name,
    preferredConsultantFullLabel: name,
  };
}
