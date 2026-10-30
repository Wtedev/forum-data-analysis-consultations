"use client";

import { CircleHelp } from "lucide-react";
import { useEffect, useState } from "react";

const STEPS = [
  {
    title: "ماذا أرى في الصفحة؟",
    body: "في الأعلى ثلاث بطاقات: الاستشارات الجديدة، والجارية، والمغلقة. تحتها قائمة «كل الاستشارات»، وفي كل بطاقة الرقم والتاريخ والتوجيه، ثم اسم الفريق ونص الطلب وحالته. من الهيدر تفتح ظهور اسمك للمستفيدين أو تغلقه، وعند الإغلاق يظهر تنبيه في الأعلى ويختفي اسمك من نموذج الطلب.",
  },
  {
    title: "ما الذي يظهر في قائمتي؟",
    body: "تظهر لك الاستشارة التي اختارك المستفيد لها، وما استلمته أنت، والطلبات المكتوب عليها «تحتاج مستشار». أما الطلب الموجّه لمستشار آخر فلا يظهر عندك.",
  },
  {
    title: "كيف أستلم استشارة؟",
    body: "في الطلب المكتوب عليه «تحتاج مستشار» يظهر زر «استلام الاستشارة». قبل الاستلام تظهر من بيانات المستفيد الاسم فقط. بعد الاستلام تصبح مسؤولاً عنه، وتظهر بقية بياناته وزر واتساب، ويختفي الطلب من قوائم بقية المستشارين. من داخل الاستشارة يمكنك «تفويضها» فتعود بلا مسؤول ويستطيع أي مستشار استلامها.",
  },
  {
    title: "كيف أتواصل مع المستفيد؟",
    body: "زر «تواصل واتساب» يفتح محادثة على رقم المستفيد، وفيها نص جاهز يضم تحية مختصرة والاستشارة كاملة. تجده في صف الاستشارة، وفي أعلى صفحة تفاصيلها.",
  },
  {
    title: "ماذا أجد داخل الاستشارة؟",
    body: "السهم يفتح الصفحة: بيانات المستفيد، وتفاصيل الطلب، ورقمه. من «حالة الاستشارة» تُحفظ الحالة فور اختيارها. للتواصل مع المستفيد استخدم زر واتساب.",
  },
  {
    title: "ما هي التعليقات الداخلية؟",
    body: "ملاحظات بين المستشارين داخل الاستشارة. يراها المستشارون فقط، ولا تصل إلى المستفيد. يظهر اسم من كتب التعليق مع التاريخ والوقت، ويمكنك حذف تعليقك. إذا أردت مراسلة المستفيد فاستخدم زر واتساب.",
  },
  {
    title: "ما هو التفويض؟",
    body: "التفويض يعني أنك تتنازل عن استشارة في عهدتك. بعد «تأكيد التفويض» تصبح بلا مسؤول، ويستطيع أي مستشار استلامها من القائمة. زر التفويض يظهر فقط لمن يحمل الاستشارة.",
  },
  {
    title: "ماذا يعني بريد الإسناد؟",
    body: "إذا أسندت الإدارة الاستشارة إليك، يصلك بريد بعنوان «أُسندت إليك استشارة». فيه اسم صاحب الطلب، ورقمها، ونوعها، ونصها، ورابط فتحها. يعني أن الاستشارة أصبحت في عهدتك، ولن تظهر لبقية المستشارين.",
  },
  {
    title: "كيف أبحث وأصفّي؟",
    body: "أيقونة البحث تفتح خانة للاسم أو الرقم المرجعي أو الجوال، ثم اضغط إدخال. أيقونة التصفية تفتح قائمة: «استشاراتي» أو «استشارات غير مسندة»، و«جديد» أو «جاري» أو «مغلق». اضغط الاختيار مرة أخرى لإلغائه.",
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
            ? "inline-flex items-center gap-1 text-[10px] font-normal leading-none text-white/85 transition hover:text-white"
            : "inline-flex items-center gap-1 text-[10px] font-normal leading-none text-[#8b93ab] transition hover:text-[#3e4c86]"
        }
        dir="ltr"
      >
        <CircleHelp className="h-3 w-3 shrink-0" strokeWidth={1.75} aria-hidden />
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
