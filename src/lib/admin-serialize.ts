import type {
  ActivityLog,
  AdminUser,
  Consultation,
  ConsultationNote,
  ConsultationStatus,
  Priority,
} from "@prisma/client";

import {
  CONTACT_DB_LABELS,
  formatDateTime,
  GENDER_DB_LABELS,
  PRIORITY_LABELS,
  STAGE_DB_LABELS,
  STATUS_LABELS,
  TYPE_DB_LABELS,
} from "@/lib/admin-labels";

export type ConsultationListItem = {
  id: string;
  referenceCode: string;
  fullName: string;
  phone: string;
  consultationTypeLabel: string;
  status: ConsultationStatus;
  statusLabel: string;
  priority: Priority;
  priorityLabel: string;
  createdAt: string;
  createdAtLabel: string;
};

export type ConsultationDetail = ConsultationListItem & {
  email: string | null;
  genderLabel: string;
  currentStageLabel: string;
  university: string | null;
  majorInterest: string | null;
  question: string;
  preferredContactMethodLabel: string;
  updatedAt: string;
  updatedAtLabel: string;
  closedAt: string | null;
  closedAtLabel: string | null;
  assignedTo: { id: string; name: string } | null;
  notes: {
    id: string;
    note: string;
    createdAtLabel: string;
    adminName: string;
  }[];
  activityLogs: {
    id: string;
    description: string;
    createdAtLabel: string;
    adminName: string | null;
  }[];
};

export function serializeConsultationListItem(
  row: Consultation,
): ConsultationListItem {
  return {
    id: row.id,
    referenceCode: row.referenceCode,
    fullName: row.fullName,
    phone: row.phone,
    consultationTypeLabel: TYPE_DB_LABELS[row.consultationType],
    status: row.status,
    statusLabel: STATUS_LABELS[row.status],
    priority: row.priority,
    priorityLabel: PRIORITY_LABELS[row.priority],
    createdAt: row.createdAt.toISOString(),
    createdAtLabel: formatDateTime(row.createdAt),
  };
}

export function serializeConsultationDetail(
  row: Consultation & {
    assignedTo: Pick<AdminUser, "id" | "name"> | null;
    notes: (ConsultationNote & { adminUser: Pick<AdminUser, "name"> })[];
    activityLogs: (ActivityLog & { adminUser: Pick<AdminUser, "name"> | null })[];
  },
): ConsultationDetail {
  return {
    ...serializeConsultationListItem(row),
    email: row.email,
    genderLabel: GENDER_DB_LABELS[row.gender],
    currentStageLabel: STAGE_DB_LABELS[row.currentStage],
    university: row.university,
    majorInterest: row.majorInterest,
    question: row.question,
    preferredContactMethodLabel: CONTACT_DB_LABELS[row.preferredContactMethod],
    updatedAt: row.updatedAt.toISOString(),
    updatedAtLabel: formatDateTime(row.updatedAt),
    closedAt: row.closedAt?.toISOString() ?? null,
    closedAtLabel: row.closedAt ? formatDateTime(row.closedAt) : null,
    assignedTo: row.assignedTo,
    notes: row.notes.map((note) => ({
      id: note.id,
      note: note.note,
      createdAtLabel: formatDateTime(note.createdAt),
      adminName: note.adminUser.name,
    })),
    activityLogs: row.activityLogs.map((log) => ({
      id: log.id,
      description: log.description,
      createdAtLabel: formatDateTime(log.createdAt),
      adminName: log.adminUser?.name ?? null,
    })),
  };
}
