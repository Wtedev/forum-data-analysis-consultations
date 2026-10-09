import type {
  ConsultationType,
  CurrentStage,
  Gender,
  PreferredContactMethod,
} from "@prisma/client";

export const GENDER_LABELS = ["ذكر", "أنثى"] as const;
export const CURRENT_STAGE_LABELS = [
  "فرد",
  "باحث",
  "موظف",
  "صاحب منشأة",
  "أخرى",
] as const;
export const CONSULTATION_TYPE_LABELS = [
  "التحليل الإحصائي",
  "تنظيف البيانات وتجهيزها",
  "لوحات المعلومات والتقارير",
  "تصميم الاستبانات",
  "اختيار الأداة المناسبة",
  "تفسير النتائج",
  "أخرى",
] as const;
export const TOOL_LABELS = [
  "Excel",
  "Power BI",
  "SQL",
  "Python",
  "SPSS",
  "Tableau",
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
  فرد: "INDIVIDUAL",
  باحث: "RESEARCHER",
  موظف: "EMPLOYEE",
  "صاحب منشأة": "BUSINESS_OWNER",
  أخرى: "OTHER",
};

const consultationTypeMap: Record<ConsultationTypeLabel, ConsultationType> = {
  "التحليل الإحصائي": "STATISTICAL_ANALYSIS",
  "تنظيف البيانات وتجهيزها": "DATA_CLEANING",
  "لوحات المعلومات والتقارير": "DASHBOARDS_AND_REPORTS",
  "تصميم الاستبانات": "SURVEY_DESIGN",
  "اختيار الأداة المناسبة": "TOOL_SELECTION",
  "تفسير النتائج": "RESULTS_INTERPRETATION",
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
