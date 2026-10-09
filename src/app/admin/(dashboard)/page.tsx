import { Suspense } from "react";
import type { ConsultationStatus } from "@prisma/client";

import { ConsultationsTable } from "@/components/admin/consultations-table";
import { InviteConsultantForm } from "@/components/admin/invite-consultant-form";
import { ALL_STATUSES } from "@/lib/admin-labels";
import { listConsultationsForAdmin } from "@/lib/admin-queries";
import { ASSIGNABLE_CONSULTANTS } from "@/lib/consultants";

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
    <div className="space-y-6">
      <InviteConsultantForm
        consultants={ASSIGNABLE_CONSULTANTS.map((item) => ({ id: item.id, label: item.shortLabel }))}
      />
      <Suspense>
        <ConsultationsTable
          heading="كل طلبات الاستشارات"
          initialData={result.data}
          initialStats={result.stats}
          initialQuery={q}
          initialStatus={status ?? ""}
          initialPage={result.pagination.page}
          totalPages={result.pagination.totalPages}
          total={result.pagination.total}
        />
      </Suspense>
    </div>
  );
}
