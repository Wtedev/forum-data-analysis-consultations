import { ConsultationWizard } from "@/components/consultation/wizard";

export const metadata = {
  title: "طلب استشارة | ملتقى تحليل البيانات في القطاع غير الربحي 2",
  description:
    "نموذج طلب استشارات تحليل البيانات — ملتقى تحليل البيانات في القطاع غير الربحي 2.",
};

export default function ConsultationPage() {
  return (
    <main className="kf-page min-h-full px-4 py-6 sm:px-6 sm:py-10 lg:py-12">
      <ConsultationWizard />
    </main>
  );
}
