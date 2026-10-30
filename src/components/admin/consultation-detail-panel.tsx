"use client";

import { ArrowRight, Phone, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ClaimConsultationButton } from "@/components/admin/claim-consultation-button";
import { WhatsAppIcon } from "@/components/admin/whatsapp-link";
import { ALL_PRIORITIES, ALL_STATUSES, PRIORITY_LABELS, STATUS_LABELS } from "@/lib/admin-labels";
import { consultationWhatsappMessage, whatsappUrl } from "@/lib/phone";
import type { ConsultationDetail } from "@/lib/admin-serialize";

type ConsultationDetailPanelProps = {
  initialData: ConsultationDetail;
  mode?: "admin" | "consultant";
  assignees?: { id: string; name: string }[];
  viewerId?: string;
};

export function ConsultationDetailPanel({
  initialData,
  mode = "admin",
  assignees = [],
  viewerId = "",
}: ConsultationDetailPanelProps) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [status, setStatus] = useState(data.status);
  const [priority, setPriority] = useState(data.priority);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [noteSaving, setNoteSaving] = useState(false);
  const [assigneeId, setAssigneeId] = useState(data.assignedTo?.id ?? "");
  const [assigning, setAssigning] = useState(false);
  const [assignNotice, setAssignNotice] = useState<{ sent: boolean; message: string } | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setData(initialData);
    setStatus(initialData.status);
    setPriority(initialData.priority);
    setAssigneeId(initialData.assignedTo?.id ?? "");
  }, [initialData]);

  async function handleUpdate(next?: { status?: ConsultationDetail["status"]; priority?: ConsultationDetail["priority"] }) {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/consultations/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: next?.status ?? status,
          priority: next?.priority ?? priority,
        }),
      });

      const result = (await response.json()) as {
        success: boolean;
        message?: string;
        data?: ConsultationDetail;
      };

      if (!response.ok || !result.success || !result.data) {
        if (next?.status) setStatus(data.status);
        if (next?.priority) setPriority(data.priority);
        setError(result.message ?? "تعذر التحديث");
        return;
      }

      setData(result.data);
      setStatus(result.data.status);
      setPriority(result.data.priority);
      router.refresh();
    } catch {
      if (next?.status) setStatus(data.status);
      if (next?.priority) setPriority(data.priority);
      setError("تعذر الاتصال بالخادم");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddNote(event: React.FormEvent) {
    event.preventDefault();
    if (!note.trim()) return;

    setNoteSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/consultations/${data.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: note.trim() }),
      });

      const result = (await response.json()) as {
        success: boolean;
        message?: string;
        data?: ConsultationDetail;
      };

      if (!response.ok || !result.success || !result.data) {
        setError(result.message ?? "تعذر إضافة الملاحظة");
        return;
      }

      setData(result.data);
      setNote("");
      router.refresh();
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setNoteSaving(false);
    }
  }

  async function handleAssign() {
    if (!assigneeId) return;
    setAssigning(true);
    setError(null);
    setAssignNotice(null);

    try {
      const response = await fetch(`/api/admin/consultations/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedToId: assigneeId }),
      });
      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
        data?: ConsultationDetail;
        emailNotice?: { sent: boolean; message: string };
      };

      if (!response.ok || !result.success || !result.data) {
        setError(result.message ?? "تعذر الإسناد");
        return;
      }

      setData(result.data);
      setAssigneeId(result.data.assignedTo?.id ?? "");
      if (result.emailNotice) setAssignNotice(result.emailNotice);
      router.refresh();
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setAssigning(false);
    }
  }

  async function handleDeleteNote(noteId: string) {
    setDeletingId(noteId);
    setError(null);
    try {
      const response = await fetch(`/api/admin/consultations/${data.id}/notes/${noteId}`, {
        method: "DELETE",
      });
      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
        data?: ConsultationDetail;
      };
      if (!response.ok || !result.success || !result.data) {
        setError(result.message ?? "تعذر حذف التعليق");
        return;
      }
      setData(result.data);
      setPendingDeleteId(null);
      router.refresh();
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setDeletingId(null);
    }
  }

  const claimable = mode === "consultant" && data.preferredConsultantId === "NO_PREFERENCE" && !data.assignedTo;
  const homeHref = mode === "admin" ? "/admin" : "/consultant";
  const canContact = Boolean(data.phone) && (mode === "admin" || data.assignedTo);

  const timeline = [
    ...data.notes.map((item) => ({
      id: `note-${item.id}`,
      noteId: item.id as string | undefined,
      canDelete: mode === "admin" || item.adminUserId === viewerId,
      title: item.adminName,
      detail: item.note,
      at: item.createdAt,
      stamp: item.createdAtLabel as string | undefined,
    })),
    ...data.activityLogs
      .filter(
        (item) =>
          item.description !== "إضافة ملاحظة داخلية" && !item.description.startsWith("تم إنشاء طلب"),
      )
      .map((item) => ({
        id: `log-${item.id}`,
        noteId: undefined as string | undefined,
        canDelete: false,
        title: "تحديث",
        detail: item.description,
        at: item.createdAt,
        stamp: undefined as string | undefined,
      })),
    {
      id: "created",
      noteId: undefined as string | undefined,
      canDelete: false,
      title: "تم إرسال الاستشارة",
      detail: "",
      at: data.createdAt,
      stamp: undefined as string | undefined,
    },
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  return (
    <div className="space-y-3">
      <Link href={homeHref} aria-label="رجوع" className="inline-flex h-9 w-9 items-center justify-center text-[#3e4c86]">
        <ArrowRight className="h-5 w-5" aria-hidden />
      </Link>

      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="line-clamp-2 text-xl font-bold leading-8 text-[#3e4c86]">{data.question}</h1>
          <p className="mt-1 text-[13px] font-medium text-[#8b93ab]">{data.referenceCode}</p>
        </div>
        {canContact ? (
          <a
            href={whatsappUrl(
              data.phone,
              consultationWhatsappMessage({
                fullName: data.fullName,
                consultantName: data.assignedTo?.name ?? "",
                referenceCode: data.referenceCode,
                question: data.question,
                link: data.link,
              }),
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-[#3dcb8c] px-3.5 text-[13px] font-bold text-white shadow-[0_8px_16px_rgba(61,203,140,0.28)]"
          >
            تواصل واتساب
            <WhatsAppIcon className="h-[18px] w-[18px]" />
          </a>
        ) : claimable ? (
          <ClaimConsultationButton consultationId={data.id} variant="bar" onClaimed={(assignee) => setData((current) => ({ ...current, assignedTo: assignee }))} />
        ) : null}
      </div>

      <section className="rounded-2xl bg-white px-4 py-4 shadow-[0_8px_20px_rgba(62,76,134,0.05)] ring-1 ring-[#eef0f6]">
        <h2 className="text-base font-bold text-[#3e4c86]">بيانات المستفيد</h2>
        <dl className="mt-4 space-y-3">
          <Info label="الاسم" value={data.fullName} />
          <Info label="الجوال" value={data.phone || "—"} dir="ltr" />
          <Info label="البريد" value={data.email ?? "—"} dir="ltr" />
          <Info label="الجنس" value={data.genderLabel} />
          <Info label="الصفة" value={data.currentStageLabel} />
          <Info label="اسم المشروع أو الفريق" value={data.projectOrTeamName ?? "—"} />
          {data.teamMemberCount ? <Info label="عدد أعضاء الفريق" value={String(data.teamMemberCount)} /> : null}
        </dl>
      </section>

      <section className="rounded-2xl bg-white px-4 py-4 shadow-[0_8px_20px_rgba(62,76,134,0.05)] ring-1 ring-[#eef0f6]">
        <h2 className="text-base font-bold text-[#3e4c86]">تفاصيل الاستشارة</h2>
        <dl className="mt-4 space-y-3">
          <Info label="نوع الاستشارة" value={data.consultationTypeLabel} />
          <Info label="الأدوات" value={data.tools.length ? data.tools.join("، ") : "—"} />
          <div className="flex items-center justify-between gap-4 border-b border-[#f3f4f8] pb-3">
            <dt className="shrink-0 text-[13px] font-semibold text-[#8b93ab]">طريقة التواصل المفضلة</dt>
            <dd className="inline-flex min-w-0 items-center gap-1.5 text-sm font-semibold text-[#3e4c86]">
              <ContactChoiceIcon method={data.preferredContactMethodLabel} />
              {data.preferredContactMethodLabel}
            </dd>
          </div>
          {mode === "admin" ? <Info label="المستشار المفضل" value={data.preferredConsultantFullLabel} /> : null}
          {mode === "admin" ? <Info label="المستشار المسؤول" value={data.assignedTo?.name ?? "—"} /> : null}
          <div className="border-t border-[#f3f4f8] pt-3">
            <dt className="text-[13px] font-semibold text-[#8b93ab]">التحدي</dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm font-medium leading-7 text-[#3e4c86]">{data.question}</dd>
          </div>
          {data.link ? (
            <div className="border-t border-[#f3f4f8] pt-3">
              <dt className="text-[13px] font-semibold text-[#8b93ab]">رابط البيانات</dt>
              <dd className="mt-1 break-all text-sm font-medium text-[#3e4c86]" dir="ltr">
                <a href={data.link} target="_blank" rel="noopener noreferrer" className="underline">{data.link}</a>
              </dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="space-y-3 rounded-2xl bg-white px-4 py-3 shadow-[0_8px_20px_rgba(62,76,134,0.05)] ring-1 ring-[#eef0f6]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-[#3e4c86]">حالة الاستشارة</h2>
          <FieldSelect
            label="حالة الاستشارة"
            value={status}
            disabled={claimable || saving}
            onChange={(value) => {
              const next = value as ConsultationDetail["status"];
              setStatus(next);
              void handleUpdate({ status: next });
            }}
            options={ALL_STATUSES.map((item) => ({ value: item, label: STATUS_LABELS[item] }))}
          />
        </div>
        {mode === "admin" ? (
          <div className="flex items-center justify-between gap-3 border-t border-[#f3f4f8] pt-3">
            <h2 className="text-base font-bold text-[#3e4c86]">الأولوية</h2>
            <FieldSelect
              label="الأولوية"
              value={priority}
              disabled={saving}
              onChange={(value) => {
                const next = value as ConsultationDetail["priority"];
                setPriority(next);
                void handleUpdate({ priority: next });
              }}
              options={ALL_PRIORITIES.map((item) => ({ value: item, label: PRIORITY_LABELS[item] }))}
            />
          </div>
        ) : null}
      </section>

      {mode === "admin" ? (
        <section className="rounded-2xl bg-white px-4 py-4 shadow-[0_8px_20px_rgba(62,76,134,0.05)] ring-1 ring-[#eef0f6]">
          <h2 className="text-base font-bold text-[#3e4c86]">إسناد المستشار</h2>
          {assignees.length === 0 ? (
            <p className="mt-3 text-sm font-medium text-[#8b93ab]">لا يوجد مستشار مفعّل بعد. أرسل دعوة أولاً.</p>
          ) : (
            <div className="mt-3 flex items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <select
                  aria-label="إسناد المستشار"
                  value={assigneeId}
                  onChange={(event) => setAssigneeId(event.target.value)}
                  className="h-10 w-full appearance-none rounded-full border border-[#d5d9e8] bg-white py-0 pl-8 pr-3 text-[13px] font-semibold text-[#3e4c86] outline-none"
                >
                  <option value="">اختر مستشاراً</option>
                  {assignees.map((assignee) => (
                    <option key={assignee.id} value={assignee.id}>{assignee.name}</option>
                  ))}
                </select>
                <Caret />
              </div>
              <button
                type="button"
                onClick={handleAssign}
                disabled={assigning || !assigneeId}
                className="inline-flex h-10 shrink-0 items-center rounded-full bg-[#3e4c86] px-4 text-[13px] font-bold text-white transition hover:bg-[#354272] disabled:opacity-40"
              >
                {assigning ? "جاري الإسناد..." : "إسناد"}
              </button>
            </div>
          )}
          {assignNotice ? (
            <p className={`mt-2 text-xs font-medium ${assignNotice.sent ? "text-[#067647]" : "text-[#b42318]"}`}>
              {assignNotice.message}
            </p>
          ) : null}
        </section>
      ) : null}

      <form onSubmit={handleAddNote} className="rounded-2xl bg-white px-3 py-3 shadow-[0_8px_20px_rgba(62,76,134,0.05)] ring-1 ring-[#eef0f6]">
        <div className="flex items-center gap-2">
          <h2 className="shrink-0 text-sm font-bold text-[#3e4c86] sm:text-base">تعليقات داخلية</h2>
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            disabled={claimable || noteSaving}
            placeholder={claimable ? "بعد استلام الاستشارة" : "أضف تعليقاً"}
            className="h-10 min-w-0 flex-1 rounded-full border-0 bg-[#eef1f8] px-4 text-sm text-[#3e4c86] outline-none placeholder:text-[#a3abc2] disabled:opacity-60"
          />
          <button
            type="submit"
            aria-label="إضافة تعليق"
            disabled={claimable || noteSaving || !note.trim()}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#3e4c86] text-white transition hover:bg-[#33406f] disabled:opacity-40"
          >
            <svg viewBox="0 0 20 20" aria-hidden="true" className="h-5 w-5">
              <path d="M10 4.5v11M4.5 10h11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <p className="mt-2 px-1 text-[12px] font-medium leading-5 text-[#8b93ab]">
          هذه الملاحظات تظهر للمستشارين فقط، وللتواصل مع المستفيد اضغط زر الواتساب.
        </p>
      </form>

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

      <ul className="divide-y divide-[#e6e8ee] px-1">
        {timeline.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-6 text-[#3e4c86]">{item.title}</p>
              {item.detail ? <p className="mt-0.5 text-[13px] leading-6 text-[#8b93ab]">{item.detail}</p> : null}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1 pt-0.5">
              <time className="text-end text-[12px] font-normal leading-5 text-[#8b93ab]">
                {item.stamp ?? clock(item.at)}
              </time>
              {item.canDelete && item.noteId ? (
                <button
                  type="button"
                  onClick={() => {
                    if (pendingDeleteId === item.noteId) {
                      void handleDeleteNote(item.noteId);
                      return;
                    }
                    setPendingDeleteId(item.noteId);
                  }}
                  disabled={deletingId === item.noteId}
                  className="text-[12px] font-medium text-[#b42318] disabled:opacity-40"
                >
                  {deletingId === item.noteId
                    ? "جاري الحذف..."
                    : pendingDeleteId === item.noteId
                      ? "تأكيد الحذف"
                      : "حذف"}
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function clock(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

function FieldSelect({
  label,
  value,
  disabled,
  onChange,
  options,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative shrink-0">
      <select
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 appearance-none rounded-full border border-[#d5d9e8] bg-white py-0 pl-8 pr-3 text-[13px] font-semibold text-[#3e4c86] outline-none disabled:opacity-50"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <Caret />
    </div>
  );
}

function Caret() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-[#3e4c86]">
      <path d="M5 7.5 10 12.5 15 7.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ContactChoiceIcon({ method }: { method: string }) {
  const className = "h-3.5 w-3.5 shrink-0";
  if (method === "واتساب") return <WhatsAppIcon className={className} />;
  if (method === "مكالمة") return <Phone className={className} aria-hidden />;
  return <Users className={className} aria-hidden />;
}

function Info({ label, value, dir }: { label: string; value: string; dir?: "ltr" | "rtl" }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#f3f4f8] pb-3 last:border-0 last:pb-0">
      <dt className="shrink-0 text-[13px] font-semibold text-[#8b93ab]">{label}</dt>
      <dd className="min-w-0 text-left text-sm font-semibold text-[#3e4c86]" dir={dir}>{value}</dd>
    </div>
  );
}
