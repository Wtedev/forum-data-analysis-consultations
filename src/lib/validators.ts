import { z } from "zod";

import {
  CONSULTATION_TYPE_LABELS,
  CONTACT_METHOD_LABELS,
  CURRENT_STAGE_LABELS,
  GENDER_LABELS,
  TOOL_LABELS,
} from "@/lib/consultation-mappers";
import { isValidSaudiMobile, normalizePhone } from "@/lib/phone";

const consultationFormObject = z.object({
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
    .min(1, "البريد الإلكتروني مطلوب")
    .refine((value) => z.email().safeParse(value).success, "أدخل بريدًا إلكترونيًا صحيحًا"),
  gender: z.enum(GENDER_LABELS, { message: "اختر الجنس" }),
  currentStage: z.enum(CURRENT_STAGE_LABELS, {
    message: "اختر صفتك",
  }),
  projectOrTeamName: z
    .string()
    .trim()
    .max(200, "اسم المشروع أو الفريق طويل جداً")
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  teamMemberCount: z
    .union([z.string(), z.number()])
    .optional()
    .transform((value) => {
      if (value == null || value === "") return null;
      const count = typeof value === "number" ? value : Number(value);
      return Number.isInteger(count) ? count : Number.NaN;
    }),
  consultationType: z.enum(CONSULTATION_TYPE_LABELS, {
    message: "اختر نوع الاستشارة",
  }),
  preferredConsultant: z.string().trim().optional().transform((value) => value ?? ""),
  tools: z.array(z.enum(TOOL_LABELS)).default([]),
  question: z
    .string()
    .trim()
    .min(10, "اشرح التحدي الذي تواجهه (10 أحرف على الأقل)")
    .max(5000, "النص طويل جداً"),
  link: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || z.url().safeParse(value).success,
      "أدخل رابطًا صحيحًا يبدأ بـ https://",
    )
    .transform((value) => (value === "" ? undefined : value)),
  preferredContactMethod: z.enum(CONTACT_METHOD_LABELS, {
    message: "اختر طريقة التواصل المفضلة",
  }),
});

export const consultationFormSchema = consultationFormObject.superRefine((data, ctx) => {
  requireTeamMemberCount(data, ctx);
});

export type ConsultationFormInput = z.infer<typeof consultationFormSchema>;

export const consultationStep1Schema = consultationFormObject.pick({
  fullName: true,
  phone: true,
  email: true,
  gender: true,
});

export const consultationStep2Schema = consultationFormObject
  .pick({
    currentStage: true,
    projectOrTeamName: true,
    teamMemberCount: true,
  })
  .superRefine((data, ctx) => {
    requireTeamMemberCount(data, ctx);
  });

export const consultationStep3Schema = consultationFormObject.pick({
  consultationType: true,
  preferredConsultant: true,
  tools: true,
  question: true,
  link: true,
  preferredContactMethod: true,
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

function requireTeamMemberCount(
  data: { currentStage?: string; teamMemberCount?: number | null },
  ctx: z.RefinementCtx,
) {
  if (data.currentStage !== "قائد فريق") return;
  const count = data.teamMemberCount;
  if (count == null || Number.isNaN(count) || count < 1 || count > 500) {
    ctx.addIssue({
      code: "custom",
      path: ["teamMemberCount"],
      message: "أدخل عدد أعضاء الفريق",
    });
  }
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
