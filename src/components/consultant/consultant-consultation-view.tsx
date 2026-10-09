"use client";

import { ArrowRight, Phone, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ClaimConsultationButton } from "@/components/admin/claim-consultation-button";
import { WhatsAppIcon } from "@/components/admin/whatsapp-link";
import { ALL_STATUSES, STATUS_LABELS } from "@/lib/admin-labels";
import { CONTACT_METHOD_LABELS } from "@/lib/consultation-mappers";
import type { ConsultationDetail } from "@/lib/admin-serialize";
import { consultationWhatsappMessage, whatsappUrl } from "@/lib/phone";

type ConsultantConsultationViewProps = {
  initialData: ConsultationDetail;
};

function clock(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

export function ConsultantConsultationView({ initialData }: ConsultantConsultationViewProps) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [status, setStatus] = useState(initialData.status);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [noteSaving, setNoteSaving] = useState(false);

  useEffect(() => {
    setData(initialData);
    setStatus(initialData.status);
  }, [initialData]);

  const claimable = data.preferredConsultantId === "NO_PREFERENCE" && !data.assignedTo;
  const canContact = Boolean(data.assignedTo && data.phone);

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

  const timeline = [
    ...data.notes.map((item) => ({
      id: `note-${item.id}`,
      title: "تعليق",
      detail: item.note,
      at: item.createdAt,
    })),
    ...data.activityLogs
      .filter(
        (item) =>
          item.description !== "إضافة ملاحظة داخلية" && !item.description.startsWith("تم إنشاء طلب"),
      )
      .map((item) => ({
        id: `log-${item.id}`,
        title: "تحديث",
        detail: item.description,
        at: item.createdAt,
      })),
    { id: "created", title: "تم إرسال الاستشارة", detail: "", at: data.createdAt },
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
            onClaimed={(assignee) => {
              setData((current) => ({ ...current, assignedTo: assignee }));
              router.refresh();
            }}
          />
        ) : null}
      </div>

      <section className="rounded-2xl bg-white px-4 py-4 shadow-[0_8px_20px_rgba(62,76,134,0.05)] ring-1 ring-[#eef0f6]">
        <h2 className="text-base font-bold text-[#3e4c86]">بيانات المستفيد</h2>
        <dl className="mt-4 space-y-3">
          <Info label="الاسم" value={data.fullName} />
          {canContact ? <Info label="الجوال" value={data.phone} dir="ltr" /> : null}
          <Info label="البريد" value={data.email ?? "—"} dir="ltr" />
          <Info label="الجنس" value={data.genderLabel} />
          <Info label="الصفة" value={data.currentStageLabel} />
          <Info label="الجهة" value={data.university ?? "—"} />
          <Info label="المجال" value={data.majorInterest ?? "—"} />
        </dl>
      </section>

      <section className="rounded-2xl bg-white px-4 py-4 shadow-[0_8px_20px_rgba(62,76,134,0.05)] ring-1 ring-[#eef0f6]">
        <h2 className="text-base font-bold text-[#3e4c86]">تفاصيل الاستشارة</h2>
        <dl className="mt-4 space-y-3">
          <Info label="نوع الاستشارة" value={data.consultationTypeLabel} />
          <Info label="الأدوات" value={data.tools.length ? data.tools.join("، ") : "—"} />
          <div className="border-t border-[#f3f4f8] pt-3">
            <p className="text-[13px] font-semibold text-[#8b93ab]">ما هي طريقة التواصل المفضلة؟</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {CONTACT_METHOD_LABELS.map((option) => {
                const selected = option === data.preferredContactMethodLabel;
                return (
                  <span
                    key={option}
                    className={
                      selected
                        ? "inline-flex h-9 items-center gap-1.5 rounded-full bg-[#3e4c86] px-3 text-[13px] font-bold text-white"
                        : "inline-flex h-9 items-center gap-1.5 rounded-full bg-[#eef1f8] px-3 text-[13px] font-semibold text-[#8b93ab]"
                    }
                  >
                    <ContactChoiceIcon method={option} />
                    {option}
                  </span>
                );
              })}
            </div>
          </div>
          <div className="border-t border-[#f3f4f8] pt-3">
            <dt className="text-[13px] font-semibold text-[#8b93ab]">السؤال</dt>
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
      </section>

      <section className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_8px_20px_rgba(62,76,134,0.05)] ring-1 ring-[#eef0f6]">
        <h2 className="text-base font-bold text-[#3e4c86]">حالة الاستشارة</h2>
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
      </section>

      <form
        onSubmit={handleAddNote}
        className="flex items-center gap-2 rounded-2xl bg-white px-3 py-3 shadow-[0_8px_20px_rgba(62,76,134,0.05)] ring-1 ring-[#eef0f6]"
      >
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
      </form>

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

      <ul className="divide-y divide-[#e6e8ee] px-1">
        {timeline.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-6 text-[#3e4c86]">{item.title}</p>
              {item.detail ? <p className="mt-0.5 text-[13px] leading-6 text-[#8b93ab]">{item.detail}</p> : null}
            </div>
            <time className="shrink-0 pt-0.5 text-[13px] font-medium text-[#8b93ab]" dir="ltr">
              {clock(item.at)}
            </time>
          </li>
        ))}
      </ul>
    </div>
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
