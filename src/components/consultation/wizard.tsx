"use client";

import Image from "next/image";
import { useState } from "react";
import { CheckCircle2, Info } from "lucide-react";

import { MobileStepHeader } from "@/components/consultation/mobile-step-header";
import { MobileStepper } from "@/components/consultation/mobile-stepper";
import { ReviewSummary } from "@/components/consultation/review-summary";
import { StepFields } from "@/components/consultation/step-fields";
import { StepSidebar } from "@/components/consultation/step-sidebar";
import { FORM_STEPS } from "@/components/consultation/steps-config";
import {
  initialConsultationForm,
  type ConsultationFormState,
} from "@/components/consultation/types";
import { PrimaryButton, SecondaryButton } from "@/components/consultation/ui";
import { validateConsultationStep } from "@/lib/validators";

export function ConsultationWizard() {
  const [form, setForm] = useState<ConsultationFormState>(initialConsultationForm);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [referenceCode, setReferenceCode] = useState<string | null>(null);

  const isSuccess = referenceCode !== null;
  const stepConfig = FORM_STEPS.find((s) => s.id === currentStep);

  function updateField<K extends keyof ConsultationFormState>(
    key: K,
    value: ConsultationFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function validateStep(step: number): boolean {
    const stepErrors = validateConsultationStep(step - 1, form);
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  }

  function goNext() {
    if (!validateStep(currentStep)) return;

    setCompletedSteps((prev) => new Set(prev).add(currentStep));
    setCurrentStep((s) => Math.min(s + 1, 4));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setCurrentStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goToStep(step: number) {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit() {
    if (!validateStep(4)) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = (await response.json()) as {
        success: boolean;
        referenceCode?: string;
        errors?: Record<string, string>;
        message?: string;
      };

      if (!response.ok) {
        if (result.errors) {
          setErrors(result.errors);
          const firstErrorField = Object.keys(result.errors)[0];
          const stepMap: Record<string, number> = {
            fullName: 1,
            phone: 1,
            email: 1,
            gender: 1,
            currentStage: 2,
            university: 2,
            majorInterest: 2,
            consultationType: 3,
            question: 3,
          };
          setCurrentStep(stepMap[firstErrorField] ?? 1);
        } else {
          setSubmitError(result.message ?? "تعذر إرسال الطلب. حاول مرة أخرى.");
        }
        return;
      }

      if (result.success && result.referenceCode) {
        setReferenceCode(result.referenceCode);
        setCompletedSteps(new Set([1, 2, 3, 4]));
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {
      setSubmitError("تعذر الاتصال بالخادم. تحقق من اتصالك وحاول مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  }

  const formFooter = (
    <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between lg:flex-row lg:gap-3">
      {currentStep > 1 ? (
        <SecondaryButton
          onClick={goBack}
          disabled={submitting}
          className="w-full sm:w-auto lg:flex-1"
        >
          السابق
        </SecondaryButton>
      ) : (
        <span className="hidden lg:block lg:flex-1" />
      )}

      {currentStep < 4 ? (
        <PrimaryButton
          onClick={goNext}
          className="w-full sm:min-w-[140px] lg:flex-1"
        >
          التالي
        </PrimaryButton>
      ) : (
        <PrimaryButton
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full sm:min-w-[180px] lg:flex-1"
        >
          {submitting ? "جاري الإرسال..." : "إرسال طلب الاستشارة"}
        </PrimaryButton>
      )}
    </div>
  );

  const mobileFooter = !isSuccess && (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200/80 bg-[#f0f9f9]/95 px-4 py-4 backdrop-blur-md lg:hidden">
      <div className={currentStep > 1 ? "flex gap-3" : ""}>
        {currentStep > 1 ? (
          <SecondaryButton onClick={goBack} disabled={submitting} className="flex-1">
            السابق
          </SecondaryButton>
        ) : null}
        {currentStep < 4 ? (
          <PrimaryButton
            onClick={goNext}
            className={currentStep > 1 ? "flex-1" : "w-full"}
          >
            التالي
          </PrimaryButton>
        ) : (
          <PrimaryButton
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className={currentStep > 1 ? "flex-1" : "w-full"}
          >
            {submitting ? "جاري الإرسال..." : "إرسال الطلب"}
          </PrimaryButton>
        )}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl pb-28 lg:pb-0">
      {/* Mobile page header — matches desktop sidebar */}
      <header className="mb-5 -mx-4 -mt-6 overflow-hidden rounded-b-3xl bg-gradient-to-b from-madrak-primary to-[#056b6f] px-5 pb-6 pt-6 text-center text-white shadow-xl shadow-madrak-primary/20 sm:-mx-6 sm:-mt-10 sm:px-6 sm:pb-7 lg:hidden">
        <Image
          src="/images/madrak-logo.svg"
          alt="مدرك"
          width={100}
          height={40}
          className="mx-auto h-10 w-auto brightness-0 invert"
          priority
        />
        <p className="mt-5 text-sm font-medium text-white/80">بوصلتك الجامعية</p>
        <h1 className="mt-1 text-lg font-semibold leading-snug sm:text-xl">
          نموذج الاستشارات الأكاديمية
        </h1>
        <p className="mt-2 text-sm text-white/65">
          أكمل الخطوات لإرسال طلب الاستشارة
        </p>
        <div className="mt-5 flex justify-center">
          <span className="rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold text-white">
            {isSuccess
              ? "تم إرسال الطلب"
              : `الخطوة ${currentStep} من ${FORM_STEPS.length}`}
          </span>
        </div>
      </header>

      {/* Mobile progress — above card */}
      <div className="mb-5 px-1 lg:hidden">
        <MobileStepper
          currentStep={currentStep}
          completedSteps={completedSteps}
          isSuccess={isSuccess}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(280px,320px)_1fr] lg:gap-8">
        <StepSidebar
          currentStep={currentStep}
          completedSteps={completedSteps}
          isSuccess={isSuccess}
        />

        <div className="flex min-h-[480px] flex-col rounded-3xl bg-white p-5 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 sm:p-8 lg:min-h-[520px]">
          {isSuccess ? (
            <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-madrak-primary shadow-lg shadow-madrak-primary/30">
                <CheckCircle2
                  className="h-10 w-10 text-white"
                  strokeWidth={1.5}
                />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 sm:text-2xl">
                تم استلام طلبك بنجاح
              </h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600">
                شكرًا لتواصلك معنا. سيقوم فريق الاستشارات بمراجعة طلبك والتواصل معك
                قريبًا.
              </p>
              <div className="mt-8 w-full max-w-sm rounded-2xl border-2 border-dashed border-madrak-primary/25 bg-gradient-to-b from-madrak-primary/5 to-white px-6 py-6">
                <p className="text-xs font-medium text-slate-500">الرقم المرجعي لطلبك</p>
                <p className="mt-2 font-mono text-2xl font-bold tracking-wide text-madrak-primary">
                  {referenceCode}
                </p>
              </div>
              <p className="mt-6 max-w-md text-xs leading-relaxed text-slate-500">
                احتفظ بهذا الرقم لمتابعة طلبك. سيتم التواصل معك بعد مراجعة الطلب.
              </p>
            </div>
          ) : (
            <>
              {stepConfig ? (
                <MobileStepHeader
                  step={stepConfig}
                  variant={currentStep === 4 ? "review" : "default"}
                />
              ) : null}

              {currentStep === 1 ? (
                <div className="mb-5 flex gap-2.5 rounded-xl border border-madrak-primary/10 bg-madrak-primary/5 px-3.5 py-3 text-sm leading-relaxed text-slate-700">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-madrak-primary" aria-hidden />
                  <p>
                    الاستشارات الأكاديمية متاحة للمستفيدين بدون الحاجة إلى إنشاء
                    حساب.
                  </p>
                </div>
              ) : null}

              <div className="flex-1">
                <StepFields
                  step={currentStep}
                  form={form}
                  errors={errors}
                  onChange={updateField}
                />

                {currentStep === 4 ? (
                  <div className="mt-6">
                    <ReviewSummary
                      form={form}
                      editable
                      onEditStep={goToStep}
                      className="bg-white"
                    />
                    <p className="mt-4 text-center text-xs leading-relaxed text-slate-500 lg:text-start">
                      بالضغط على «إرسال الطلب» تؤكد صحة البيانات المدخلة.
                    </p>
                    <p className="mt-2 text-center text-xs text-slate-400 lg:text-start">
                      سيتم التواصل معك بعد مراجعة الطلب.
                    </p>
                  </div>
                ) : null}
              </div>

              {submitError ? (
                <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {submitError}
                </p>
              ) : null}

              <div className="hidden lg:block">{formFooter}</div>
            </>
          )}
        </div>
      </div>

      {mobileFooter}
    </div>
  );
}
