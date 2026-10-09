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
  consultantName: string;
  referenceCode: string;
  question: string;
  link?: string | null;
}): string {
  const lines = [
    `السلام عليكم ${input.fullName}،`,
    "",
    `معك مستشار ملتقى تحليل البيانات في القطاع غير الربحي ${input.consultantName}، وأتواصل معك لمتابعة استشارتك.`,
    "",
    `رقم الاستشارة: ${input.referenceCode}`,
    "نص الاستشارة:",
    input.question.trim(),
  ];

  if (input.link?.trim()) lines.push("", `رابط البيانات: ${input.link.trim()}`);

  lines.push(
    "",
    "تسعدني مساعدتك إن كان لديك توضيح أو ملفات إضافية، فضلاً إرسالها في هذه المحادثة.",
    "",
    "جمعية كفاءات الأهلية لبناء قدرات الشباب",
  );

  return lines.join("\n");
}
