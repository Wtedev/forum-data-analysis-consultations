import "server-only";

import type { ConsultationStatus, ConsultationType } from "@prisma/client";

import { STATUS_LABELS, TYPE_DB_LABELS } from "@/lib/admin-labels";
import { appUrl } from "@/lib/app-url";
import { consultantShortLabel } from "@/lib/consultants";
import { sendEmail } from "@/lib/mail";
import { getPrisma } from "@/lib/prisma";

const APPLICANT_STATUSES = new Set<ConsultationStatus>([
  "CONTACTED",
  "ANSWERED",
  "NEEDS_FOLLOW_UP",
  "CLOSED",
]);

type ConsultationMailContext = {
  id: string;
  referenceCode: string;
  fullName: string;
  email: string | null;
  consultationType: ConsultationType;
  preferredConsultant: string;
  assignedToId?: string | null;
};

type StaffRecipient = {
  email: string;
  name: string;
  deskPath: string;
  pool: boolean;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function layout(body: string, footer = true) {
  return `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;background:#f4f6f8;padding:24px;color:#111827">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e6e8ec;border-radius:16px;padding:24px;line-height:1.8">
      ${body}
      ${footer ? `<p style="margin:24px 0 0;color:#6b7280;font-size:13px">ملتقى تحليل البيانات في القطاع غير الربحي 2</p>` : ""}
    </div>
  </div>`;
}

function applicantCopy(status: "NEW" | ConsultationStatus, name: string, referenceCode: string, typeLabel: string) {
  const safeName = escapeHtml(name);
  const safeRef = escapeHtml(referenceCode);
  const safeType = escapeHtml(typeLabel);

  if (status === "NEW") {
    return {
      subject: "تم استلام طلب استشارتك",
      html: layout(`<p>مرحباً ${safeName}،</p>
        <p>استلمنا طلبك في ملتقى تحليل البيانات في القطاع غير الربحي 2.</p>
        <p>رقم الطلب: ${safeRef}<br>نوع الاستشارة: ${safeType}</p>
        <p>سيراجع الفريق الطلب ونتواصل معك على الجوال أو الواتساب.</p>`),
    };
  }

  if (status === "CONTACTED") {
    return {
      subject: "تم التواصل بخصوص طلبك",
      html: layout(`<p>مرحباً ${safeName}،</p>
        <p>تواصلنا معك بخصوص الطلب ${safeRef}.</p>
        <p>إذا لم تصلك الرسالة على الواتساب أو الاتصال، رد على هذا البريد.</p>`),
    };
  }

  if (status === "ANSWERED") {
    return {
      subject: "تمت الإجابة على استشارتك",
      html: layout(`<p>مرحباً ${safeName}،</p>
        <p>أجبنا على استشارتك رقم ${safeRef}.</p>
        <p>تفاصيل الإجابة وصلت عبر وسيلة التواصل التي اخترتها. إذا بقي سؤال عن نفس الطلب، رد على هذه الرسالة.</p>`),
    };
  }

  if (status === "NEEDS_FOLLOW_UP") {
    return {
      subject: "نحتاج معلومات إضافية",
      html: layout(`<p>مرحباً ${safeName}،</p>
        <p>طلبك ${safeRef} يحتاج متابعة قبل إكمال الاستشارة.</p>
        <p>نرجو الرد على الواتساب أو الاتصال حتى نكمل معك.</p>`),
    };
  }

  if (status === "CLOSED") {
    return {
      subject: "تم إغلاق طلب الاستشارة",
      html: layout(`<p>مرحباً ${safeName}،</p>
        <p>أُغلق الطلب ${safeRef}.</p>
        <p>إذا احتجت استشارة جديدة يمكنك تقديم طلب آخر من الموقع.</p>`),
    };
  }

  return null;
}

function consultantStatusLine(status: ConsultationStatus) {
  if (status === "CONTACTED") return "سُجّل أن التواصل مع صاحب الطلب تم.";
  if (status === "ANSWERED") return "سُجّل أن الاستشارة أُجيبت.";
  if (status === "NEEDS_FOLLOW_UP") return "الطلب يحتاج متابعة.";
  if (status === "CLOSED") return "أُغلق الطلب.";
  return `الحالة الآن: ${STATUS_LABELS[status]}.`;
}

async function staffRecipients(consultation: ConsultationMailContext): Promise<StaffRecipient[]> {
  if (consultation.assignedToId) {
    const assignee = await getPrisma().adminUser.findFirst({
      where: { id: consultation.assignedToId, role: "CONSULTANT" },
      select: { email: true, name: true },
    });
    if (assignee) {
      return [{
        email: assignee.email,
        name: assignee.name,
        deskPath: `/consultant/consultations/${consultation.id}`,
        pool: false,
      }];
    }
  }

  if (consultation.preferredConsultant === "NO_PREFERENCE") {
    const consultants = await getPrisma().adminUser.findMany({
      where: { role: "CONSULTANT", consultantKey: { not: null } },
      select: { email: true, name: true },
    });
    const recipients: StaffRecipient[] = consultants.map((consultant) => ({
      email: consultant.email,
      name: consultant.name,
      deskPath: "/consultant",
      pool: true,
    }));
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    if (adminEmail) {
      recipients.push({
        email: adminEmail,
        name: "إدارة الملتقى",
        deskPath: "/admin",
        pool: true,
      });
    }
    return recipients;
  }

  const account = await getPrisma().adminUser.findFirst({
    where: { role: "CONSULTANT", consultantKey: consultation.preferredConsultant },
    select: { email: true, name: true },
  });
  if (account) {
    return [{
      email: account.email,
      name: account.name,
      deskPath: `/consultant/consultations/${consultation.id}`,
      pool: false,
    }];
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail) return [];
  return [{
    email: adminEmail,
    name: "إدارة الملتقى",
    deskPath: "/admin",
    pool: false,
  }];
}

export async function notifyConsultationCreated(consultation: ConsultationMailContext) {
  try {
    const typeLabel = TYPE_DB_LABELS[consultation.consultationType];
    const tasks: Promise<unknown>[] = [];

    const receipt = applicantCopy("NEW", consultation.fullName, consultation.referenceCode, typeLabel);
    if (consultation.email && receipt) {
      tasks.push(sendEmail({ to: consultation.email, subject: receipt.subject, html: receipt.html }));
    }

    tasks.push(sendStaffNewRequest(consultation, typeLabel));
    await Promise.all(tasks);
  } catch (error) {
    console.error("Failed to send consultation emails", error);
  }
}

async function sendStaffNewRequest(consultation: ConsultationMailContext, typeLabel: string) {
  const recipients = await staffRecipients(consultation);
  const safeApplicant = escapeHtml(consultation.fullName);
  const safeType = escapeHtml(typeLabel);
  const safeRef = escapeHtml(consultation.referenceCode);
  const missingAccount = consultation.preferredConsultant !== "NO_PREFERENCE" && recipients.every((item) => item.deskPath === "/admin");

  await Promise.all(recipients.map((recipient) => {
    const deskUrl = `${appUrl()}${recipient.deskPath}`;
    if (recipient.pool && recipient.deskPath === "/admin") {
      return sendEmail({
        to: recipient.email,
        subject: "طلب استشارة بدون تفضيل مستشار",
        html: layout(`<p>مرحباً ${escapeHtml(recipient.name)}،</p>
          <p>وصل طلب جديد بلا تفضيل مستشار، ويظهر لكل المستشارين حتى يختاره أحدهم أو تسنده الإدارة.</p>
          <p>صاحب الطلب: ${safeApplicant}<br>نوع الاستشارة: ${safeType}<br>الرقم المرجعي: ${safeRef}</p>
          <p><a href="${escapeHtml(deskUrl)}">فتح إدارة الطلبات</a></p>`),
      });
    }

    if (recipient.pool) {
      return sendEmail({
        to: recipient.email,
        subject: "طلب استشارة متاح للاختيار",
        html: layout(`<p>مرحباً ${escapeHtml(recipient.name)}،</p>
          <p>وصل طلب بلا تفضيل مستشار. يمكنك اختياره من واجهتك، ويختفي عندها من بقية المستشارين.</p>
          <p>صاحب الطلب: ${safeApplicant}<br>نوع الاستشارة: ${safeType}<br>الرقم المرجعي: ${safeRef}</p>
          <p><a href="${escapeHtml(deskUrl)}">فتح واجهة المستشار</a></p>`),
      });
    }

    if (missingAccount) {
      const label = escapeHtml(consultantShortLabel(consultation.preferredConsultant));
      return sendEmail({
        to: recipient.email,
        subject: "طلب استشارة بانتظار حساب المستشار",
        html: layout(`<p>مرحباً ${escapeHtml(recipient.name)}،</p>
          <p>وصل طلب يفضّل ${label}، ولا يوجد حساب مفعّل لهذا المستشار بعد.</p>
          <p>صاحب الطلب: ${safeApplicant}<br>نوع الاستشارة: ${safeType}<br>الرقم المرجعي: ${safeRef}</p>
          <p><a href="${escapeHtml(deskUrl)}">فتح إدارة الطلبات</a></p>`),
      });
    }

    return sendEmail({
      to: recipient.email,
      subject: "طلب استشارة جديد",
      html: layout(`<p>مرحباً ${escapeHtml(recipient.name)}،</p>
        <p>وصل طلب استشارة جديد يفضّلك مستشاراً.</p>
        <p>صاحب الطلب: ${safeApplicant}<br>نوع الاستشارة: ${safeType}<br>الرقم المرجعي: ${safeRef}</p>
        <p><a href="${escapeHtml(deskUrl)}">فتح الطلب</a></p>`),
    });
  }));
}

export async function notifyStatusChanged(consultation: ConsultationMailContext, status: ConsultationStatus) {
  if (!APPLICANT_STATUSES.has(status)) return;

  try {
    const typeLabel = TYPE_DB_LABELS[consultation.consultationType];
    const tasks: Promise<unknown>[] = [];
    const applicant = applicantCopy(status, consultation.fullName, consultation.referenceCode, typeLabel);

    if (consultation.email && applicant) {
      tasks.push(sendEmail({ to: consultation.email, subject: applicant.subject, html: applicant.html }));
    }

    tasks.push(sendStaffStatus(consultation, status));
    await Promise.all(tasks);
  } catch (error) {
    console.error("Failed to send status emails", error);
  }
}

async function sendStaffStatus(consultation: ConsultationMailContext, status: ConsultationStatus) {
  const recipients = (await staffRecipients(consultation)).filter((recipient) => recipient.deskPath !== "/admin" || !recipient.pool);
  const label = STATUS_LABELS[status];

  await Promise.all(recipients.map((recipient) => {
    const deskUrl = `${appUrl()}${recipient.deskPath}`;
    const intro = recipient.pool
      ? "تغيّرت حالة طلب متاح للاختيار."
      : "تغيّرت حالة طلب ظاهر في واجهتك.";
    return sendEmail({
      to: recipient.email,
      subject: `تحديث حالة الطلب ${consultation.referenceCode}`,
      html: layout(`<p>مرحباً ${escapeHtml(recipient.name)}،</p>
        <p>${intro}</p>
        <p>صاحب الطلب: ${escapeHtml(consultation.fullName)}<br>الرقم المرجعي: ${escapeHtml(consultation.referenceCode)}<br>الحالة: ${escapeHtml(label)}</p>
        <p>${escapeHtml(consultantStatusLine(status))}</p>
        <p><a href="${escapeHtml(deskUrl)}">فتح الطلب</a></p>`),
    });
  }));
}

export async function notifyConsultationAssigned(consultation: ConsultationMailContext) {
  if (!consultation.assignedToId) return;

  try {
    const recipients = await staffRecipients(consultation);
    const assignee = recipients.find((recipient) => recipient.deskPath.startsWith("/consultant"));
    if (!assignee) return;

    await sendEmail({
      to: assignee.email,
      subject: `أُسند إليك الطلب ${consultation.referenceCode}`,
      html: layout(`<p>مرحباً ${escapeHtml(assignee.name)}،</p>
        <p>أُسند إليك طلب ${escapeHtml(consultation.fullName)}، الرقم المرجعي ${escapeHtml(consultation.referenceCode)}.</p>
        <p>لن يظهر هذا الطلب لبقية المستشارين.</p>
        <p><a href="${escapeHtml(`${appUrl()}${assignee.deskPath}`)}">فتح الطلب</a></p>`),
    });
  } catch (error) {
    console.error("Failed to send assignment email", error);
  }
}

function inviteButton(href: string, label: string, tone: "primary" | "secondary") {
  const background = tone === "primary" ? "#5cc9b0" : "#ffffff";
  const color = tone === "primary" ? "#061223" : "#111827";
  const border = tone === "primary" ? "#5cc9b0" : "#d7dbe2";

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 8px">
    <tr>
      <td align="center" bgcolor="${background}" style="border-radius:12px;border:1px solid ${border};background-color:${background}">
        <a href="${href}" style="display:block;padding:14px 18px;font-family:Tahoma,Arial,sans-serif;font-size:16px;font-weight:700;line-height:1.4;color:${color};text-decoration:none;border-radius:12px">${label}</a>
      </td>
    </tr>
  </table>`;
}

export function inviteEmail(input: { name: string; acceptUrl: string; loginUrl: string }) {
  const name = escapeHtml(input.name);
  const acceptUrl = escapeHtml(input.acceptUrl);
  const loginUrl = escapeHtml(input.loginUrl);

  return {
    subject: "دعوة للانضمام إلى فريق المستشارين – ملتقى تحليل البيانات في القطاع غير الربحي 2",
    html: `<div dir="rtl" style="margin:0;padding:24px 12px;background:#f4f6f8;font-family:Tahoma,Arial,sans-serif;color:#111827">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e6e8ec;border-radius:20px;overflow:hidden">
        <div style="padding:28px 24px 0;text-align:center">
          <img src="${escapeHtml(`${appUrl()}/images/kafaat-logo.jpg`)}" alt="جمعية كفاءات الأهلية" width="132" height="132" style="display:inline-block;width:132px;height:132px;border:0;border-radius:18px">
        </div>
        <div style="padding:20px 24px 28px;font-size:16px;line-height:1.9">
          <p style="margin:0 0 12px">مرحباً ${name}،</p>
          <p style="margin:0 0 20px">يسعدنا انضمامك إلى فريق المستشارين في ملتقى تحليل البيانات في القطاع غير الربحي 2، وقد أُنشئ حسابك لاستقبال الاستشارات في منصة الاستشارات.</p>
          <p style="margin:0 0 16px;font-weight:700">لتفعيل حسابك:</p>
          <p style="margin:0 0 10px">أنشئ كلمة المرور من الزر التالي (صالح لمدة 7 أيام):</p>
          ${inviteButton(acceptUrl, "إنشاء كلمة المرور", "primary")}
          <p style="margin:18px 0 10px">سجّل الدخول ببريدك الإلكتروني نفسه وكلمة المرور التي اخترتها:</p>
          ${inviteButton(loginUrl, "تسجيل الدخول", "secondary")}
          <div style="margin:20px 0;padding:14px 16px;background:#f7f8fa;border:1px solid #e6e8ec;border-radius:12px;color:#374151">ستصلك رسالة على بريدك عند وصول أي طلب استشارة جديد.</div>
          <p style="margin:0 0 8px">شاكرين لك مشاركتك، ونتطلع إلى الاستفادة من خبراتك.</p>
          <p style="margin:16px 0 0;padding-top:16px;border-top:1px solid #e6e8ec">مع التحية،<br>فريق ملتقى تحليل البيانات في القطاع غير الربحي 2</p>
        </div>
      </div>
    </div>`,
  };
}

export function consultantLoginEmail(input: { name: string; loginUrl: string }) {
  return {
    subject: "رابط الدخول إلى واجهة المستشار",
    html: layout(`<p>مرحباً ${escapeHtml(input.name)}،</p>
      <p>تم تفعيل حسابك. ادخل من الرابط التالي باستخدام بريدك وكلمة المرور التي أنشأتها.</p>
      <p><a href="${escapeHtml(input.loginUrl)}">دخول المستشار</a></p>
      <p>كل استشارة جديدة تصل إليك يصلك عنها بريد.</p>`),
  };
}
