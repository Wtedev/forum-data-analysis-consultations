import { ConsultationWizard } from "@/components/consultation/wizard";

export const metadata = {
  title: "طلب استشارة أكاديمية | بوصلتك الجامعية",
  description:
    "نموذج طلب الاستشارات الأكاديمية — بوصلتك الجامعية من مدرك.",
};

export default function ConsultationPage() {
  return (
    <main className="min-h-full bg-[#f0f9f9] px-4 py-6 sm:px-6 sm:py-10 lg:py-14">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_rgba(6,139,144,0.08),_transparent_50%),radial-gradient(ellipse_at_bottom_left,_rgba(252,197,101,0.12),_transparent_50%)]"
        aria-hidden
      />
      <ConsultationWizard />
    </main>
  );
}
