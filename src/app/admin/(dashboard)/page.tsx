import { Suspense } from "react";
import type { ConsultationStatus } from "@prisma/client";

import { ConsultationsTable } from "@/components/admin/consultations-table";
import { ALL_STATUSES } from "@/lib/admin-labels";
import {
  listConsultationsForAdmin,
  type ConsultationAssignmentFilter,
  type ConsultationStageFilter,
} from "@/lib/admin-queries";
import { getPrisma } from "@/lib/prisma";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    scope?: string;
    stage?: string;
    page?: string;
  }>;
};

function parseAssignment(value: string | undefined): ConsultationAssignmentFilter | undefined {
  return value === "assigned" || value === "unassigned" ? value : undefined;
}

function parseStage(value: string | undefined): ConsultationStageFilter | undefined {
  return value === "new" || value === "ongoing" || value === "closed" ? value : undefined;
}

function stageFromStatus(value: string | undefined): ConsultationStageFilter | undefined {
  if (value === "NEW") return "new";
  if (value === "CLOSED") return "closed";
  if (value && ALL_STATUSES.includes(value as ConsultationStatus)) return "ongoing";
  return undefined;
}

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q ?? "";
  const assignment = parseAssignment(params.scope);
  const stage = parseStage(params.stage) ?? stageFromStatus(params.status);
  const page = Math.max(1, Number(params.page) || 1);

  const [result, assignees] = await Promise.all([
    listConsultationsForAdmin({ q, assignment, stage, page }),
    getPrisma().adminUser.findMany({
      where: { role: "CONSULTANT", consultantKey: { not: null } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <Suspense>
        <ConsultationsTable
          heading="كل الاستشارات"
          iconTools
          desk="admin"
          showSearchButton={false}
          initialData={result.data}
          initialStats={result.stats}
          initialQuery={q}
          initialStatus=""
          initialScope={assignment ?? ""}
          initialStage={stage ?? ""}
          initialPage={result.pagination.page}
          totalPages={result.pagination.totalPages}
          total={result.pagination.total}
          assignees={assignees}
        />
      </Suspense>
    </div>
  );
}
