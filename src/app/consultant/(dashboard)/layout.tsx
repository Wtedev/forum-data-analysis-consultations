import { redirect } from "next/navigation";

import { ConsultantBanner } from "@/components/consultant/consultant-banner";
import { getAdminSession } from "@/lib/admin-auth";

export const metadata = {
  title: "واجهة المستشار | ملتقى تحليل البيانات في القطاع غير الربحي 2",
};

export default async function ConsultantDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login?next=/consultant");
  }
  if (session.role === "ADMIN") {
    redirect("/admin");
  }
  if (session.role !== "CONSULTANT" || !session.consultantId) {
    redirect("/admin/login");
  }

  return (
    <main className="min-h-dvh overflow-x-clip bg-[#f3f4fb] px-4 py-5 text-[#1c1c1c] sm:px-6 sm:py-6 lg:py-10">
      <div className="mx-auto w-full min-w-0 max-w-6xl">
        <ConsultantBanner name={session.name} />
        {children}
      </div>
    </main>
  );
}
