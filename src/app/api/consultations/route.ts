import { NextResponse } from "next/server";

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

  try {
    const referenceCode = await getPrisma().$transaction(async (tx) => {
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
          question: data.question,
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

      return code;
    });

    return NextResponse.json({
      success: true,
      referenceCode,
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
