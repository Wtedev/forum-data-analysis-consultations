"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { clsx } from "clsx";

import { staffInputClassName, StaffSecondaryButton } from "@/components/consultation/ui";
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
  basePath?: string;
  heading?: string;
  emptyMessage?: string;
};

export function ConsultationsTable({
  initialData,
  initialStats,
  initialQuery,
  initialStatus,
  initialPage,
  totalPages,
  total,
  basePath = "/admin",
  heading,
  emptyMessage = "لا توجد طلبات مطابقة",
}: ConsultationsTableProps) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [status, setStatus] = useState(initialStatus);

  const applyFilters = useCallback(
    (page = 1, next?: { q?: string; status?: string }) => {
      const queryText = (next?.q ?? q).trim();
      const queryStatus = next?.status ?? status;
      const params = new URLSearchParams();
      if (queryText) params.set("q", queryText);
      if (queryStatus) params.set("status", queryStatus);
      if (page > 1) params.set("page", String(page));
      const query = params.toString();
      router.push(query ? `${basePath}?${query}` : basePath);
    },
    [q, status, router, basePath],
  );

  const filtersActive = Boolean(q.trim() || status);
  const openCount = initialStats.total - (initialStats.byStatus.CLOSED ?? 0);

  return (
    <div className="space-y-6">
      {heading ? <h1 className="text-lg font-semibold text-slate-900">{heading}</h1> : null}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="إجمالي الطلبات"
          value={initialStats.total}
          active={!status && !q.trim()}
          onClick={() => {
            setQ("");
            setStatus("");
            router.push(basePath);
          }}
        />
        <StatCard
          label="طلبات جديدة"
          value={initialStats.new}
          accent
          active={status === "NEW"}
          onClick={() => {
            setStatus("NEW");
            applyFilters(1, { status: "NEW" });
          }}
        />
        <StatCard
          label={filtersActive ? "نتائج التصفية" : "طلبات مفتوحة"}
          value={filtersActive ? total : openCount}
        />
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label htmlFor="search" className="mb-2 block text-sm font-semibold text-slate-700">
              بحث
            </label>
            <input
              id="search"
              className={staffInputClassName}
              placeholder="الرقم المرجعي، الاسم، أو الجوال"
              value={q}
              onChange={(event) => setQ(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") applyFilters(1);
              }}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => applyFilters(1)}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#034f52] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#04656a] focus:outline-none focus:ring-[3px] focus:ring-[#034f52]/30 sm:w-auto"
            >
              بحث
            </button>
            {filtersActive ? (
              <StaffSecondaryButton
                type="button"
                onClick={() => {
                  setQ("");
                  setStatus("");
                  router.push(basePath);
                }}
              >
                إعادة ضبط
              </StaffSecondaryButton>
            ) : null}
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold text-slate-700">الحالة</p>
          <div className="flex flex-wrap gap-2">
            <StatusChip
              label="الكل"
              active={!status}
              onClick={() => {
                setStatus("");
                applyFilters(1, { status: "" });
              }}
            />
            {ALL_STATUSES.map((item) => (
              <StatusChip
                key={item}
                label={STATUS_LABELS[item]}
                count={initialStats.byStatus[item] ?? 0}
                active={status === item}
                onClick={() => {
                  setStatus(item);
                  applyFilters(1, { status: item });
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-slate-800">
              <tr>
                <th className="px-4 py-3 text-start font-medium">المرجع</th>
                <th className="px-4 py-3 text-start font-medium">الاسم</th>
                <th className="px-4 py-3 text-start font-medium">النوع</th>
                <th className="px-4 py-3 text-start font-medium">المستشار</th>
                <th className="px-4 py-3 text-start font-medium">الحالة</th>
                <th className="px-4 py-3 text-start font-medium">التاريخ</th>
                <th className="px-4 py-3 text-start font-medium" />
              </tr>
            </thead>
            <tbody>
              {initialData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center font-medium text-slate-700">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                initialData.map((row) => (
                  <tr key={row.id} className="border-t border-slate-200 transition hover:bg-slate-50">
                    <td className="px-4 py-3 text-xs font-semibold text-slate-800">{row.referenceCode}</td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-950">{row.fullName}</p>
                      <p className="mt-0.5 text-xs font-medium text-slate-700" dir="ltr">
                        {row.phone}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{row.consultationTypeLabel}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{row.preferredConsultantLabel}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} label={row.statusLabel} />
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{row.createdAtLabel}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`${basePath}/consultations/${row.id}`}
                        className="inline-flex rounded-lg bg-[#034f52] px-3 py-1.5 text-sm font-bold text-white transition hover:bg-[#04656a]"
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
          <StaffSecondaryButton
            type="button"
            disabled={initialPage <= 1}
            onClick={() => applyFilters(initialPage - 1)}
          >
            السابق
          </StaffSecondaryButton>
          <span className="text-sm text-slate-600">
            صفحة {initialPage} من {totalPages}
          </span>
          <StaffSecondaryButton
            type="button"
            disabled={initialPage >= totalPages}
            onClick={() => applyFilters(initialPage + 1)}
          >
            التالي
          </StaffSecondaryButton>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
  active,
  onClick,
}: {
  label: string;
  value: number;
  accent?: boolean;
  active?: boolean;
  onClick?: () => void;
}) {
  const className = clsx(
    "rounded-2xl px-5 py-4 text-start shadow-sm ring-1 transition",
    accent
      ? "bg-[#034f52] text-white ring-[#034f52]"
      : "bg-white text-slate-950 ring-slate-300",
    onClick && "hover:brightness-95",
    active && "ring-2 ring-[#034f52]",
  );
  const body = (
    <>
      <p className={clsx("text-sm font-semibold", accent ? "text-[#d8f4ef]" : "text-slate-700")}>{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </>
  );

  if (!onClick) {
    return <div className={className}>{body}</div>;
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {body}
    </button>
  );
}

function StatusChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        "inline-flex min-h-10 items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold transition",
        active
          ? "bg-[#034f52] text-white"
          : "border border-slate-400 bg-white text-slate-900 hover:border-[#034f52] hover:bg-slate-50",
      )}
    >
      {label}
      {typeof count === "number" ? (
        <span className={clsx("text-xs font-bold", active ? "text-[#d8f4ef]" : "text-slate-700")}>{count}</span>
      ) : null}
    </button>
  );
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-bold",
        status === "NEW" && "bg-amber-200 text-amber-950",
        status === "IN_REVIEW" && "bg-blue-200 text-blue-950",
        status === "CONTACTED" && "bg-violet-200 text-violet-950",
        status === "ANSWERED" && "bg-emerald-200 text-emerald-950",
        status === "NEEDS_FOLLOW_UP" && "bg-orange-200 text-orange-950",
        status === "CLOSED" && "bg-slate-300 text-slate-950",
      )}
    >
      {label}
    </span>
  );
}
