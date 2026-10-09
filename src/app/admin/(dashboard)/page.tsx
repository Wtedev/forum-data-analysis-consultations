import { Suspense } from "react";
import type { ConsultationStatus } from "@prisma/client";

import { ConsultationsTable } from "@/components/admin/consultations-table";
import { ALL_STATUSES } from "@/lib/admin-labels";
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

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q ?? "";
  const status = parseStatus(params.status);
  const page = Math.max(1, Number(params.page) || 1);

  const result = await listConsultationsForAdmin({ q, status, page });

  return (
    <Suspense>
      <ConsultationsTable
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
