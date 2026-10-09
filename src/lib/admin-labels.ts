import type {
  ConsultationStatus,
  ConsultationType,
  CurrentStage,
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
  HIGH_SCHOOL: "ثانوي",
  NEW_UNIVERSITY_STUDENT: "مستجد جامعي",
  UNIVERSITY_STUDENT: "طالب جامعي",
};

export const TYPE_DB_LABELS: Record<ConsultationType, string> = {
  MAJOR_SELECTION: "اختيار التخصص",
  MAJOR_TRANSFER: "التحويل بين التخصصات",
  UNIVERSITY_LIFE_PREPARATION: "التهيئة للحياة الجامعية",
  VOLUNTEERING_AND_ACTIVITIES: "الفرص التطوعية والأنشطة",
  TRAINING_AND_DEVELOPMENT: "التدريب والتطوير",
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
