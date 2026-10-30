import { Suspense } from "react";
import type { ConsultationStatus } from "@prisma/client";
import { redirect } from "next/navigation";

import { ConsultationsTable } from "@/components/admin/consultations-table";
import { ALL_STATUSES } from "@/lib/admin-labels";
import { consultationAccessWhere, getAdminSession } from "@/lib/admin-auth";
import {
  listConsultationsForAdmin,
  type ConsultationAssignmentFilter,
  type ConsultationStageFilter,
} from "@/lib/admin-queries";

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
  return value === "mine" || value === "unassigned" ? value : undefined;
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

export default async function ConsultantDashboardPage({ searchParams }: PageProps) {
  const session = await getAdminSession();
  if (!session?.consultantId) {
    redirect("/admin/login?next=/consultant");
  }

  const params = await searchParams;
  const q = params.q ?? "";
  const assignment = parseAssignment(params.scope);
  const stage = parseStage(params.stage) ?? stageFromStatus(params.status);
  const page = Math.max(1, Number(params.page) || 1);

  const result = await listConsultationsForAdmin({
    q,
    assignment,
    stage,
    page,
    access: consultationAccessWhere(session),
    assigneeId: session.sub,
  });

  return (
    <Suspense>
      <ConsultationsTable
        heading="كل الاستشارات"
        basePath="/consultant"
        canClaim
        iconTools
        showSearchButton={false}
        emptyMessage="لا توجد طلبات الآن. عندما يصل طلب موجه إليك، أو طلب بلا تفضيل، سيظهر هنا."
        initialData={result.data.map((row) => (row.assignedTo ? row : { ...row, phone: "" }))}
        initialStats={result.stats}
        initialQuery={q}
        initialStatus=""
        initialScope={assignment ?? ""}
        initialStage={stage ?? ""}
        initialPage={result.pagination.page}
        totalPages={result.pagination.totalPages}
        total={result.pagination.total}
      />
    </Suspense>
  );
}
