import { Suspense } from "react";
import type { ConsultationStatus } from "@prisma/client";

import { ConsultationsTable } from "@/components/admin/consultations-table";
import { ALL_STATUSES } from "@/lib/admin-labels";
import { listConsultationsForAdmin } from "@/lib/admin-queries";
import { getPrisma } from "@/lib/prisma";

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

  const [result, assignees] = await Promise.all([
    listConsultationsForAdmin({ q, status, page }),
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
          initialStatus={status ?? ""}
          initialPage={result.pagination.page}
          totalPages={result.pagination.totalPages}
          total={result.pagination.total}
          assignees={assignees}
        />
      </Suspense>
    </div>
  );
}
