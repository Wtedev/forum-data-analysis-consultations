"use client";

import {
  CONSULTATION_TYPE_LABELS,
  CURRENT_STAGE_LABELS,
  GENDER_LABELS,
} from "@/lib/consultation-mappers";

import type { ConsultationFormState } from "@/components/consultation/types";
import {
  FormField,
  RadioOption,
  inputClassName,
} from "@/components/consultation/ui";

type StepFieldsProps = {
  step: number;
  form: ConsultationFormState;
  errors: Record<string, string>;
  onChange: <K extends keyof ConsultationFormState>(
    key: K,
    value: ConsultationFormState[K],
  ) => void;
};

export function StepFields({ step, form, errors, onChange }: StepFieldsProps) {
  if (step === 1) {
    return (
      <div className="space-y-5">
        <FormField
          label="الاسم الثلاثي"
          htmlFor="fullName"
          required
          error={errors.fullName}
        >
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            className={inputClassName}
            value={form.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            placeholder="مثال: محمد أحمد العلي"
          />
        </FormField>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            label="رقم الجوال"
            htmlFor="phone"
            required
            error={errors.phone}
          >
            <input
              id="phone"
              name="phone"
              type="tel"
              dir="ltr"
              className={`${inputClassName} text-left`}
              value={form.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              placeholder="05xxxxxxxx"
            />
          </FormField>

          <FormField label="البريد الإلكتروني" htmlFor="email" error={errors.email}>
            <input
              id="email"
              name="email"
              type="email"
              dir="ltr"
              className={`${inputClassName} text-left`}
              value={form.email}
              onChange={(e) => onChange("email", e.target.value)}
              placeholder="example@email.com"
            />
          </FormField>
        </div>

        <fieldset>
          <legend className="mb-3 block text-sm font-medium text-slate-700">
            الجنس <span className="text-madrak-primary">*</span>
          </legend>
          <div className="grid grid-cols-2 gap-3">
            {GENDER_LABELS.map((option) => (
              <RadioOption
                key={option}
                name="gender"
                value={option}
                label={option}
                checked={form.gender === option}
                onChange={() => onChange("gender", option)}
              />
            ))}
          </div>
          {errors.gender ? (
            <p className="mt-1.5 text-xs font-medium text-red-600">{errors.gender}</p>
          ) : null}
        </fieldset>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="space-y-5">
        <FormField
          label="المرحلة الحالية"
          htmlFor="currentStage"
          required
          error={errors.currentStage}
        >
          <select
            id="currentStage"
            name="currentStage"
            className={inputClassName}
            value={form.currentStage}
            onChange={(e) => onChange("currentStage", e.target.value)}
          >
            <option value="">اختر المرحلة</option>
            {CURRENT_STAGE_LABELS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </FormField>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="الجامعة" htmlFor="university" error={errors.university}>
            <input
              id="university"
              name="university"
              type="text"
              className={inputClassName}
              value={form.university}
              onChange={(e) => onChange("university", e.target.value)}
              placeholder="اسم الجامعة (إن وجد)"
            />
          </FormField>

          <FormField
            label="التخصص الحالي أو المهتم به"
            htmlFor="majorInterest"
            error={errors.majorInterest}
          >
            <input
              id="majorInterest"
              name="majorInterest"
              type="text"
              className={inputClassName}
              value={form.majorInterest}
              onChange={(e) => onChange("majorInterest", e.target.value)}
              placeholder="مثال: علوم الحاسب"
            />
          </FormField>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="space-y-5">
        <FormField
          label="نوع الاستشارة المطلوبة"
          htmlFor="consultationType"
          required
          error={errors.consultationType}
        >
          <select
            id="consultationType"
            name="consultationType"
            className={inputClassName}
            value={form.consultationType}
            onChange={(e) => onChange("consultationType", e.target.value)}
          >
            <option value="">اختر نوع الاستشارة</option>
            {CONSULTATION_TYPE_LABELS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="اكتب سؤالك أو استفسارك الأكاديمي"
          htmlFor="question"
          required
          hint="اشرح استفسارك بوضوح لنساعدك بأفضل شكل"
          error={errors.question}
        >
          <textarea
            id="question"
            name="question"
            rows={6}
            className={`${inputClassName} min-h-[140px] resize-y`}
            value={form.question}
            onChange={(e) => onChange("question", e.target.value)}
            placeholder="اكتب تفاصيل استفسارك هنا..."
          />
        </FormField>
      </div>
    );
  }

  return null;
}