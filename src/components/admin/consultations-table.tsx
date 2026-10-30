"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  Check,
  CircleHelp,
  ClipboardList,
  Compass,
  Eraser,
  Eye,
  Inbox,
  LayoutDashboard,
  MessageSquareText,
  UserCheck,
  UserRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { clsx } from "clsx";

import { ClaimConsultationButton } from "@/components/admin/claim-consultation-button";
import { WhatsAppIcon, WhatsAppLink } from "@/components/admin/whatsapp-link";
import { staffInputClassName, StaffSecondaryButton } from "@/components/consultation/ui";
import { ALL_STATUSES, STATUS_LABELS } from "@/lib/admin-labels";
import type { ConsultationListItem } from "@/lib/admin-serialize";
import { consultationWhatsappMessage, whatsappUrl } from "@/lib/phone";

type Stats = {
  total: number;
  new: number;
  mine?: number;
  unassigned?: number;
  byStatus: Record<string, number>;
  segments?: {
    mine: number;
    assigned: number;
    unassigned: number;
    new: number;
    ongoing: number;
    closed: number;
  };
};

type ConsultationsTableProps = {
  initialData: ConsultationListItem[];
  initialStats: Stats;
  initialQuery: string;
  initialStatus: string;
  initialScope?: "" | "mine" | "assigned" | "unassigned";
  initialStage?: "" | "new" | "ongoing" | "closed";
  initialPage: number;
  totalPages: number;
  total: number;
  basePath?: string;
  heading?: string;
  emptyMessage?: string;
  canClaim?: boolean;
  showSearchButton?: boolean;
  iconTools?: boolean;
  desk?: "consultant" | "admin";
  assignees?: { id: string; name: string }[];
};

