import { Suspense } from "react";
import type { ConsultationStatus } from "@prisma/client";
import { redirect } from "next/navigation";

import { ConsultationsTable } from "@/components/admin/consultations-table";
import { ALL_STATUSES } from "@/lib/admin-labels";
import { consultationAccessWhere, getAdminSession } from "@/lib/admin-auth";
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
    access: consultationAccessWhere(session),
  });

  return (
    <Suspense>
      <div className="mb-6 rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-[#e6e8ec]">
        <h1 className="text-lg font-semibold text-[#111827]">طلبات الاستشارة</h1>
        <p className="mt-2 text-sm leading-7 text-[#374151]">
          تجد هنا الطلبات الظاهرة لك: ما طُلب باسمك، وما أخذته، والطلبات المتاحة لكل المستشارين.
        </p>
        <ul className="mt-3 space-y-1.5 text-sm leading-7 text-[#374151]">
          <li>
            <span className="font-semibold text-[#111827]">أخذ الاستشارة</span> يجعل الطلب لك، ويختفي من بقية المستشارين.
          </li>
          <li>
            <span className="font-semibold text-[#111827]">واتساب</span> يفتح محادثة مع صاحب الطلب.
          </li>
          <li>
            <span className="font-semibold text-[#111827]">عرض</span> يفتح التفاصيل لتحديث الحالة وكتابة ملاحظة.
          </li>
        </ul>
      </div>
      <ConsultationsTable
        basePath="/consultant"
        canClaim
        showSearchButton={false}
        emptyMessage="لا توجد طلبات الآن. عندما يصل طلب موجه إليك، أو طلب بلا تفضيل، سيظهر هنا."
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
