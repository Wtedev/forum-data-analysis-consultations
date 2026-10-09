"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { clsx } from "clsx";

import { PrimaryButton, staffInputClassName, StaffSecondaryButton } from "@/components/consultation/ui";
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
            <PrimaryButton type="button" onClick={() => applyFilters(1)} className="w-full sm:w-auto">
              بحث
            </PrimaryButton>
            <StaffSecondaryButton
              type="button"
              disabled={!filtersActive && !q && !status}
              onClick={() => {
                setQ("");
                setStatus("");
                router.push(basePath);
              }}
            >
              إعادة ضبط
            </StaffSecondaryButton>
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
            <thead className="bg-slate-50 text-slate-600">
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
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                initialData.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 transition hover:bg-slate-50">
                    <td className="px-4 py-3 text-xs font-medium text-slate-600">{row.referenceCode}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{row.fullName}</p>
                      <p className="mt-0.5 text-xs text-slate-500" dir="ltr">
                        {row.phone}
                      </p>
                    </td>
                    <td className="px-4 py-3">{row.consultationTypeLabel}</td>
                    <td className="px-4 py-3">{row.preferredConsultantLabel}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} label={row.statusLabel} />
                    </td>
                    <td className="px-4 py-3 text-slate-500">{row.createdAtLabel}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`${basePath}/consultations/${row.id}`}
                        className="inline-flex rounded-lg bg-[#056b6f]/10 px-3 py-1.5 text-sm font-semibold text-[#056b6f] transition hover:bg-[#056b6f]/15"
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
      ? "bg-forum-primary text-white ring-forum-primary/30"
      : "bg-white text-slate-800 ring-slate-200",
    onClick && "hover:brightness-[0.98]",
    active && !accent && "ring-2 ring-[#056b6f]",
    active && accent && "ring-2 ring-[#056b6f]",
  );
  const body = (
    <>
      <p className={clsx("text-sm", accent ? "text-white/80" : "text-slate-500")}>{label}</p>
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
          ? "bg-[#056b6f] text-white"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200",
      )}
    >
      {label}
      {typeof count === "number" ? (
        <span className={clsx("text-xs", active ? "text-white/80" : "text-slate-500")}>{count}</span>
      ) : null}
    </button>
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