export function ConsultationsTable({
  initialData,
  initialStats,
  initialQuery,
  initialStatus,
  initialScope = "",
  initialStage = "",
  initialPage,
  totalPages,
  total,
  basePath = "/admin",
  heading,
  emptyMessage = "لا توجد طلبات مطابقة",
  canClaim = false,
  showSearchButton = true,
  iconTools = false,
  desk = "consultant",
  assignees = [],
}: ConsultationsTableProps) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [status, setStatus] = useState(initialStatus);
  const [scope, setScope] = useState(initialScope);
  const [stage, setStage] = useState(initialStage);
  const [searchOpen, setSearchOpen] = useState(Boolean(initialQuery));
  const [filtersOpen, setFiltersOpen] = useState(Boolean(initialStatus));
  const filterMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQ(initialQuery);
    setStatus(initialStatus);
    setScope(initialScope);
    setStage(initialStage);
  }, [initialQuery, initialStatus, initialScope, initialStage]);

  useEffect(() => {
    if (!filtersOpen) return;
    function onPointer(event: MouseEvent) {
      if (filterMenuRef.current?.contains(event.target as Node)) return;
      event.preventDefault();
      setFiltersOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setFiltersOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [filtersOpen]);

  const applyFilters = useCallback(
    (page = 1, next?: { q?: string; status?: string; scope?: string; stage?: string }) => {
      const queryText = (next?.q ?? q).trim();
      const queryStatus = next?.status ?? status;
      const queryScope = next?.scope ?? scope;
      const queryStage = next?.stage ?? stage;
      const params = new URLSearchParams();
      if (queryText) params.set("q", queryText);
      if (queryStatus) params.set("status", queryStatus);
      if (queryScope) params.set("scope", queryScope);
      if (queryStage) params.set("stage", queryStage);
      if (page > 1) params.set("page", String(page));
      const query = params.toString();
      router.push(query ? `${basePath}?${query}` : basePath);
    },
    [q, status, scope, stage, router, basePath],
  );

  const avatarTones = avatarTonesFor(initialData.map((item) => item.id));
  const filtersActive = Boolean(q.trim() || status);
  const closedCount = initialStats.byStatus.CLOSED ?? 0;
  const openCount = initialStats.total - closedCount;
  const ongoingCount = Math.max(0, initialStats.total - initialStats.new - closedCount);

  return (
    <div className={iconTools ? "space-y-5" : "space-y-6"}>
      {iconTools ? (
        <div className="grid grid-cols-3 items-stretch gap-2.5 sm:gap-3">
          <DeskStat value={initialStats.new} lines={["استشارات", "جديدة"]} />
          <DeskStat value={ongoingCount} lines={["استشارات", "جارية"]} />
          <DeskStat value={closedCount} lines={["استشارات", "مغلقة"]} />
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

      {heading && !iconTools ? (
        <h1 className="min-w-0 text-lg font-semibold text-[#1c1c1c]">{heading}</h1>
      ) : null}

      {!iconTools ? (
        <div className={iconTools
          ? "rounded-2xl bg-white p-4 shadow-[0_6px_18px_rgba(62,76,134,0.06)] ring-1 ring-[#eef0f6]"
          : "rounded-3xl border border-[#eceef2] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-5"}>
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
        {initialData.length === 0 && !iconTools ? (
          <div className="rounded-3xl border border-[#eceef2] bg-white px-4 py-8 text-center text-sm font-medium leading-7 text-[#9ca3af]">
            {emptyMessage}
          </div>
        ) : iconTools ? (
          <div className="rounded-2xl bg-white shadow-[0_6px_18px_rgba(62,76,134,0.06)] ring-1 ring-[#eef0f6]">
            <div className="border-b border-[#eef0f6] px-3.5 py-3">
              <div className="flex items-center justify-between gap-3">
                <h1 className="min-w-0 text-lg font-bold leading-none text-[#3e4c86]">{heading}</h1>
                <div ref={filterMenuRef} className="relative flex shrink-0 items-center gap-1">
                  <ToolIconButton
                    label="بحث"
                    pressed={searchOpen}
                    marked={Boolean(q.trim())}
                    plain
                    onClick={() => setSearchOpen((open) => !open)}
                  >
                    <SearchIcon />
                  </ToolIconButton>
                  <ToolIconButton
                    label="تصفية"
                    pressed={filtersOpen}
                    marked={Boolean(scope || stage || status)}
                    plain
                    onClick={() => setFiltersOpen((open) => !open)}
                  >
                    <FilterIcon />
                  </ToolIconButton>
                  {filtersOpen ? (
                    <ConsultantFilterMenu
                      scope={scope}
                      stage={stage}
                      counts={initialStats.segments}
                      assignment={desk === "admin"
                        ? [
                            { id: "assigned", label: "مسندة", count: initialStats.segments?.assigned },
                            { id: "unassigned", label: "غير مسندة", count: initialStats.segments?.unassigned },
                          ]
                        : [
                            { id: "mine", label: "استشاراتي", count: initialStats.segments?.mine },
                            { id: "unassigned", label: "استشارات غير مسندة", count: initialStats.segments?.unassigned },
                          ]}
                      onScope={(id) => {
                        const next = scope === id ? "" : id;
                        setScope(next as "" | "mine" | "assigned" | "unassigned");
                        applyFilters(1, { scope: next });
                      }}
                      onStage={(id) => {
                        const next = stage === id ? "" : id;
                        setStage(next as "" | "new" | "ongoing" | "closed");
                        applyFilters(1, { stage: next });
                      }}
                      onClear={() => {
                        setScope("");
                        setStage("");
                        applyFilters(1, { scope: "", stage: "" });
                      }}
                    />
                  ) : null}
                </div>
              </div>
              {searchOpen ? (
                <div className="mt-3">
                  <label htmlFor="desk-search" className="sr-only">بحث</label>
                  <input
                    id="desk-search"
                    className={staffInputClassName}
                    placeholder="الرقم المرجعي، الاسم، أو الجوال"
                    value={q}
                    onChange={(event) => setQ(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") applyFilters(1);
                    }}
                  />
                </div>
              ) : null}
            </div>
            {initialData.length === 0 ? (
              <p className="overflow-hidden rounded-b-2xl px-4 py-8 text-center text-sm font-medium leading-7 text-[#8b93ab]">
                {q.trim() || status || scope || stage ? "لا توجد استشارات مطابقة." : emptyMessage}
              </p>
            ) : (
              <div className="divide-y divide-[#eef0f6] rounded-b-2xl">
                {initialData.map((row) => (
                  <ConsultantRequestCard
                    key={row.id}
                    row={row}
                    basePath={basePath}
                    canClaim={canClaim}
                    contact={desk === "admin" ? "always" : "assigned"}
                    assignees={desk === "admin" ? assignees : []}
                    tone={avatarTones.get(row.id) ?? AVATAR_TONES[0]}
                  />
                ))}
              </div>
            )}
          </div>
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

      {iconTools ? null : <div className="hidden overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-[#e6e8ec] md:block">
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
      </div>}

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

const AVATAR_TONES = [
  "bg-[#eef1fb] text-[#3e4c86]",
  "bg-[#eef8f3] text-[#1b7a4e]",
  "bg-[#fff4e8] text-[#c26a12]",
  "bg-[#f3eefe] text-[#6b3bb8]",
  "bg-[#e8f6fb] text-[#0c7490]",
  "bg-[#fdecef] text-[#c23b55]",
  "bg-[#eef4ff] text-[#2f5fd0]",
  "bg-[#f7f1e6] text-[#8d6824]",
  "bg-[#eefaf4] text-[#0f766e]",
  "bg-[#f8eef6] text-[#a33d78]",
] as const;

function avatarTonesFor(ids: string[]) {
  const used = new Set<number>();
  const tones = new Map<string, string>();
  for (const id of ids) {
    let hash = 0;
    for (let index = 0; index < id.length; index += 1) {
      hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
    }
    let slot = hash % AVATAR_TONES.length;
    if (used.size < AVATAR_TONES.length) {
      while (used.has(slot)) slot = (slot + 1) % AVATAR_TONES.length;
    }
    used.add(slot);
    tones.set(id, AVATAR_TONES[slot]);
  }
  return tones;
}

function consultationTypeIcon(label: string): LucideIcon {
  switch (label) {
    case "التحليل الإحصائي":
      return BarChart3;
    case "تنظيف البيانات وتجهيزها":
      return Eraser;
    case "لوحات المعلومات والتقارير":
      return LayoutDashboard;
    case "تصميم الاستبانات":
      return ClipboardList;
    case "اختيار الأداة المناسبة":
      return Wrench;
    case "تفسير النتائج":
      return MessageSquareText;
    case "منهجية المشروع وتحديد المشكلة":
      return Compass;
    default:
      return CircleHelp;
  }
}

function routingMeta(row: ConsultationListItem): { icon: LucideIcon; value: string } {
  if (row.assignedTo) return { icon: UserCheck, value: `موجّهة إلى ${row.assignedTo.name}` };
  if (row.preferredConsultantId === "NO_PREFERENCE") return { icon: Inbox, value: "تحتاج مستشار" };
  return { icon: UserRound, value: `موجّهة إلى ${row.preferredConsultantLabel}` };
}

function compactDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("ar-SA", { day: "numeric", month: "short" }).format(date);
}

function ConsultantRequestCard({
  row,
  basePath,
  canClaim,
  contact = "assigned",
  assignees = [],
  tone,
}: {
  row: ConsultationListItem;
  basePath: string;
  canClaim: boolean;
  contact?: "assigned" | "always";
  assignees?: { id: string; name: string }[];
  tone: string;
}) {
  const collected = contact === "always" ? Boolean(row.phone) : Boolean(row.assignedTo && row.phone);
  const canTake = canClaim && row.preferredConsultantId === "NO_PREFERENCE" && !row.assignedTo;
  const closed = row.status === "CLOSED";
  const TypeIcon = consultationTypeIcon(row.consultationTypeLabel);
  const routing = routingMeta(row);
  const RoutingIcon = routing.icon;
  const teamName = row.projectOrTeamName?.trim() || row.fullName;
  const quiet = closed ? "text-[#a8b0c2]" : "text-[#8b93ab]";
  const [assignOpen, setAssignOpen] = useState(false);

  return (
    <article
      className={clsx(
        "min-w-0 px-3.5 py-3.5 transition last:rounded-b-2xl",
        assignOpen && "relative z-30",
        closed ? "bg-[#f7f8fb]" : "hover:bg-[#fafbfe]",
      )}
    >
      <Link href={`${basePath}/consultations/${row.id}`} className="block min-w-0 text-start">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className={clsx("inline-flex items-center gap-1 text-[10px] font-light leading-4", quiet)}>
              <CalendarDays className="h-3 w-3 shrink-0" aria-hidden />
              {compactDate(row.createdAt)}
            </span>
            <span className={clsx("inline-flex min-w-0 items-center gap-1 text-[10px] font-light leading-4", quiet)}>
              <RoutingIcon className="h-3 w-3 shrink-0" aria-hidden />
              <span className="truncate">{routing.value}</span>
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {row.status === "NEW" ? (
              <span className="inline-flex rounded-full bg-[#e8f8ee] px-1.5 py-0.5 text-[10px] font-medium leading-4 text-[#1b8a4b]">
                {row.statusLabel}
              </span>
            ) : null}
            <span dir="ltr" className={clsx("text-[10px] font-light leading-4 tracking-wide", quiet)}>
              {row.referenceCode}
            </span>
          </div>
        </div>
      </Link>
      <div className="mt-2.5 flex items-start gap-3">
        <Link href={`${basePath}/consultations/${row.id}`} className="flex min-w-0 flex-1 items-start gap-3 text-start">
          <span
            className={clsx(
              "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
              tone,
            )}
          >
            <TypeIcon className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className={clsx("truncate text-[15px] font-semibold leading-6", closed ? "text-[#8b93ab]" : "text-[#3e4c86]")} title={teamName}>
              {teamName}
            </p>
            <p className={clsx("mt-0.5 line-clamp-2 text-[11px] font-normal leading-5", quiet)} title={row.question}>
              {row.question}
            </p>
          </div>
        </Link>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="flex items-center gap-2">
          {canTake ? <ClaimConsultationButton consultationId={row.id} variant="bar" size="sm" /> : null}
          {collected ? (
            <a
              href={whatsappUrl(
                row.phone,
                consultationWhatsappMessage({
                  fullName: row.fullName,
                  consultantName: row.assignedTo?.name ?? "",
                  referenceCode: row.referenceCode,
                  question: row.question,
                  link: row.link,
                }),
              )}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="تواصل واتساب"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#d7eadf] bg-[#f3faf6] text-[#1f7a4d] transition hover:bg-[#e7f6ee]"
            >
              <WhatsAppIcon className="h-4 w-4" />
            </a>
          ) : null}
          <Link
            href={`${basePath}/consultations/${row.id}`}
            aria-label="اطلع على التفاصيل"
            className={clsx(
              "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition",
              closed
                ? "border-[#e4e7ee] bg-[#f4f5f8] text-[#8b93ab] hover:bg-[#eef0f4]"
                : "border-[#e3e7f4] bg-[#f4f6fb] text-[#3e4c86] hover:bg-[#eef1fb]",
            )}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </Link>
          </div>
          {!row.assignedTo && assignees.length > 0 ? (
            <AssignConsultationControl
              consultationId={row.id}
              assignees={assignees}
              onOpenChange={setAssignOpen}
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}

function AssignConsultationControl({
  consultationId,
  assignees,
  onOpenChange,
}: {
  consultationId: string;
  assignees: { id: string; name: string }[];
  onOpenChange?: (open: boolean) => void;
}) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ sent: boolean; message: string } | null>(null);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
      setPendingId(null);
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

  async function assign(nextId: string) {
    if (!nextId) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/consultations/${consultationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedToId: nextId }),
      });
      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
        emailNotice?: { sent: boolean; message: string };
      };
      if (!response.ok || !result.success) {
        setError(result.message ?? "تعذر الإسناد");
        return;
      }
      setPendingId(null);
      if (result.emailNotice) setNotice(result.emailNotice);
      router.refresh();
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => {
          setOpen((value) => !value);
          setPendingId(null);
        }}
        className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#e3e7f4] bg-[#f4f6fb] px-2.5 text-[12px] font-semibold text-[#3e4c86] transition hover:bg-[#eef1fb]"
      >
        إسناد
        <svg viewBox="0 0 12 12" aria-hidden="true" className={clsx("h-2.5 w-2.5 transition", open && "rotate-180")}>
          <path d="M2.2 4.2 6 8.6 9.8 4.2Z" fill="currentColor" />
        </svg>
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-label="المستشارون"
          className="absolute end-0 top-full z-30 mt-1.5 w-48 overflow-hidden rounded-xl bg-white py-1 text-start shadow-[0_12px_32px_rgba(62,76,134,0.14)] ring-1 ring-[#eef0f6]"
        >
          {assignees.map((assignee) => {
            const pending = pendingId === assignee.id;
            return (
              <li key={assignee.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={pending}
                  disabled={saving}
                  onClick={() => {
                    if (pending) {
                      void assign(assignee.id);
                      return;
                    }
                    setPendingId(assignee.id);
                  }}
                  className={clsx(
                    "flex w-full items-center gap-2 px-3 py-2 text-start text-[13px] font-semibold transition disabled:opacity-40",
                    pending ? "bg-[#f3faf6] text-[#1f7a4d]" : "text-[#3e4c86] hover:bg-[#f7f8fb]",
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">
                    {saving && pending ? "جاري الإسناد..." : assignee.name}
                  </span>
                  {pending && !saving ? (
                    <span className="shrink-0 text-[11px] font-medium">تأكيد</span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
      {error ? <p className="mt-1.5 text-end text-[11px] font-medium text-[#b42318]">{error}</p> : null}
      {notice ? (
        <p className={clsx("mt-1.5 max-w-44 text-end text-[11px] font-medium", notice.sent ? "text-[#067647]" : "text-[#b42318]")}>
          {notice.message}
        </p>
      ) : null}
    </div>
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
        <WhatsAppLink
          href={whatsappUrl(
            row.phone,
            consultationWhatsappMessage({
              fullName: row.fullName,
              consultantName: row.assignedTo?.name ?? "",
              referenceCode: row.referenceCode,
              question: row.question,
              link: row.link,
            }),
          )}
          label={whatsAppLabel}
        />
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

function DeskStat({ value, lines }: { value: number; lines: string[] }) {
  return (
    <div className="flex h-full min-h-[96px] min-w-0 flex-col items-start justify-center gap-2 rounded-2xl bg-white px-3 py-3 text-right shadow-[0_6px_18px_rgba(62,76,134,0.06)] ring-1 ring-[#eef0f6]">
      <p className="flex h-8 flex-col items-start justify-center text-[11px] font-medium leading-4 text-[#8b93ab] sm:text-xs">
        {lines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </p>
      <p className="text-[1.65rem] font-bold leading-none tabular-nums text-[#3e4c86]">{value}</p>
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
  plain = false,
  onClick,
  children,
}: {
  label: string;
  pressed: boolean;
  marked: boolean;
  plain?: boolean;
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
        "relative inline-flex items-center justify-center transition",
        plain ? "h-8 w-8 rounded-lg" : "h-11 w-11 rounded-xl shadow-[0_6px_18px_rgba(62,76,134,0.06)] ring-1",
        pressed
          ? plain
            ? "bg-[#f4f6fb] text-[#3e4c86]"
            : "bg-[#f4f5f8] text-[#3e4c86] ring-[#e4e7f0]"
          : plain
            ? "text-[#6d7588] hover:bg-[#f4f6fb] hover:text-[#3e4c86]"
            : "bg-white text-[#6d7588] ring-[#eef0f6] hover:bg-[#f7f8fb]",
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

function ConsultantFilterMenu({
  scope,
  stage,
  counts,
  assignment,
  onScope,
  onStage,
  onClear,
}: {
  scope: string;
  stage: string;
  counts?: Stats["segments"];
  assignment: { id: string; label: string; count?: number }[];
  onScope: (id: string) => void;
  onStage: (id: string) => void;
  onClear: () => void;
}) {
  const stages = [
    { id: "new", label: "جديد", count: counts?.new },
    { id: "ongoing", label: "جاري", count: counts?.ongoing },
    { id: "closed", label: "مغلق", count: counts?.closed },
  ];

  return (
    <div
      role="menu"
      aria-label="تصفية الاستشارات"
      className="absolute top-full left-0 z-30 mt-2 w-56 overflow-hidden rounded-xl bg-white py-1 text-start shadow-[0_12px_32px_rgba(62,76,134,0.14)] ring-1 ring-[#eef0f6]"
    >
      <p className="px-3 pt-2 pb-1 text-[11px] font-medium text-[#8b93ab]">الإسناد</p>
      {assignment.map((option) => (
        <FilterMenuItem
          key={option.id}
          label={option.label}
          count={option.count}
          active={scope === option.id}
          onClick={() => onScope(option.id)}
        />
      ))}
      <div className="my-1 h-px bg-[#eef0f6]" />
      <p className="px-3 pt-1 pb-1 text-[11px] font-medium text-[#8b93ab]">الحالة</p>
      {stages.map((option) => (
        <FilterMenuItem
          key={option.id}
          label={option.label}
          count={option.count}
          active={stage === option.id}
          onClick={() => onStage(option.id)}
        />
      ))}
      {scope || stage ? (
        <>
          <div className="my-1 h-px bg-[#eef0f6]" />
          <button
            type="button"
            onClick={onClear}
            className="flex w-full items-center px-3 py-2 text-start text-[12px] font-semibold text-[#6d7588] transition hover:bg-[#f7f8fb]"
          >
            مسح التصفية
          </button>
        </>
      ) : null}
    </div>
  );
}

function FilterMenuItem({
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
      role="menuitemcheckbox"
      aria-checked={active}
      onClick={onClick}
      className={clsx(
        "flex w-full items-center gap-2 px-3 py-2 text-start text-[13px] font-semibold transition",
        active ? "bg-[#f4f6fb] text-[#3e4c86]" : "text-[#3e4c86] hover:bg-[#f7f8fb]",
      )}
    >
      <span className="min-w-0 flex-1">
        {label}
        {typeof count === "number" ? <span className="ms-1.5 text-[11px] font-medium tabular-nums text-[#a8b0c2]">{count}</span> : null}
      </span>
      <Check className={clsx("h-3.5 w-3.5 shrink-0", active ? "text-[#1b8a4b]" : "invisible")} aria-hidden />
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
