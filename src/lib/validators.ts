import { z } from "zod";

import {
  CONSULTATION_TYPE_LABELS,
  CURRENT_STAGE_LABELS,
  GENDER_LABELS,
} from "@/lib/consultation-mappers";
import { isValidSaudiMobile, normalizePhone } from "@/lib/phone";

export const consultationFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "الاسم الثلاثي مطلوب")
    .refine(
      (value) => value.split(/\s+/).filter(Boolean).length >= 3,
      "أدخل الاسم الثلاثي كاملاً (ثلاثة أسماء على الأقل)",
    ),
  phone: z
    .string()
    .trim()
    .min(1, "رقم الجوال مطلوب")
    .transform(normalizePhone)
    .refine(isValidSaudiMobile, "أدخل رقم جوال سعودي صحيح مثل 05xxxxxxxx"),
  email: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || z.email().safeParse(value).success,
      "أدخل بريدًا إلكترونيًا صحيحًا",
    )
    .transform((value) => (value === "" ? undefined : value)),
  gender: z.enum(GENDER_LABELS, { message: "اختر الجنس" }),
  currentStage: z.enum(CURRENT_STAGE_LABELS, {
    message: "اختر المرحلة الحالية",
  }),
  university: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  majorInterest: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  consultationType: z.enum(CONSULTATION_TYPE_LABELS, {
    message: "اختر نوع الاستشارة",
  }),
  question: z
    .string()
    .trim()
    .min(10, "اكتب سؤالك أو استفسارك (10 أحرف على الأقل)")
    .max(5000, "النص طويل جداً"),
});

export type ConsultationFormInput = z.infer<typeof consultationFormSchema>;

export const consultationStep1Schema = consultationFormSchema.pick({
  fullName: true,
  phone: true,
  email: true,
  gender: true,
});

export const consultationStep2Schema = consultationFormSchema.pick({
  currentStage: true,
  university: true,
  majorInterest: true,
});

export const consultationStep3Schema = consultationFormSchema.pick({
  consultationType: true,
  question: true,
});

export const consultationStep4Schema = z.object({});

const consultationStepSchemas = [
  consultationStep1Schema,
  consultationStep2Schema,
  consultationStep3Schema,
  consultationStep4Schema,
] as const;

export function validateConsultationStep(
  stepIndex: number,
  data: unknown,
): Record<string, string> {
  const schema = consultationStepSchemas[stepIndex];
  if (!schema) {
    return {};
  }

  const result = schema.safeParse(data);
  if (result.success) {
    return {};
  }

  return formatZodErrors(result.error);
}

export function formatZodErrors(
  error: z.ZodError,
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }

  return fieldErrors;
}
