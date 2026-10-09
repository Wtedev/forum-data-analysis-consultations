"use client";

import { clsx } from "clsx";
import { Check } from "lucide-react";

import { FORM_STEPS } from "@/components/consultation/steps-config";

type MobileStepperProps = {
  currentStep: number;
  completedSteps: Set<number>;
  isSuccess: boolean;
};

export function MobileStepper({
  currentStep,
  completedSteps,
  isSuccess,
}: MobileStepperProps) {
  return (
    <div className="lg:hidden">
      <div className="flex items-center px-1">
        {FORM_STEPS.map((step, index) => {
          const done = completedSteps.has(step.id) || isSuccess;
          const current = !isSuccess && currentStep === step.id;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex flex-1 items-center">
              {index > 0 ? (
                <div
                  className={clsx(
                    "h-0.5 flex-1 rounded-full transition-colors",
                    completedSteps.has(FORM_STEPS[index - 1].id) || isSuccess
                      ? "bg-madrak-primary"
                      : "bg-slate-200",
                  )}
                  aria-hidden
                />
              ) : null}

              <div className="flex flex-col items-center px-1">
                <span
                  className={clsx(
                    "flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all",
                    done
                      ? "border-madrak-primary bg-madrak-primary text-white shadow-md shadow-madrak-primary/25"
                      : current
                        ? "border-madrak-primary bg-white text-madrak-primary shadow-md shadow-madrak-primary/15 ring-4 ring-madrak-primary/10"
                        : "border-slate-200 bg-white text-slate-400",
                  )}
                >
                  {done ? (
                    <Check className="h-5 w-5" strokeWidth={2.5} />
                  ) : (
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  )}
                </span>
                <span
                  className={clsx(
                    "mt-2 max-w-[4.5rem] truncate text-center text-[11px] font-medium leading-tight",
                    current || done ? "text-madrak-primary" : "text-slate-400",
                  )}
                >
                  {step.shortLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
