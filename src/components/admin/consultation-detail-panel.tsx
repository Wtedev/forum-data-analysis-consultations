"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { clsx } from "clsx";

import { ClaimConsultationButton } from "@/components/admin/claim-consultation-button";
import { WhatsAppLink } from "@/components/admin/whatsapp-link";
import {
  FieldError,
  staffInputClassName,
} from "@/components/consultation/ui";
import { ALL_PRIORITIES, ALL_STATUSES, PRIORITY_LABELS, STATUS_LABELS } from "@/lib/admin-labels";
import { whatsappUrl } from "@/lib/phone";
import type { ConsultationDetail } from "@/lib/admin-serialize";

type ConsultationDetailPanelProps = {
  initialData: ConsultationDetail;
  mode?: "admin" | "consultant";
  assignees?: { id: string; name: string }[];
};

export function ConsultationDetailPanel({
  initialData,
  mode = "admin",
  assignees = [],
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

  async function handleUpdate() {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/consultations/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, priority }),
      });

      const result = (await response.json()) as {
        success: boolean;
        message?: string;
        data?: ConsultationDetail;
      };

      if (!response.ok || !result.success || !result.data) {
        setError(result.message ?? "تعذر التحديث");
        return;
      }

      setData(result.data);
      setStatus(result.data.status);
      setPriority(result.data.priority);
      router.refresh();
    } catch {
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
      };

      if (!response.ok || !result.success || !result.data) {
        setError(result.message ?? "تعذر الإسناد");
        return;
      }

      setData(result.data);
      setAssigneeId(result.data.assignedTo?.id ?? "");
      router.refresh();
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setAssigning(false);
    }
  }

  const claimable = mode === "consultant" && data.preferredConsultantId === "NO_PREFERENCE" && !data.assignedTo;

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-[#e6e8ec] bg-white p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">{data.referenceCode}</p>
            <h1 className="mt-1 text-xl font-bold text-slate-800 sm:text-2xl">{data.fullName}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {data.createdAtLabel} · {data.consultationTypeLabel}
            </p>
          </div>
          <span
            className={clsx(
              "rounded-full px-3 py-1 text-sm font-medium",
              data.status === "NEW" && "bg-[#fff4dc] text-[#a16207]",
              data.status === "CLOSED" && "bg-[#f3f4f6] text-[#6b7280]",
              data.status !== "NEW" && data.status !== "CLOSED" && "bg-[#e7f6ec] text-[#157a43]",
            )}
          >
            {data.statusLabel}
          </span>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#e6e8ec] bg-white p-4 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">بيانات المتقدم</h2>
          <dl className="space-y-3 text-sm">
            {mode === "consultant" && !data.assignedTo ? null : (
            <DetailRow
              label="الجوال"
              value={
                <span className="flex flex-wrap items-center gap-2">
                  <span dir="ltr">{data.phone}</span>
                  <WhatsAppLink
                    href={whatsappUrl(data.phone)}
                    label={mode === "consultant" ? "تواصل واتساب" : "واتساب"}
                  />
                </span>
              }
            />
            )}
            <DetailRow label="البريد" value={data.email ?? "—"} dir="ltr" />
            <DetailRow label="الجنس" value={data.genderLabel} />
            <DetailRow label="صفة المستفيد" value={data.currentStageLabel} />
            <DetailRow label="الجهة" value={data.university ?? "—"} />
            <DetailRow label="المجال" value={data.majorInterest ?? "—"} />
            <DetailRow label="المستشار المفضل" value={data.preferredConsultantFullLabel} />
            <DetailRow label="المستشار المسؤول" value={data.assignedTo?.name ?? (claimable ? "متاحة للأخذ" : "—")} />
            <DetailRow label="الأدوات" value={data.tools.length ? data.tools.join("، ") : "—"} />
            <DetailRow
              label="رابط البيانات"
              value={
                data.link ? (
                  <a href={data.link} target="_blank" rel="noopener noreferrer" dir="ltr" className="text-forum-primary underline">
                    {data.link}
                  </a>
                ) : (
                  "—"
                )
              }
            />
            <DetailRow label="الأولوية" value={data.priorityLabel} />
          </dl>
        </section>

        <section className="rounded-2xl border border-[#e6e8ec] bg-white p-4 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">السؤال</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{data.question}</p>
        </section>
      </div>

      {claimable ? (
        <section className="rounded-2xl border border-[#e6e8ec] bg-white p-4 sm:p-6">
          <h2 className="mb-2 text-lg font-semibold text-slate-800">أخذ هذه الاستشارة</h2>
          <p className="mb-4 text-sm leading-7 text-slate-600">
            هذا الطلب بلا تفضيل ويظهر لكل المستشارين. عندما تأخذ الاستشارة تصبح مسؤولاً عنها، وتختفي من بقية المستشارين.
          </p>
          <ClaimConsultationButton
            consultationId={data.id}
            onClaimed={(assignee) => setData((current) => ({ ...current, assignedTo: assignee }))}
          />
        </section>
      ) : (
      <section className="rounded-2xl border border-[#e6e8ec] bg-white p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">إدارة الطلب</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="status" className="mb-2 block text-sm font-medium text-slate-700">
              الحالة
            </label>
            <select
              id="status"
              className={staffInputClassName}
              value={status}
              onChange={(event) => setStatus(event.target.value as typeof status)}
            >
              {ALL_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {STATUS_LABELS[item]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="priority" className="mb-2 block text-sm font-medium text-slate-700">
              الأولوية
            </label>
            <select
              id="priority"
              className={staffInputClassName}
              value={priority}
              onChange={(event) => setPriority(event.target.value as typeof priority)}
            >
              {ALL_PRIORITIES.map((item) => (
                <option key={item} value={item}>
                  {PRIORITY_LABELS[item]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error ? <div className="mt-4"><FieldError message={error} /></div> : null}

        {mode === "admin" ? (
          <div className="mt-4">
            <label htmlFor="assignee" className="mb-2 block text-sm font-medium text-slate-700">
              إسناد لمستشار
            </label>
            {assignees.length === 0 ? (
              <p className="text-sm text-slate-500">لا يوجد مستشار مفعّل بعد. أرسل دعوة أولاً.</p>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <select
                  id="assignee"
                  className={staffInputClassName}
                  value={assigneeId}
                  onChange={(event) => setAssigneeId(event.target.value)}
                >
                  <option value="">اختر مستشاراً</option>
                  {assignees.map((assignee) => (
                    <option key={assignee.id} value={assignee.id}>
                      {assignee.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAssign}
                  disabled={assigning || !assigneeId}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#111827] px-5 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-40"
                >
                  {assigning ? "جاري الإسناد..." : "إسناد"}
                </button>
              </div>
            )}
          </div>
        ) : null}

        <div className="mt-4">
          <button
            type="button"
            onClick={handleUpdate}
            disabled={saving}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#111827] px-5 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-40"
          >
            {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
          </button>
        </div>
      </section>
      )}

      <section className="rounded-2xl border border-[#e6e8ec] bg-white p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">ملاحظات داخلية</h2>
        {claimable ? (
          <p className="text-sm text-slate-500">تظهر الملاحظات بعد أخذ الاستشارة.</p>
        ) : (
        <form onSubmit={handleAddNote} className="space-y-3">
          <textarea
            className={clsx(staffInputClassName, "min-h-28 resize-y")}
            placeholder="أضف ملاحظة للفريق..."
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <button
            type="submit"
            disabled={noteSaving || !note.trim()}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#e6e8ec] bg-white px-5 text-sm font-semibold text-[#111827] transition hover:bg-[#f7f8fa] disabled:opacity-40"
          >
            {noteSaving ? "جاري الإضافة..." : "إضافة ملاحظة"}
          </button>
        </form>
        )}
        {claimable ? null : (
        <ul className="mt-6 space-y-4">
          {data.notes.length === 0 ? (
            <li className="text-sm text-slate-500">لا توجد ملاحظات بعد</li>
          ) : (
            data.notes.map((item) => (
              <li key={item.id} className="rounded-xl bg-[#f7f8fa] px-4 py-3 text-sm">
                <p className="text-slate-700">{item.note}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {item.adminName} · {item.createdAtLabel}
                </p>
              </li>
            ))
          )}
        </ul>
        )}
      </section>

      <section className="rounded-2xl border border-[#e6e8ec] bg-white p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">سجل النشاط</h2>
        <ul className="space-y-3">
          {data.activityLogs.length === 0 ? (
            <li className="text-sm text-slate-500">لا يوجد نشاط مسجّل</li>
          ) : (
            data.activityLogs.map((log) => (
              <li key={log.id} className="border-b border-slate-100 pb-3 text-sm last:border-0 last:pb-0">
                <p className="text-slate-700">{log.description}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {log.adminName ?? "النظام"} · {log.createdAtLabel}
                </p>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}

function DetailRow({
  label,
  value,
  dir,
}: {
  label: string;
  value: React.ReactNode;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div className="flex flex-wrap justify-between gap-2 border-b border-slate-50 pb-2 last:border-0">
      <dt className="font-medium text-slate-700">{label}</dt>
      <dd className="min-w-0 max-w-full break-words font-medium text-slate-800" dir={dir}>
        {value}
      </dd>
    </div>
  );
}
