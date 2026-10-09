import { ConsultationWizard } from "@/components/consultation/wizard";
import { listPublicConsultantOptions } from "@/lib/consultant-directory";
import { CONSULTANTS } from "@/lib/consultants";

export const metadata = {
  title: "طلب استشارة | ملتقى تحليل البيانات في القطاع غير الربحي 2",
  description:
    "نموذج طلب استشارات تحليل البيانات — ملتقى تحليل البيانات في القطاع غير الربحي 2.",
};

export default async function ConsultationPage() {
  const consultants = await listPublicConsultantOptions().catch((error) => {
    console.error("Failed to load consultant choices", error);
    return CONSULTANTS.map((item) => ({ id: item.id, label: item.label }));
  });

  return (
    <main className="kf-page min-h-full px-4 py-6 sm:px-6 sm:py-10 lg:py-12">
      <ConsultationWizard consultants={consultants} />
    </main>
  );
}
