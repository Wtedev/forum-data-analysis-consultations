"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { clsx } from "clsx";

import { inputClassName, PrimaryButton, SecondaryButton } from "@/components/consultation/ui";
import { ALL_STATUSES, STATUS_LABELS } from "@/lib/admin-labels";
import type { ConsultationListItem } from "@/lib/admin-serialize";

type Stats = {
  total: number;
  new: number;
  byStatus: Record<string, number>;
};

type ConsultationsTableProps = {
  initialData: ConsultationListItem[];
  initialStats: Stats;
  initialQuery: string;
  initialStatus: string;
  initialPage: number;
  totalPages: number;
  total: number;
};

export function ConsultationsTable({
  initialData,
  initialStats,
  initialQuery,
  initialStatus,
  initialPage,
  totalPages,
  total,
}: ConsultationsTableProps) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [status, setStatus] = useState(initialStatus);

  const applyFilters = useCallback(
    (page = 1) => {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (status) params.set("status", status);
      if (page > 1) params.set("page", String(page));
      const query = params.toString();
      router.push(query ? `/admin?${query}` : "/admin");
    },
    [q, status, router],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="إجمالي الطلبات" value={initialStats.total} />
        <StatCard label="طلبات جديدة" value={initialStats.new} accent />
        <StatCard label="نتائج البحث" value={total} />
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="flex-1">
            <label htmlFor="search" className="mb-2 block text-sm font-medium text-slate-700">
              بحث
            </label>
            <input
              id="search"
              className={inputClassName}
              placeholder="الرقم المرجعي، الاسم، الجوال..."
              value={q}
              onChange={(event) => setQ(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") applyFilters(1);
              }}
            />
          </div>
          <div className="w-full lg:w-52">
            <label htmlFor="status" className="mb-2 block text-sm font-medium text-slate-700">
              الحالة
            </label>
            <select
              id="status"
              className={inputClassName}
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">الكل</option>
              {ALL_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {STATUS_LABELS[item]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <PrimaryButton type="button" onClick={() => applyFilters(1)}>
              تطبيق
            </PrimaryButton>
            <SecondaryButton
              type="button"
              onClick={() => {
                setQ("");
                setStatus("");
                router.push("/admin");
              }}
            >
              إعادة ضبط
            </SecondaryButton>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-start font-medium">المرجع</th>
                <th className="px-4 py-3 text-start font-medium">الاسم</th>
                <th className="px-4 py-3 text-start font-medium">النوع</th>
                <th className="px-4 py-3 text-start font-medium">الحالة</th>
                <th className="px-4 py-3 text-start font-medium">التاريخ</th>
                <th className="px-4 py-3 text-start font-medium" />
              </tr>
            </thead>
            <tbody>
              {initialData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    لا توجد طلبات مطابقة
                  </td>
                </tr>
              ) : (
                initialData.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-mono text-xs">{row.referenceCode}</td>
                    <td className="px-4 py-3 font-medium">{row.fullName}</td>
                    <td className="px-4 py-3">{row.consultationTypeLabel}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} label={row.statusLabel} />
                    </td>
                    <td className="px-4 py-3 text-slate-500">{row.createdAtLabel}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/consultations/${row.id}`}
                        className="font-medium text-madrak-primary hover:underline"
                      >
                        عرض
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-3">
          <SecondaryButton
            type="button"
            disabled={initialPage <= 1}
            onClick={() => applyFilters(initialPage - 1)}
          >
            السابق
          </SecondaryButton>
          <span className="text-sm text-slate-600">
            صفحة {initialPage} من {totalPages}
          </span>
          <SecondaryButton
            type="button"
            disabled={initialPage >= totalPages}
            onClick={() => applyFilters(initialPage + 1)}
          >
            التالي
          </SecondaryButton>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={clsx(
        "rounded-2xl px-5 py-4 shadow-sm ring-1",
        accent
          ? "bg-madrak-primary text-white ring-madrak-primary/30"
          : "bg-white text-slate-800 ring-slate-100",
      )}
    >
      <p className={clsx("text-sm", accent ? "text-white/80" : "text-slate-500")}>{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
        status === "NEW" && "bg-amber-100 text-amber-800",
        status === "IN_REVIEW" && "bg-blue-100 text-blue-800",
        status === "CONTACTED" && "bg-violet-100 text-violet-800",
        status === "ANSWERED" && "bg-emerald-100 text-emerald-800",
        status === "NEEDS_FOLLOW_UP" && "bg-orange-100 text-orange-800",
        status === "CLOSED" && "bg-slate-200 text-slate-700",
      )}
    >
      {label}
    </span>
  );
}
