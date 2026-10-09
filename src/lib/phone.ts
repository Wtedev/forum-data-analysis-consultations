/**
 * Light normalization for Saudi mobile numbers (store as 05XXXXXXXX).
 */
export function normalizePhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");

  if (digits.startsWith("966")) {
    digits = `0${digits.slice(3)}`;
  }

  if (digits.length === 9 && digits.startsWith("5")) {
    digits = `0${digits}`;
  }

  return digits;
}

export function isValidSaudiMobile(phone: string): boolean {
  return /^05\d{8}$/.test(normalizePhone(phone));
}

export function whatsappUrl(phone: string, text?: string): string {
  const local = normalizePhone(phone);
  const international = local.startsWith("0") ? `966${local.slice(1)}` : local;
  const base = `https://wa.me/${international}`;
  const message = text?.trim();
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export function consultationWhatsappMessage(input: {
  fullName: string;
  referenceCode: string;
  consultationTypeLabel: string;
  question: string;
  currentStageLabel?: string | null;
  university?: string | null;
  majorInterest?: string | null;
  tools?: string[];
  link?: string | null;
}): string {
  const lines = [
    `السلام عليكم ${input.fullName}،`,
    "",
    "معك مستشار من ملتقى تحليل البيانات في القطاع غير الربحي، وأتواصل معك لمتابعة استشارتك.",
    "",
    `رقم الاستشارة: ${input.referenceCode}`,
    `نوع الاستشارة: ${input.consultationTypeLabel}`,
  ];

  if (input.currentStageLabel) lines.push(`الصفة: ${input.currentStageLabel}`);
  if (input.university?.trim()) lines.push(`الجهة: ${input.university.trim()}`);
  if (input.majorInterest?.trim()) lines.push(`المجال: ${input.majorInterest.trim()}`);
  if (input.tools?.length) lines.push(`الأدوات: ${input.tools.join("، ")}`);

  lines.push("", "نص الاستشارة:", input.question.trim());

  if (input.link?.trim()) lines.push("", `رابط البيانات: ${input.link.trim()}`);

  lines.push("", "يسعدني خدمتك. إن كان لديك توضيح أو ملفات إضافية، أرسلها في هذه المحادثة.");

  return lines.join("\n");
}
