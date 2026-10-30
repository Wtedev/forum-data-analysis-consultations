"use client";

import { ArrowRight, ChevronDown, Phone, Users } from "lucide-react";
import { clsx } from "clsx";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { ClaimConsultationButton } from "@/components/admin/claim-consultation-button";
import { WhatsAppIcon } from "@/components/admin/whatsapp-link";
import { ALL_STATUSES, STATUS_LABELS } from "@/lib/admin-labels";
import type { ConsultationDetail } from "@/lib/admin-serialize";
import { consultationWhatsappMessage, whatsappUrl } from "@/lib/phone";

type ConsultantConsultationViewProps = {
  initialData: ConsultationDetail;
  viewerId: string;
};

function clock(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

export function ConsultantConsultationView({ initialData, viewerId }: ConsultantConsultationViewProps) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [status, setStatus] = useState(initialData.status);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [noteSaving, setNoteSaving] = useState(false);
  const [delegating, setDelegating] = useState(false);
  const [confirmDelegate, setConfirmDelegate] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setData(initialData);
    setStatus(initialData.status);
  }, [initialData]);

  const claimable = data.preferredConsultantId === "NO_PREFERENCE" && !data.assignedTo;
  const canContact = Boolean(data.assignedTo && data.phone);
  const canDelegate = data.assignedTo?.id === viewerId;

  async function handleStatus(next: ConsultationDetail["status"]) {
    setStatus(next);
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/consultations/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
        data?: ConsultationDetail;
      };
      if (!response.ok || !result.success || !result.data) {
        setStatus(data.status);
        setError(result.message ?? "تعذر تحديث الحالة");
        return;
      }
      setData(result.data);
      setStatus(result.data.status);
      router.refresh();
    } catch {
      setStatus(data.status);
      setError("تعذر الاتصال بالخادم");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddNote(event: React.FormEvent) {
    event.preventDefault();
    if (!note.trim() || claimable) return;
    setNoteSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/consultations/${data.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: note.trim() }),
      });
      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
        data?: ConsultationDetail;
      };
      if (!response.ok || !result.success || !result.data) {
        setError(result.message ?? "تعذر إضافة التعليق");
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

  async function handleDelegate() {
    setDelegating(true);
    setError(null);
    try {
      const response = await fetch(`/api/consultant/consultations/${data.id}/delegate`, {
        method: "POST",
      });
      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
        data?: ConsultationDetail;
      };
      if (!response.ok || !result.success || !result.data) {
        setError(result.message ?? "تعذر تفويض الاستشارة");
        return;
      }
      setData(result.data);
      setConfirmDelegate(false);
      router.refresh();
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setDelegating(false);
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
      setData((current) => ({ ...result.data!, phone: current.phone }));
      setPendingDeleteId(null);
      router.refresh();
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setDeletingId(null);
    }
  }

  const timeline = [
    ...data.notes.map((item) => ({
      id: `note-${item.id}`,
      noteId: item.id,
      canDelete: item.adminUserId === viewerId,
      title: item.adminName,
      detail: item.note,
      at: item.createdAt,
      stamp: item.createdAtLabel,
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
      <Link
        href="/consultant"
        aria-label="رجوع"
        className="inline-flex h-9 w-9 items-center justify-center text-[#3e4c86]"
      >
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
          <ClaimConsultationButton
            consultationId={data.id}
            variant="bar"
            onClaimed={() => {
              router.refresh();
            }}
          />
        ) : null}
      </div>

      <section className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_20px_rgba(62,76,134,0.05)] ring-1 ring-[#eef0f6]">
        <div className="flex items-center justify-between gap-3 px-4 py-3.5">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-[#3e4c86]">حالة الاستشارة</h2>
            <p className="mt-1 text-[12px] font-medium leading-5 text-[#8b93ab]">
              حدّث حالة الاستشارة حتى يعرف المسؤولون حجم الاستشارات المتبقية.
            </p>
          </div>
          <div className="relative shrink-0">
            <select
              aria-label="حالة الاستشارة"
              value={status}
              disabled={claimable || saving}
              onChange={(event) => handleStatus(event.target.value as ConsultationDetail["status"])}
              className="h-10 appearance-none rounded-full border border-[#d5d9e8] bg-white py-0 pl-8 pr-3 text-[13px] font-semibold text-[#3e4c86] outline-none disabled:opacity-50"
            >
              {ALL_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {STATUS_LABELS[item]}
                </option>
              ))}
            </select>
            <svg viewBox="0 0 20 20" aria-hidden="true" className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-[#3e4c86]">
              <path d="M5 7.5 10 12.5 15 7.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        {canDelegate ? (
          <div className="border-t border-[#eef0f6] px-4 py-3.5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-[#3e4c86]">تفويض</h2>
              {confirmDelegate ? (
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmDelegate(false)}
                    disabled={delegating}
                    className="inline-flex h-10 items-center rounded-full bg-[#eef1f8] px-4 text-[13px] font-bold text-[#3e4c86] disabled:opacity-40"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={handleDelegate}
                    disabled={delegating}
                    className="inline-flex h-10 items-center rounded-full bg-[#e4ad45] px-4 text-[13px] font-bold text-white transition hover:bg-[#d9a13a] disabled:opacity-40"
                  >
                    {delegating ? "جاري التفويض..." : "تأكيد"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelegate(true)}
                  className="inline-flex h-10 shrink-0 items-center rounded-full border border-[#e4ad45] bg-[#fff8ec] px-4 text-[13px] font-bold text-[#9a6b12] transition hover:bg-[#fff1d6]"
                >
                  تفويض
                </button>
              )}
            </div>
            <p className="mt-2 text-[12px] font-medium leading-5 text-[#8b93ab]">
              التفويض يُخرج الاستشارة من عهدتك، ويستطيع أي مستشار استلامها.
            </p>
          </div>
        ) : null}
      </section>

      <ExpandableSection title="بيانات المستفيد">
        <dl className="space-y-3">
          <Info label="الاسم" value={data.fullName} />
          {data.assignedTo ? (
            <>
              <Info label="الجوال" value={data.phone || "—"} dir="ltr" />
              <Info label="البريد" value={data.email ?? "—"} dir="ltr" />
              <Info label="الجنس" value={data.genderLabel || "—"} />
              <Info label="الصفة" value={data.currentStageLabel || "—"} />
              <Info label="اسم المشروع أو الفريق" value={data.projectOrTeamName ?? "—"} />
              {data.teamMemberCount ? <Info label="عدد أعضاء الفريق" value={String(data.teamMemberCount)} /> : null}
            </>
          ) : (
            <p className="text-[13px] font-medium leading-6 text-[#8b93ab]">
              بقية بيانات المستفيد تظهر بعد استلام الاستشارة.
            </p>
          )}
        </dl>
      </ExpandableSection>

      <ExpandableSection title="تفاصيل الاستشارة">
        <dl className="space-y-3">
          <Info label="نوع الاستشارة" value={data.consultationTypeLabel} />
          <Info label="الأدوات" value={data.tools.length ? data.tools.join("، ") : "—"} />
          <div className="flex items-center justify-between gap-4 border-b border-[#f3f4f8] pb-3">
            <dt className="shrink-0 text-[13px] font-semibold text-[#8b93ab]">طريقة التواصل المفضلة</dt>
            <dd className="inline-flex min-w-0 items-center gap-1.5 text-sm font-semibold text-[#3e4c86]">
              <ContactChoiceIcon method={data.preferredContactMethodLabel} />
              {data.preferredContactMethodLabel}
            </dd>
          </div>
          <div className="border-t border-[#f3f4f8] pt-3">
            <dt className="text-[13px] font-semibold text-[#8b93ab]">التحدي</dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm font-medium leading-7 text-[#3e4c86]">{data.question}</dd>
          </div>
          {data.link ? (
            <div className="border-t border-[#f3f4f8] pt-3">
              <dt className="text-[13px] font-semibold text-[#8b93ab]">رابط البيانات</dt>
              <dd className="mt-1 break-all text-sm font-medium text-[#3e4c86]" dir="ltr">
                <a href={data.link} target="_blank" rel="noopener noreferrer" className="underline">
                  {data.link}
                </a>
              </dd>
            </div>
          ) : null}
        </dl>
      </ExpandableSection>

      <ExpandableSection title="تعليقات داخلية">
        <form onSubmit={handleAddNote}>
          <div className="flex items-center gap-2">
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
          <p className="mt-2 text-[12px] font-medium leading-5 text-[#8b93ab]">
            هذه الملاحظات للمستشارين فقط. يمكنك حذف تعليقك، ولا يمكنك حذف تعليقات الآخرين.
          </p>
        </form>
        {error ? <p className="mt-2 text-sm font-medium text-red-600">{error}</p> : null}
        <ul className="mt-2 divide-y divide-[#e6e8ee]">
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
      </ExpandableSection>
    </div>
  );
}

function ExpandableSection({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_20px_rgba(62,76,134,0.05)] ring-1 ring-[#eef0f6]">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-start"
      >
        <h2 className="text-base font-bold text-[#3e4c86]">{title}</h2>
        <ChevronDown
          className={clsx("h-4 w-4 shrink-0 text-[#8b93ab] transition", open && "rotate-180")}
          aria-hidden
        />
      </button>
      {open ? <div className="px-4 pb-4">{children}</div> : null}
    </section>
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
      <dd className="min-w-0 text-left text-sm font-semibold text-[#3e4c86]" dir={dir}>
        {value}
      </dd>
    </div>
  );
}
