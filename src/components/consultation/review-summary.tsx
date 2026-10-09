"use client";

import { clsx } from "clsx";
import { Pencil } from "lucide-react";

import type { ConsultationFormState } from "@/components/consultation/types";

type ReviewItem = {
  label: string;
  value: string;
  step?: number;
};

function ReviewRow({
  label,
  value,
  onEdit,
  editable,
}: {
  label: string;
  value: string;
  onEdit?: () => void;
  editable?: boolean;
}) {
  const display = value?.trim() ? value : "لم يُذكر";

  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-3.5 last:border-0">
      <div className="min-w-0 flex-1 text-start">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p
          className={clsx(
            "mt-0.5 text-sm font-medium",
            value?.trim() ? "text-slate-800" : "text-slate-400",
          )}
        >
          {display}
        </p>
      </div>
      {editable && onEdit ? (
        <button
          type="button"
          onClick={onEdit}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-madrak-primary transition hover:bg-madrak-primary/10"
          aria-label={`تعديل ${label}`}
        >
          <Pencil className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}

export function ReviewSummary({
  form,
  onEditStep,
  editable = false,
  className,
}: {
  form: ConsultationFormState;
  onEditStep?: (step: number) => void;
  editable?: boolean;
  className?: string;
}) {
  const items: ReviewItem[] = [
    { label: "الاسم الثلاثي", value: form.fullName, step: 1 },
    { label: "رقم الجوال", value: form.phone, step: 1 },
    { label: "البريد الإلكتروني", value: form.email, step: 1 },
    { label: "الجنس", value: form.gender, step: 1 },
    { label: "المرحلة الحالية", value: form.currentStage, step: 2 },
    { label: "الجامعة", value: form.university, step: 2 },
    { label: "التخصص", value: form.majorInterest, step: 2 },
    { label: "نوع الاستشارة", value: form.consultationType, step: 3 },
    {
      label: "السؤال",
      value:
        form.question.length > 100
          ? `${form.question.slice(0, 100)}…`
          : form.question,
      step: 3,
    },
  ];

  return (
    <div
      className={clsx(
        "rounded-2xl border border-slate-100 bg-slate-50/60",
        editable ? "p-1" : "p-4 sm:p-5",
        className,
      )}
    >
      {!editable ? (
        <>
          <h3 className="mb-1 text-sm font-semibold text-slate-800">ملخص الطلب</h3>
          <p className="mb-3 text-xs text-slate-500">
            راجع بياناتك قبل إرسال طلب الاستشارة
          </p>
        </>
      ) : null}

      <dl className={editable ? "px-3" : undefined}>
        {items.map((item) => (
          <ReviewRow
            key={item.label}
            label={item.label}
            value={item.value}
            editable={editable}
            onEdit={
              editable && onEditStep && item.step
                ? () => onEditStep(item.step!)
                : undefined
            }
          />
        ))}
      </dl>
    </div>
  );
}
