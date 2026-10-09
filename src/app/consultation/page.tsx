import { connection } from "next/server";

import { ConsultationWizard } from "@/components/consultation/wizard";
import { listPublicConsultantOptions } from "@/lib/consultant-directory";
import { NO_PREFERENCE_CHOICE } from "@/lib/consultants";

export const metadata = {
  title: "طلب استشارة | ملتقى تحليل البيانات في القطاع غير الربحي 2",
  description:
    "نموذج طلب استشارات تحليل البيانات — ملتقى تحليل البيانات في القطاع غير الربحي 2.",
};

export default async function ConsultationPage() {
  await connection();
  const consultants = await listPublicConsultantOptions().catch((error) => {
    console.error("Failed to load consultant choices", error);
    return [NO_PREFERENCE_CHOICE];
  });

  return (
    <main className="kf-page min-h-full px-4 py-6 sm:px-6 sm:py-10 lg:py-12">
      <ConsultationWizard consultants={consultants} />
    </main>
  );
}
