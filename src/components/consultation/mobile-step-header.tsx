"use client";

import { clsx } from "clsx";

import type { FormStepConfig } from "@/components/consultation/steps-config";

type MobileStepHeaderProps = {
  step: FormStepConfig;
  variant?: "default" | "review";
};

export function MobileStepHeader({ step, variant = "default" }: MobileStepHeaderProps) {
  const Icon = step.icon;

  return (
    <div
      className={clsx(
        "flex flex-col items-center text-center",
        variant === "review" ? "mb-5" : "mb-6",
      )}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
        <Icon className="h-7 w-7 text-madrak-primary" strokeWidth={1.75} />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-white">{step.title}</h2>
      <p className="mt-1 max-w-xs text-sm text-slate-400">{step.description}</p>
    </div>
  );
}
