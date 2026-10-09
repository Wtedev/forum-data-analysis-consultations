"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { clsx } from "clsx";

import { staffInputClassName } from "@/components/consultation/ui";
import { whatsappUrl } from "@/lib/phone";
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
    <div>
      {heading ? (
        <h1 className="text-[2rem] font-bold tracking-tight text-[#161616] sm:text-[2.5rem]">
          {heading}
        </h1>
      ) : null}

      <p className="mb-3 mt-8 text-[11px] font-semibold tracking-wide text-[#9a9a9a]">تصفية سريعة</p>
      <div className="grid gap-3 sm:grid-cols-3" dir="ltr">
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
          label={filtersActive ? "نتائج التصفية" : "طلبات مفتوحة"}
          value={filtersActive ? total : openCount}
          tone="fresh"
        />
      </div>

      <p className="mb-3 mt-8 text-[11px] font-semibold tracking-wide text-[#9a9a9a]">التصفية</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          id="search"
          aria-label="بحث"
          className={clsx(staffInputClassName, "bg-white sm:max-w-md")}
          placeholder="الرقم المرجعي، الاسم، أو الجوال"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") applyFilters(1);
          }}
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => applyFilters(1)}
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#1c1c1c] ring-1 ring-[#e4e4e2] transition hover:bg-[#f3f3f1]"
          >
            بحث
          </button>
          {filtersActive ? (
            <button
              type="button"
              onClick={() => {
                setQ("");
                setStatus("");
                router.push(basePath);
              }}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-[#3d3d3d] transition hover:bg-white"
            >
              إعادة ضبط
            </button>
          ) : null}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
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

      <div className="mt-8 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-[11px] font-semibold tracking-wide text-[#9a9a9a]">
              <th className="px-3 py-3 text-start font-semibold">المرجع</th>
              <th className="px-3 py-3 text-start font-semibold">الاسم</th>
              <th className="px-3 py-3 text-start font-semibold">النوع</th>
              <th className="px-3 py-3 text-start font-semibold">المستشار</th>
              <th className="px-3 py-3 text-start font-semibold">الحالة</th>
              <th className="px-3 py-3 text-start font-semibold">التاريخ</th>
              <th className="px-3 py-3 text-start font-semibold" />
            </tr>
          </thead>
          <tbody>
            {initialData.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-10 text-center text-[#5c5c5c]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              initialData.map((row) => (
                <tr key={row.id} className="border-t border-[#ececec]">
                  <td className="px-3 py-4 text-xs font-medium text-[#5c5c5c]">{row.referenceCode}</td>
                  <td className="px-3 py-4">
                    <Link
                      href={`${basePath}/consultations/${row.id}`}
                      className="font-semibold text-[#1c1c1c] hover:underline"
                    >
                      {row.fullName}
                    </Link>
                  </td>
                  <td className="px-3 py-4 text-[#3d3d3d]">{row.consultationTypeLabel}</td>
                  <td className="px-3 py-4 text-[#3d3d3d]">{row.preferredConsultantLabel}</td>
                  <td className="px-3 py-4">
                    <StatusBadge status={row.status} label={row.statusLabel} />
                  </td>
                  <td className="px-3 py-4 text-[#5c5c5c]">{row.createdAtLabel}</td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-3">
                      <a
                        href={whatsappUrl(row.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#e7f6ec] px-3 py-1 text-sm font-medium text-[#157a43] transition hover:bg-[#d7f0e1]"
                      >
                        <WhatsAppIcon />
                        واتساب
                      </a>
                      <Link
                        href={`${basePath}/consultations/${row.id}`}
                        className="text-sm font-medium text-[#1c1c1c] underline-offset-4 hover:underline"
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

      {totalPages > 1 ? (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={initialPage <= 1}
            onClick={() => applyFilters(initialPage - 1)}
            className="rounded-lg px-3 py-2 text-sm font-medium text-[#1c1c1c] hover:bg-white disabled:opacity-35"
          >
            السابق
          </button>
          <span className="text-sm text-[#5c5c5c]">
            صفحة {initialPage} من {totalPages}
          </span>
          <button
            type="button"
            disabled={initialPage >= totalPages}
            onClick={() => applyFilters(initialPage + 1)}
            className="rounded-lg px-3 py-2 text-sm font-medium text-[#1c1c1c] hover:bg-white disabled:opacity-35"
          >
            التالي
          </button>
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
    "rounded-2xl px-5 py-4 text-start transition",
    tone === "warm" && "bg-[#fff4dc]",
    tone === "neutral" && "bg-[#f1f1ef]",
    tone === "fresh" && "bg-[#e7f6ec]",
    onClick && "hover:brightness-[0.98]",
    active && "ring-2 ring-black/10",
  );
  const labelClass = clsx(
    "text-sm font-medium",
    tone === "warm" && "text-[#a16207]",
    tone === "neutral" && "text-[#5c5c5c]",
    tone === "fresh" && "text-[#157a43]",
  );
  const body = (
    <>
      <p className="text-4xl font-semibold tracking-tight text-[#161616]">
        {String(value).padStart(2, "0")}
      </p>
      <p className={clsx("mt-1", labelClass)}>{label}</p>
    </>
  );

  if (!onClick) {
    return (
      <div className={className} dir="rtl">
        {body}
      </div>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className} dir="rtl">
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
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm transition",
        active ? "bg-[#ececea] font-semibold text-[#1c1c1c]" : "text-[#5c5c5c] hover:bg-white",
      )}
    >
      {label}
      {typeof count === "number" ? <span className="text-xs">{count}</span> : null}
    </button>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M20.5 3.5A11 11 0 0 0 2.1 17.2L1 23l5.9-1.1A11 11 0 0 0 20.5 3.5Zm-8.5 17a9.1 9.1 0 0 1-4.6-1.3l-.3-.2-3.5.7.7-3.4-.2-.3A9.1 9.1 0 1 1 12 20.5Zm5-6.8c-.3-.1-1.6-.8-1.8-.9s-.4-.1-.6.1-.7.9-.8 1-.3.2-.6.1a7.4 7.4 0 0 1-2.2-1.4 8.2 8.2 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.6l.4-.5.2-.3a.5.5 0 0 0 0-.5c0-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 12 12 0 0 0 4.5 4 15 15 0 0 0 1.5.6 3.6 3.6 0 0 0 1.7.1 2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .2-1.2c-.1-.1-.3-.2-.6-.3Z" />
    </svg>
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
        status === "CLOSED" && "bg-[#f1f1ef] text-[#5c5c5c]",
      )}
    >
      {label}
    </span>
  );
}
