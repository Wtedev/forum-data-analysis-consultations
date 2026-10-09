"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState, type ReactNode } from "react";
import { ArrowLeft, Eye, Phone } from "lucide-react";
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
  mine?: number;
  unassigned?: number;
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
  showSearchButton?: boolean;
  iconTools?: boolean;
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
  showSearchButton = true,
  iconTools = false,
}: ConsultationsTableProps) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [status, setStatus] = useState(initialStatus);
  const [searchOpen, setSearchOpen] = useState(Boolean(initialQuery));
  const [filtersOpen, setFiltersOpen] = useState(Boolean(initialStatus));

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
      {iconTools ? (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <DeskStat label="جميع الاستشارات" value={initialStats.total} />
          <DeskStat label="استشاراتي" value={initialStats.mine ?? 0} />
          <DeskStat label="الاستشارات غير المسندة" value={initialStats.unassigned ?? 0} />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
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
      )}

      {heading || iconTools ? (
        <div className="flex items-center justify-between gap-3">
          {heading ? (
            <h1 className={iconTools ? "min-w-0 text-2xl font-bold text-[#3e4c86]" : "min-w-0 text-lg font-semibold text-[#1c1c1c]"}>
              {heading}
            </h1>
          ) : (
            <span />
          )}
          {iconTools ? (
            <div className="flex items-center gap-2">
              <ToolIconButton
                label="بحث"
                pressed={searchOpen}
                marked={Boolean(q.trim())}
                onClick={() => setSearchOpen((open) => !open)}
              >
                <SearchIcon />
              </ToolIconButton>
              <ToolIconButton
                label="تصفية"
                pressed={filtersOpen}
                marked={Boolean(status)}
                onClick={() => setFiltersOpen((open) => !open)}
              >
                <FilterIcon />
              </ToolIconButton>
            </div>
          ) : null}
        </div>
      ) : null}

      {!iconTools || searchOpen || filtersOpen ? (
        <div className="rounded-3xl border border-[#eceef2] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-5">
          {!iconTools || searchOpen ? (
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
                {showSearchButton ? null : (
                  <p className="mt-2 text-xs font-medium text-[#6b7280]">اكتب ثم اضغط إدخال للبحث.</p>
                )}
              </div>
              {showSearchButton || filtersActive ? (
                <div className="flex gap-2">
                  {showSearchButton ? (
                    <button
                      type="button"
                      onClick={() => applyFilters(1)}
                      className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#157a43] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#126838] sm:w-auto"
                    >
                      بحث
                    </button>
                  ) : null}
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
              ) : null}
            </div>
          ) : null}

          {!iconTools || filtersOpen ? (
            <div className={clsx((!iconTools || searchOpen) && "mt-4")}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[#374151]">الحالة</p>
                {iconTools && filtersActive ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQ("");
                      setStatus("");
                      router.push(basePath);
                    }}
                    className="text-sm font-semibold text-[#374151] underline"
                  >
                    إعادة ضبط
                  </button>
                ) : null}
              </div>
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
          ) : null}
        </div>
      ) : null}

      <div className={iconTools ? "space-y-3" : "space-y-3 md:hidden"}>
        {initialData.length === 0 ? (
          <div className="rounded-3xl border border-[#eceef2] bg-white px-4 py-8 text-center text-sm font-medium leading-7 text-[#9ca3af]">
            {emptyMessage}
          </div>
        ) : iconTools ? (
          initialData.map((row) => (
            <ConsultantRequestCard key={row.id} row={row} basePath={basePath} canClaim={canClaim} />
          ))
        ) : (
          initialData.map((row) => (
            <article
              key={row.id}
              className="rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-[#e6e8ec]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-[#111827]">{row.fullName}</p>
                  <p className="mt-1 text-xs font-semibold text-[#4b5563]">{row.referenceCode}</p>
                </div>
                <StatusBadge status={row.status} label={row.statusLabel} />
              </div>
              <p className="mt-3 text-sm font-medium text-[#374151]">{row.consultationTypeLabel}</p>
              <p className="mt-1 text-sm text-[#374151]">{row.preferredConsultantLabel}</p>
              {row.assignedTo ? (
                <p className="mt-1 text-xs font-medium text-[#6b7280]">مُسند إلى {row.assignedTo.name}</p>
              ) : row.preferredConsultantId === "NO_PREFERENCE" ? (
                <p className="mt-1 text-xs font-medium text-[#6b7280]">
                  {canClaim ? "متاحة للأخذ" : "متاح للمستشارين"}
                </p>
              ) : null}
              <p className="mt-1 text-xs font-medium text-[#6b7280]">{row.createdAtLabel}</p>
              <div className="mt-3">
                <ConsultationActions row={row} basePath={basePath} canClaim={canClaim} />
              </div>
            </article>
          ))
        )}
      </div>

      <div className={clsx("hidden overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-[#e6e8ec] md:block", iconTools && "md:hidden")}>
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
                        <p className="mt-1 text-xs font-medium text-[#6b7280]">
                          {canClaim ? "متاحة للأخذ" : "متاح للمستشارين"}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} label={row.statusLabel} />
                    </td>
                    <td className="px-4 py-3 font-medium text-[#6b7280]">{row.createdAtLabel}</td>
                    <td className="px-4 py-3">
                      <ConsultationActions row={row} basePath={basePath} canClaim={canClaim} />
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

