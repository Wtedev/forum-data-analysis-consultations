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
    <main className="flex min-h-dvh flex-col overflow-x-clip bg-[#f3f4fb] px-4 py-5 text-[#1c1c1c] sm:px-6 sm:py-6 lg:py-10">
      <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-1 flex-col">
        <ConsultantBanner name={session.name} />
        <div className="flex-1">{children}</div>
        <p className="mt-10 text-center text-xs font-medium leading-5 text-[#8b93ab]">
          جميع الحقوق محفوظة لجمعية كفاءات الأهلية
        </p>
      </div>
    </main>
  );
}
