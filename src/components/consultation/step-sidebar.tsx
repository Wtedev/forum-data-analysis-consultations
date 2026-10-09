"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { clsx } from "clsx";

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
    <aside className="hidden lg:flex lg:flex-col lg:rounded-3xl lg:bg-gradient-to-b lg:from-madrak-primary lg:to-[#056b6f] lg:p-8 lg:text-white lg:shadow-xl lg:shadow-madrak-primary/20">
      <div className="mb-8 text-center">
        <Image
          src="/images/madrak-logo.svg"
          alt="مدرك"
          width={100}
          height={40}
          className="mx-auto h-10 w-auto brightness-0 invert"
          priority
        />
        <p className="mt-6 text-sm font-medium text-white/80">بوصلتك الجامعية</p>
        <h1 className="mt-1 text-xl font-semibold leading-snug">
          نموذج الاستشارات الأكاديمية
        </h1>
        <p className="mt-2 text-sm text-white/65">أكمل الخطوات لإرسال طلب الاستشارة</p>
      </div>

      <div className="mb-6 flex justify-center">
        <span className="rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold text-white">
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
                    prevDone ? "bg-madrak-secondary" : "bg-white/25",
                  )}
                  aria-hidden
                />
              ) : null}

              <div
                className={clsx(
                  "flex items-start gap-3 rounded-xl px-2 py-2 transition",
                  current && "bg-white/15",
                )}
              >
                <span
                  className={clsx(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                    done
                      ? "border-madrak-secondary bg-madrak-secondary text-[#1a2e30] shadow-md shadow-black/10"
                      : current
                        ? "border-white bg-white text-madrak-primary shadow-md shadow-black/10 ring-4 ring-white/20"
                        : "border-white/30 bg-white/15 text-white/80",
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
                      current ? "text-white" : done ? "text-white" : "text-white/90",
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-xs text-white/65">{step.description}</p>
                </div>
              </div>
            </div>
          );
        })}

        {isSuccess ? (
          <>
            <div
              className="me-5 h-5 w-0.5 rounded-full bg-madrak-secondary"
              aria-hidden
            />
            <div className="flex items-start gap-3 rounded-xl bg-white/15 px-2 py-2">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-madrak-secondary bg-madrak-secondary text-[#1a2e30]">
                <Check className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <div className="pt-1.5">
                <p className="text-sm font-semibold">{SUCCESS_STEP.title}</p>
                <p className="mt-0.5 text-xs text-white/65">{SUCCESS_STEP.description}</p>
              </div>
            </div>
          </>
        ) : null}
      </nav>

      <p className="mt-8 rounded-xl bg-white/10 px-4 py-3 text-xs leading-relaxed text-white/80">
        الاستشارات الأكاديمية متاحة للمستفيدين بدون الحاجة إلى إنشاء حساب.
      </p>
    </aside>
  );
}