function ConsultantRequestCard({
  row,
  basePath,
  canClaim,
}: {
  row: ConsultationListItem;
  basePath: string;
  canClaim: boolean;
}) {
  const collected = Boolean(row.assignedTo);
  const canTake = canClaim && row.preferredConsultantId === "NO_PREFERENCE" && !row.assignedTo;

  return (
    <article className="flex min-w-0 items-center justify-between gap-3 rounded-2xl bg-white px-3 py-3 shadow-[0_8px_24px_rgba(62,76,134,0.06)]">
      <div className="min-w-0 text-start">
        <h2 className="truncate text-base font-bold text-[#3e4c86]" title={row.question}>
          {row.question}
        </h2>
        <p className="mt-0.5 truncate text-sm text-[#8b93ab]">{row.fullName}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {canTake ? <ClaimConsultationButton consultationId={row.id} variant="bar" /> : null}
        {collected && row.phone ? (
          <a
            href={whatsappUrl(row.phone)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="تواصل واتساب"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#3dcb8c] text-white transition hover:bg-[#34b87e]"
          >
            <Phone className="h-5 w-5" aria-hidden />
          </a>
        ) : null}
        <Link
          href={`${basePath}/consultations/${row.id}`}
          aria-label="اطلع على التفاصيل"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#3e4c86] text-white transition hover:bg-[#354272]"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

function ConsultationActions({
  row,
  basePath,
  canClaim,
  showWhatsApp = true,
  whatsAppLabel = "واتساب",
  detailsLabel = "عرض",
}: {
  row: ConsultationListItem;
  basePath: string;
  canClaim: boolean;
  showWhatsApp?: boolean;
  whatsAppLabel?: string;
  detailsLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {showWhatsApp && row.phone ? (
        <WhatsAppLink href={whatsappUrl(row.phone)} label={whatsAppLabel} />
      ) : null}
      {canClaim && row.preferredConsultantId === "NO_PREFERENCE" && !row.assignedTo ? (
        <ClaimConsultationButton consultationId={row.id} />
      ) : null}
      <Link
        href={`${basePath}/consultations/${row.id}`}
        className={clsx(
          "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold transition",
          detailsLabel === "اطلع على التفاصيل"
            ? "rounded-full border border-[#e6e8ec] bg-white text-[#374151] hover:bg-[#f7f8fa]"
            : "rounded-lg bg-[#f3f4f6] text-[#111827] hover:bg-[#e8eaee]",
        )}
      >
        {detailsLabel === "اطلع على التفاصيل" ? <Eye className="h-4 w-4" aria-hidden /> : null}
        {detailsLabel}
      </Link>
    </div>
  );
}

function DeskStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex min-w-0 flex-col items-center rounded-2xl bg-white px-2 py-4 text-center shadow-[0_8px_24px_rgba(62,76,134,0.05)]">
      <p className="text-2xl font-bold text-[#3e4c86]">{value}</p>
      <p className="mt-2 text-[11px] font-medium leading-5 text-[#8b93ab] sm:text-xs">{label}</p>
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
    "min-w-0 rounded-3xl border border-[#eceef2] bg-white px-2.5 py-3 text-start shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition sm:px-5 sm:py-4",
    tone === "warm" && "bg-[#fffaf3]",
    tone === "fresh" && "bg-[#f4fbf7]",
    onClick && "hover:bg-[#fafbfc]",
    active && "border-[#d7f0e2]",
  );
  const labelClass = clsx(
    "break-words text-xs font-medium leading-5 sm:text-sm",
    tone === "warm" && "text-[#b5812c]",
    tone === "neutral" && "text-[#8b909a]",
    tone === "fresh" && "text-[#3d9a62]",
  );
  const body = (
    <>
      <p className={labelClass}>{label}</p>
      <p className="mt-1 text-xl font-bold text-[#111827] sm:text-2xl">{value}</p>
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

function ToolIconButton({
  label,
  pressed,
  marked,
  onClick,
  children,
}: {
  label: string;
  pressed: boolean;
  marked: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={clsx(
        "relative inline-flex h-11 w-11 items-center justify-center rounded-xl border shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition",
        pressed
          ? "border-[#e6e8ec] bg-[#f4f5f7] text-[#1c1c1c]"
          : "border-[#eceef2] bg-white text-[#6b7280] hover:bg-[#f7f8fa]",
      )}
    >
      {children}
      {marked ? <span className="absolute top-1.5 left-1.5 h-2 w-2 rounded-full bg-[#4fd39b]" /> : null}
    </button>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
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
