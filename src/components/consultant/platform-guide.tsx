"use client";

import { useEffect, useState } from "react";

const STEPS = [
  {
    title: "ماذا أرى في الصفحة؟",
    body: "في الأعلى ثلاث بطاقات: جميع الاستشارات الظاهرة لك، واستشاراتك التي استلمتها، والاستشارات غير المسندة. تحتها قائمة «كل الاستشارات»، وفي كل صف سؤال الاستشارة واسم المستفيد.",
  },
  {
    title: "ما الذي يظهر في قائمتي؟",
    body: "تظهر لك الاستشارة التي اختارك المستفيد لها، وما استلمته أنت، والطلبات التي تُركت بلا تفضيل. أما الطلب الموجّه لمستشار آخر فلا يظهر عندك.",
  },
  {
    title: "كيف أستلم استشارة؟",
    body: "في الطلب الذي بلا تفضيل يظهر زر «استلام الاستشارة». بعد الاستلام تصبح مسؤولاً عنه، ويختفي من قوائم بقية المستشارين. رقم الجوال وزر واتساب يظهران بعد الاستلام فقط.",
  },
  {
    title: "كيف أتواصل مع المستفيد؟",
    body: "زر «تواصل واتساب» يفتح محادثة على رقم المستفيد، وفيها نص جاهز يضم تحية مختصرة والاستشارة كاملة. تجده في صف الاستشارة، وفي أعلى صفحة تفاصيلها.",
  },
  {
    title: "ماذا أجد داخل الاستشارة؟",
    body: "السهم يفتح الصفحة: بيانات المستفيد، وتفاصيل الطلب، ورقمه. من «حالة الاستشارة» تُحفظ الحالة فور اختيارها. وفي «تعليقات داخلية» تكتب ملاحظة للفريق، وتظهر في السجل مع التحديثات ووقت إرسال الطلب.",
  },
  {
    title: "كيف أبحث وأصفّي؟",
    body: "أيقونة البحث تفتح خانة للاسم أو الرقم المرجعي أو الجوال، ثم اضغط إدخال. أيقونة التصفية تعرض الطلبات حسب حالتها، و«إعادة ضبط» تعيد القائمة كاملة.",
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
