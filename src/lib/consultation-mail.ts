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
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function layout(body: string) {
  return `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;background:#f4f6f8;padding:24px;color:#111827">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e6e8ec;border-radius:16px;padding:24px;line-height:1.8">
      ${body}
      <p style="margin:24px 0 0;color:#6b7280;font-size:13px">ملتقى تحليل البيانات في القطاع غير الربحي 2</p>
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

async function consultantRecipient(preferredConsultant: string) {
  if (preferredConsultant === "NO_PREFERENCE") {
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    return adminEmail ? { email: adminEmail, name: "إدارة الملتقى", missingAccount: false, unassigned: true } : null;
  }

  const account = await getPrisma().adminUser.findFirst({
    where: { role: "CONSULTANT", consultantKey: preferredConsultant },
    select: { email: true, name: true },
  });

  if (account) {
    return { email: account.email, name: account.name, missingAccount: false, unassigned: false };
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail) return null;
  return { email: adminEmail, name: "إدارة الملتقى", missingAccount: true, unassigned: false };
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
  const recipient = await consultantRecipient(consultation.preferredConsultant);
  if (!recipient) return;

  const safeName = escapeHtml(recipient.name);
  const safeApplicant = escapeHtml(consultation.fullName);
  const safeType = escapeHtml(typeLabel);
  const safeRef = escapeHtml(consultation.referenceCode);
  const deskUrl = recipient.unassigned || recipient.missingAccount ? `${appUrl()}/admin` : `${appUrl()}/consultant`;

  if (recipient.unassigned) {
    await sendEmail({
      to: recipient.email,
      subject: "طلب استشارة بدون تفضيل مستشار",
      html: layout(`<p>مرحباً ${safeName}،</p>
        <p>وصل طلب جديد بلا تفضيل مستشار.</p>
        <p>صاحب الطلب: ${safeApplicant}<br>نوع الاستشارة: ${safeType}<br>الرقم المرجعي: ${safeRef}</p>
        <p><a href="${escapeHtml(deskUrl)}">فتح إدارة الطلبات</a></p>`),
    });
    return;
  }

  if (recipient.missingAccount) {
    const label = escapeHtml(consultantShortLabel(consultation.preferredConsultant));
    await sendEmail({
      to: recipient.email,
      subject: "طلب استشارة بانتظار حساب المستشار",
      html: layout(`<p>مرحباً ${safeName}،</p>
        <p>وصل طلب يفضّل ${label}، ولا يوجد حساب مفعّل لهذا المستشار بعد. يمكن إرسال دعوة من صفحة الإدارة.</p>
        <p>صاحب الطلب: ${safeApplicant}<br>نوع الاستشارة: ${safeType}<br>الرقم المرجعي: ${safeRef}</p>
        <p><a href="${escapeHtml(deskUrl)}">فتح إدارة الطلبات</a></p>`),
    });
    return;
  }

  await sendEmail({
    to: recipient.email,
    subject: "طلب استشارة جديد",
    html: layout(`<p>مرحباً ${safeName}،</p>
      <p>وصل طلب استشارة جديد يفضّلك مستشاراً.</p>
      <p>صاحب الطلب: ${safeApplicant}<br>نوع الاستشارة: ${safeType}<br>الرقم المرجعي: ${safeRef}</p>
      <p><a href="${escapeHtml(deskUrl)}">فتح واجهة المستشار</a></p>`),
  });
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
  const recipient = await consultantRecipient(consultation.preferredConsultant);
  if (!recipient || recipient.unassigned) return;

  const label = STATUS_LABELS[status];
  const deskPath = recipient.missingAccount ? "/admin" : `/consultant/consultations/${consultation.id}`;
  const deskUrl = `${appUrl()}${deskPath}`;
  const intro = recipient.missingAccount
    ? `تغيّرت حالة طلب ${escapeHtml(consultantShortLabel(consultation.preferredConsultant))}، ولا يوجد له حساب بعد.`
    : `تغيّرت حالة طلب يفضّلك مستشاراً.`;

  await sendEmail({
    to: recipient.email,
    subject: `تحديث حالة الطلب ${consultation.referenceCode}`,
    html: layout(`<p>مرحباً ${escapeHtml(recipient.name)}،</p>
      <p>${intro}</p>
      <p>صاحب الطلب: ${escapeHtml(consultation.fullName)}<br>الرقم المرجعي: ${escapeHtml(consultation.referenceCode)}<br>الحالة: ${escapeHtml(label)}</p>
      <p>${escapeHtml(consultantStatusLine(status))}</p>
      <p><a href="${escapeHtml(deskUrl)}">فتح الطلب</a></p>`),
  });
}

export function inviteEmail(input: { name: string; acceptUrl: string }) {
  return {
    subject: "دعوة للانضمام كمستشار",
    html: layout(`<p>مرحباً ${escapeHtml(input.name)}،</p>
      <p>دعاك فريق ملتقى تحليل البيانات في القطاع غير الربحي 2 للدخول إلى واجهة المستشار.</p>
      <p>الرابط صالح لمدة 7 أيام. بعد تعيين كلمة المرور تظهر لك الطلبات التي فضّلتك مستشاراً.</p>
      <p><a href="${escapeHtml(input.acceptUrl)}">قبول الدعوة وتعيين كلمة المرور</a></p>`),
  };
}
