import {
  BarChart3,
  Building2,
  Send,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export type FormStepId = 1 | 2 | 3 | 4;

export type FormStepConfig = {
  id: FormStepId;
  title: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
};

export const FORM_STEPS: FormStepConfig[] = [
  {
    id: 1,
    title: "البيانات الشخصية",
    shortLabel: "شخصي",
    description: "أخبرنا عن نفسك",
    icon: UserRound,
  },
  {
    id: 2,
    title: "بيانات المستفيد",
    shortLabel: "المستفيد",
    description: "صفتك وجهتك ومجالك",
    icon: Building2,
  },
  {
    id: 3,
    title: "نوع الاستشارة",
    shortLabel: "الاستشارة",
    description: "تفاصيل طلبك في تحليل البيانات",
    icon: BarChart3,
  },
  {
    id: 4,
    title: "مراجعة وإرسال",
    shortLabel: "مراجعة",
    description: "راجع بياناتك وأكد إرسال الطلب",
    icon: Send,
  },
];

export const SUCCESS_STEP = {
  id: 5 as const,
  title: "تم استلام الطلب",
  description: "شكرًا لتواصلك معنا",
};
