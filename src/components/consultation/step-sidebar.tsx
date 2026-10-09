"use client";

import { Check } from "lucide-react";
import { clsx } from "clsx";

import { ForumPill, ForumTitle } from "@/components/consultation/forum-brand";
import { FORM_STEPS, SUCCESS_STEP } from "@/components/consultation/steps-config";

type StepSidebarProps = {
  currentStep: number;
  completedSteps: Set<number>;
  isSuccess: boolean;
};

export function StepSidebar({
  currentStep,
  completedSteps,
  isSuccess,
}: StepSidebarProps) {
  const total = FORM_STEPS.length;
  const displayStep = isSuccess ? total : currentStep;

  return (
    <aside className="kf-glass hidden lg:flex lg:flex-col lg:rounded-3xl lg:p-8 lg:text-white lg:shadow-2xl lg:shadow-black/40">
      <div className="mb-8 text-center">
        <ForumPill>ملتقى</ForumPill>
        <div className="mt-5">
          <ForumTitle size="sm" />
        </div>
        <p className="mt-5 text-sm font-semibold text-[#cfe3ff]">نموذج طلب الاستشارة</p>
        <p className="mt-1 text-xs text-slate-400">أكمل الخطوات لإرسال طلب الاستشارة</p>
      </div>

      <div className="mb-6 flex justify-center">
        <span className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-1.5 text-xs font-semibold text-[#cfe3ff]">
          {isSuccess ? "تم إرسال الطلب" : `الخطوة ${displayStep} من ${total}`}
        </span>
      </div>

      <nav aria-label="خطوات النموذج" className="flex-1 space-y-0">
        {FORM_STEPS.map((step, index) => {
          const done = completedSteps.has(step.id) || isSuccess;
          const current = !isSuccess && currentStep === step.id;
          const Icon = step.icon;
          const prevDone =
            index > 0 &&
            (completedSteps.has(FORM_STEPS[index - 1].id) || isSuccess);

          return (
            <div key={step.id}>
              {index > 0 ? (
                <div
                  className={clsx(
                    "me-5 h-5 w-0.5 rounded-full",
                    prevDone ? "bg-madrak-primary" : "bg-white/15",
                  )}
                  aria-hidden
                />
              ) : null}

              <div
                className={clsx(
                  "flex items-start gap-3 rounded-xl px-2 py-2 transition",
                  current && "bg-white/[0.06] ring-1 ring-white/10",
                )}
              >
                <span
                  className={clsx(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                    done
                      ? "border-transparent kf-gradient-bg text-[#061223]"
                      : current
                        ? "border-madrak-primary bg-madrak-primary/15 text-madrak-primary ring-4 ring-madrak-primary/10"
                        : "border-white/15 bg-white/[0.04] text-slate-400",
                  )}
                >
                  {done ? (
                    <Check className="h-5 w-5" strokeWidth={2.5} />
                  ) : (
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  )}
                </span>
                <div className="min-w-0 pt-1.5">
                  <p
                    className={clsx(
                      "text-sm font-semibold",
                      current ? "text-white" : done ? "text-white" : "text-slate-300",
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">{step.description}</p>
                </div>
              </div>
            </div>
          );
        })}

        {isSuccess ? (
          <>
            <div
              className="me-5 h-5 w-0.5 rounded-full bg-madrak-primary"
              aria-hidden
            />
            <div className="flex items-start gap-3 rounded-xl bg-white/[0.06] px-2 py-2 ring-1 ring-white/10">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-transparent kf-gradient-bg text-[#061223]">
                <Check className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <div className="pt-1.5">
                <p className="text-sm font-semibold">{SUCCESS_STEP.title}</p>
                <p className="mt-0.5 text-xs text-slate-400">{SUCCESS_STEP.description}</p>
              </div>
            </div>
          </>
        ) : null}
      </nav>

      <p className="mt-8 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-xs leading-relaxed text-slate-300">
        استشارات تحليل البيانات متاحة للمستفيدين بدون الحاجة إلى إنشاء حساب.
      </p>
    </aside>
  );
}
