import "server-only";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(input: SendEmailInput): Promise<{ ok: true } | { ok: false; message: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set");
    return { ok: false, message: "خدمة البريد غير مهيأة" };
  }

  const from = process.env.RESEND_FROM_EMAIL?.trim() || "ملتقى تحليل البيانات <onboarding@resend.dev>";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        html: input.html,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("Resend rejected the email", response.status, detail);
      if (/domain|verify|testing emails/i.test(detail)) {
        return {
          ok: false,
          message: "تعذر الإرسال. وثّق نطاق البريد في Resend ثم حدّث عنوان المرسل.",
        };
      }
      return { ok: false, message: "تعذر إرسال البريد" };
    }

    return { ok: true };
  } catch (error) {
    console.error("Resend request failed", error);
    return { ok: false, message: "تعذر الاتصال بخدمة البريد" };
  }
}
