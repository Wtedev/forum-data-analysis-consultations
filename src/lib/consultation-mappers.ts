import type {
  ConsultationType,
  CurrentStage,
  Gender,
  PreferredContactMethod,
} from "@prisma/client";

export const GENDER_LABELS = ["ذكر", "أنثى"] as const;
export const CURRENT_STAGE_LABELS = [
  "ثانوي",
  "مستجد جامعي",
  "طالب جامعي",
] as const;
export const CONSULTATION_TYPE_LABELS = [
  "اختيار التخصص",
  "التحويل بين التخصصات",
  "التهيئة للحياة الجامعية",
  "الفرص التطوعية والأنشطة",
  "التدريب والتطوير",
  "أخرى",
] as const;
export const CONTACT_METHOD_LABELS = ["واتساب", "اتصال"] as const;

export type GenderLabel = (typeof GENDER_LABELS)[number];
export type CurrentStageLabel = (typeof CURRENT_STAGE_LABELS)[number];
export type ConsultationTypeLabel = (typeof CONSULTATION_TYPE_LABELS)[number];
export type ContactMethodLabel = (typeof CONTACT_METHOD_LABELS)[number];

const genderMap: Record<GenderLabel, Gender> = {
  ذكر: "MALE",
  أنثى: "FEMALE",
};

const currentStageMap: Record<CurrentStageLabel, CurrentStage> = {
  ثانوي: "HIGH_SCHOOL",
  "مستجد جامعي": "NEW_UNIVERSITY_STUDENT",
  "طالب جامعي": "UNIVERSITY_STUDENT",
};

const consultationTypeMap: Record<ConsultationTypeLabel, ConsultationType> = {
  "اختيار التخصص": "MAJOR_SELECTION",
  "التحويل بين التخصصات": "MAJOR_TRANSFER",
  "التهيئة للحياة الجامعية": "UNIVERSITY_LIFE_PREPARATION",
  "الفرص التطوعية والأنشطة": "VOLUNTEERING_AND_ACTIVITIES",
  "التدريب والتطوير": "TRAINING_AND_DEVELOPMENT",
  أخرى: "OTHER",
};

const contactMethodMap: Record<ContactMethodLabel, PreferredContactMethod> = {
  واتساب: "WHATSAPP",
  اتصال: "CALL",
};

export function mapGender(label: GenderLabel): Gender {
  return genderMap[label];
}

export function mapCurrentStage(label: CurrentStageLabel): CurrentStage {
  return currentStageMap[label];
}

export function mapConsultationType(label: ConsultationTypeLabel): ConsultationType {
  return consultationTypeMap[label];
}

export function mapContactMethod(
  label: ContactMethodLabel,
): PreferredContactMethod {
  return contactMethodMap[label];
}
