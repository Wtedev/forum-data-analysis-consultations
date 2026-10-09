"use client";

import { useEffect, useState } from "react";

const STEPS = [
  {
    title: "أين تظهر طلباتي؟",
    body: "في هذه الصفحة تجد الطلبات الظاهرة لك: ما طُلب باسمك، وما أخذته، والطلبات المتاحة لكل المستشارين.",
  },
  {
    title: "أخذ الاستشارة",
    body: "الزر يأخذ الطلب لك. بعد ذلك تختفي الاستشارة من بقية المستشارين، وتصبح أنت المسؤول عنها.",
  },
  {
    title: "واتساب",
    body: "يفتح محادثة مع صاحب الطلب على رقم جواله، من القائمة أو من صفحة التفاصيل.",
  },
  {
    title: "عرض الطلب",
    body: "يفتح تفاصيل الاستشارة لتحديث الحالة وكتابة ملاحظة للفريق.",
  },
  {
    title: "البحث",
    body: "اكتب الاسم أو الرقم المرجعي أو الجوال في خانة البحث، ثم اضغط إدخال.",
  },
] as const;

export function PlatformGuide({ tone = "default" }: { tone?: "default" | "onDark" }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const last = step === STEPS.length - 1;

  useEffect(() => {
    if (!open) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function close() {
    setOpen(false);
    setStep(0);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setStep(0);
          setOpen(true);
        }}
        className={
          tone === "onDark"
            ? "inline-flex items-center gap-1.5 text-[13px] font-medium leading-none text-white/85 transition hover:text-white"
            : "inline-flex items-center gap-1 text-sm font-semibold text-[#335382] transition hover:text-[#2a446c]"
        }
        dir="ltr"
      >
        <span
          className={
            tone === "onDark"
              ? "inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border border-white/75 text-[11px] leading-none"
              : "text-sm leading-none"
          }
          aria-hidden="true"
        >
          ?
        </span>
        <span className="whitespace-nowrap">كيف أستخدم المنصة</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
          <button
            type="button"
            aria-label="إغلاق"
            className="absolute inset-0 bg-[#0a0f1d]/50"
            onClick={close}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="platform-guide-title"
            className="relative w-full max-w-md rounded-2xl bg-white p-5 text-[#111827] shadow-2xl sm:p-6"
          >
            <p className="text-xs font-semibold text-[#6b7280]">
              {step + 1} من {STEPS.length}
            </p>
            <h2 id="platform-guide-title" className="mt-2 text-lg font-bold">
              {current.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#374151]">{current.body}</p>
            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep((value) => Math.max(0, value - 1))}
                disabled={step === 0}
                className="inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold text-[#374151] transition hover:bg-[#f3f4f6] disabled:opacity-30"
              >
                السابق
              </button>
              <button
                type="button"
                onClick={() => {
                  if (last) close();
                  else setStep((value) => value + 1);
                }}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#335382] px-5 text-sm font-semibold text-white transition hover:bg-[#2a446c]"
              >
                {last ? "إنهاء" : "التالي"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
