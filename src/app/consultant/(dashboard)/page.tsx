import { Suspense } from "react";
import type { ConsultationStatus } from "@prisma/client";
import { redirect } from "next/navigation";

import { ConsultationsTable } from "@/components/admin/consultations-table";
import { ALL_STATUSES } from "@/lib/admin-labels";
import { getAdminSession } from "@/lib/admin-auth";
import { listConsultationsForAdmin } from "@/lib/admin-queries";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
  }>;
};

function parseStatus(value: string | undefined): ConsultationStatus | undefined {
  if (!value) return undefined;
  return ALL_STATUSES.includes(value as ConsultationStatus)
    ? (value as ConsultationStatus)
    : undefined;
}

export default async function ConsultantDashboardPage({ searchParams }: PageProps) {
  const session = await getAdminSession();
  if (!session?.consultantId) {
    redirect("/admin/login?next=/consultant");
  }

  const params = await searchParams;
  const q = params.q ?? "";
  const status = parseStatus(params.status);
  const page = Math.max(1, Number(params.page) || 1);

  const result = await listConsultationsForAdmin({
    q,
    status,
    page,
    consultantId: session.consultantId,
  });

  return (
    <Suspense>
      <ConsultationsTable
        heading="طلباتك"
        basePath="/consultant"
        emptyMessage="لا توجد طلبات مخصصة لك بعد"
        initialData={result.data}
        initialStats={result.stats}
        initialQuery={q}
        initialStatus={status ?? ""}
        initialPage={result.pagination.page}
        totalPages={result.pagination.totalPages}
        total={result.pagination.total}
      />
    </Suspense>
  );
}
