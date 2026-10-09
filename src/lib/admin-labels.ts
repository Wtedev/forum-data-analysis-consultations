import type {
  ConsultationStatus,
  CurrentStage,
  ConsultationType,
  Gender,
  PreferredContactMethod,
  Priority,
} from "@prisma/client";

export const STATUS_LABELS: Record<ConsultationStatus, string> = {
  NEW: "جديد",
  IN_REVIEW: "قيد المراجعة",
  CONTACTED: "تم التواصل",
  ANSWERED: "تمت الإجابة",
  NEEDS_FOLLOW_UP: "يحتاج متابعة",
  CLOSED: "مغلق",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  NORMAL: "عادي",
  MEDIUM: "متوسط",
  HIGH: "عالي",
};

export const GENDER_DB_LABELS: Record<Gender, string> = {
  MALE: "ذكر",
  FEMALE: "أنثى",
};

export const STAGE_DB_LABELS: Record<CurrentStage, string> = {
  INDIVIDUAL: "فرد",
  RESEARCHER: "باحث",
  EMPLOYEE: "موظف",
  BUSINESS_OWNER: "صاحب منشأة",
  OTHER: "أخرى",
};

export const TYPE_DB_LABELS: Record<ConsultationType, string> = {
  STATISTICAL_ANALYSIS: "التحليل الإحصائي",
  DATA_CLEANING: "تنظيف البيانات وتجهيزها",
  DASHBOARDS_AND_REPORTS: "لوحات المعلومات والتقارير",
  SURVEY_DESIGN: "تصميم الاستبانات",
  TOOL_SELECTION: "اختيار الأداة المناسبة",
  RESULTS_INTERPRETATION: "تفسير النتائج",
  OTHER: "أخرى",
};

export const CONTACT_DB_LABELS: Record<PreferredContactMethod, string> = {
  WHATSAPP: "واتساب",
  CALL: "اتصال",
};

export const ALL_STATUSES = [
  "NEW",
  "IN_REVIEW",
  "CONTACTED",
  "ANSWERED",
  "NEEDS_FOLLOW_UP",
  "CLOSED",
] as [ConsultationStatus, ...ConsultationStatus[]];

export const ALL_PRIORITIES = ["NORMAL", "MEDIUM", "HIGH"] as [Priority, ...Priority[]];

export function formatDateTime(value: Date | string) {
  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
