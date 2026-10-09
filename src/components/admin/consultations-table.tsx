"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { clsx } from "clsx";

import { ClaimConsultationButton } from "@/components/admin/claim-consultation-button";
import { WhatsAppLink } from "@/components/admin/whatsapp-link";
import { staffInputClassName, StaffSecondaryButton } from "@/components/consultation/ui";
import { ALL_STATUSES, STATUS_LABELS } from "@/lib/admin-labels";
import type { ConsultationListItem } from "@/lib/admin-serialize";
import { whatsappUrl } from "@/lib/phone";

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
  canClaim?: boolean;
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
  canClaim = false,
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
      {heading ? <h1 className="text-lg font-semibold text-[#111827]">{heading}</h1> : null}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="إجمالي الطلبات"
          value={initialStats.total}
          tone="neutral"
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
          tone="warm"
          active={status === "NEW"}
          onClick={() => {
            setStatus("NEW");
            applyFilters(1, { status: "NEW" });
          }}
        />
        <StatCard
          label={filtersActive ? "نتائج التصفية" : "طلبات مفتوحة"}
          value={filtersActive ? total : openCount}
          tone="fresh"
        />
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-[#e6e8ec]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label htmlFor="search" className="mb-2 block text-sm font-semibold text-[#374151]">
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
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#157a43] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#126838] sm:w-auto"
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
          <p className="mb-2 text-sm font-semibold text-[#374151]">الحالة</p>
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

      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-[#e6e8ec]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[#f7f8fa] text-[#6b7280]">
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
                  <td colSpan={7} className="px-4 py-10 text-center font-medium text-[#6b7280]">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                initialData.map((row) => (
                  <tr key={row.id} className="border-t border-[#eef0f3] transition hover:bg-[#f8f9fb]">
                    <td className="px-4 py-3 text-xs font-semibold text-[#4b5563]">{row.referenceCode}</td>
                    <td className="px-4 py-3 font-bold text-[#111827]">{row.fullName}</td>
                    <td className="px-4 py-3 font-medium text-[#374151]">{row.consultationTypeLabel}</td>
                    <td className="px-4 py-3 font-medium text-[#374151]">
                      <p>{row.preferredConsultantLabel}</p>
                      {row.assignedTo ? (
                        <p className="mt-1 text-xs font-medium text-[#6b7280]">مُسند إلى {row.assignedTo.name}</p>
                      ) : row.preferredConsultantId === "NO_PREFERENCE" ? (
                        <p className="mt-1 text-xs font-medium text-[#6b7280]">متاح للمستشارين</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} label={row.statusLabel} />
                    </td>
                    <td className="px-4 py-3 font-medium text-[#6b7280]">{row.createdAtLabel}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <WhatsAppLink href={whatsappUrl(row.phone)} />
                        {canClaim && row.preferredConsultantId === "NO_PREFERENCE" && !row.assignedTo ? (
                          <ClaimConsultationButton consultationId={row.id} />
                        ) : null}
                        <Link
                          href={`${basePath}/consultations/${row.id}`}
                          className="inline-flex rounded-lg bg-[#f3f4f6] px-3 py-1.5 text-sm font-semibold text-[#111827] transition hover:bg-[#e8eaee]"
                        >
                          عرض
                        </Link>
                      </div>
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
          <span className="text-sm text-[#6b7280]">
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
  tone,
  active,
  onClick,
}: {
  label: string;
  value: number;
  tone: "warm" | "neutral" | "fresh";
  active?: boolean;
  onClick?: () => void;
}) {
  const className = clsx(
    "rounded-2xl px-5 py-4 text-start shadow-sm ring-1 ring-transparent transition",
    tone === "warm" && "bg-[#fff4dc]",
    tone === "neutral" && "bg-white ring-[#e6e8ec]",
    tone === "fresh" && "bg-[#e7f6ec]",
    onClick && "hover:brightness-[0.98]",
    active && "ring-2 ring-black/10",
  );
  const labelClass = clsx(
    "text-sm font-medium",
    tone === "warm" && "text-[#a16207]",
    tone === "neutral" && "text-[#6b7280]",
    tone === "fresh" && "text-[#157a43]",
  );
  const body = (
    <>
      <p className={labelClass}>{label}</p>
      <p className="mt-1 text-2xl font-bold text-[#111827]">{value}</p>
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
        active ? "bg-[#e8eaee] text-[#111827]" : "bg-[#f3f4f6] text-[#374151] hover:bg-[#e8eaee]",
      )}
    >
      {label}
      {typeof count === "number" ? <span className="text-xs text-[#6b7280]">{count}</span> : null}
    </button>
  );
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
        status === "NEW" && "bg-[#fff4dc] text-[#a16207]",
        status === "IN_REVIEW" && "bg-[#e8f0ff] text-[#2f62c4]",
        status === "CONTACTED" && "bg-[#f3eaff] text-[#7a45c4]",
        status === "ANSWERED" && "bg-[#e7f6ec] text-[#157a43]",
        status === "NEEDS_FOLLOW_UP" && "bg-[#fff1e4] text-[#c26a12]",
        status === "CLOSED" && "bg-[#f3f4f6] text-[#6b7280]",
      )}
    >
      {label}
    </span>
  );
}
