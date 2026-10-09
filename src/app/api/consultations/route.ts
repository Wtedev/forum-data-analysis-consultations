import { NextResponse } from "next/server";

import { resolveConsultantChoice } from "@/lib/consultant-directory";
import { notifyConsultationCreated } from "@/lib/consultation-mail";
import {
  mapConsultationType,
  mapCurrentStage,
  mapGender,
} from "@/lib/consultation-mappers";
import { generateReferenceCode } from "@/lib/reference-code";
import { getPrisma } from "@/lib/prisma";
import {
  consultationFormSchema,
  formatZodErrors,
} from "@/lib/validators";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "طلب غير صالح",
      },
      { status: 400 },
    );
  }

  const parsed = consultationFormSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        errors: formatZodErrors(parsed.error),
      },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const preferredConsultant = await resolveConsultantChoice(data.preferredConsultant);
  if (!preferredConsultant) {
    return NextResponse.json(
      {
        success: false,
        errors: { preferredConsultant: "اختر المستشار أو عدم التفضيل" },
      },
      { status: 400 },
    );
  }

  try {
    const created = await getPrisma().$transaction(async (tx) => {
      const code = await generateReferenceCode(tx);

      const consultation = await tx.consultation.create({
        data: {
          referenceCode: code,
          fullName: data.fullName,
          phone: data.phone,
          email: data.email,
          gender: mapGender(data.gender),
          currentStage: mapCurrentStage(data.currentStage),
          university: data.university,
          majorInterest: data.majorInterest,
          consultationType: mapConsultationType(data.consultationType),
          preferredConsultant,
          tools: data.tools,
          question: data.question,
          link: data.link,
          preferredContactMethod: "WHATSAPP",
        },
      });

      await tx.notification.create({
        data: {
          type: "NEW_CONSULTATION",
          title: "طلب استشارة جديد",
          message: `طلب استشارة جديد من ${data.fullName} — الرقم المرجعي: ${code}`,
          consultationId: consultation.id,
        },
      });

      await tx.activityLog.create({
        data: {
          actionType: "CONSULTATION_CREATED",
          description: `تم إنشاء طلب استشارة برقم مرجعي ${code}`,
          consultationId: consultation.id,
        },
      });

      return consultation;
    });

    await notifyConsultationCreated({
      id: created.id,
      referenceCode: created.referenceCode,
      fullName: created.fullName,
      email: created.email,
      consultationType: created.consultationType,
      preferredConsultant: created.preferredConsultant,
      assignedToId: created.assignedToId,
    });

    return NextResponse.json({
      success: true,
      referenceCode: created.referenceCode,
    });
  } catch (error) {
    console.error("Failed to create consultation:", error);

    return NextResponse.json(
      {
        success: false,
        message: "تعذر إرسال الطلب. حاول مرة أخرى لاحقًا.",
      },
      { status: 500 },
    );
  }
}
