export const CONSULTANTS = [
  {
    id: "NO_PREFERENCE",
    label: "ليس لدي تفضيل معين",
    shortLabel: "بدون تفضيل",
  },
  {
    id: "ABDALSALAM_ALSAGHEER",
    label: "مستشار مخصص (م.عبدالسلام الصغير)",
    shortLabel: "م.عبدالسلام الصغير",
  },
] as const;

export type ConsultantId = (typeof CONSULTANTS)[number]["id"];
export type ConsultantLabel = (typeof CONSULTANTS)[number]["label"];

export const CONSULTANT_LABELS = CONSULTANTS.map((item) => item.label) as [
  ConsultantLabel,
  ...ConsultantLabel[],
];

const consultantIdByLabel = Object.fromEntries(
  CONSULTANTS.map((item) => [item.label, item.id]),
) as Record<ConsultantLabel, ConsultantId>;

const consultantById = Object.fromEntries(
  CONSULTANTS.map((item) => [item.id, item]),
) as Record<ConsultantId, (typeof CONSULTANTS)[number]>;

export function mapConsultant(label: ConsultantLabel): ConsultantId {
  return consultantIdByLabel[label];
}

export function consultantLabel(id: string): string {
  if (id in consultantById) {
    return consultantById[id as ConsultantId].label;
  }
  return id;
}

export function consultantShortLabel(id: string): string {
  if (id in consultantById) {
    return consultantById[id as ConsultantId].shortLabel;
  }
  return id;
}
