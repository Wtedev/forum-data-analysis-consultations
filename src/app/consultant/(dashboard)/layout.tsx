import { redirect } from "next/navigation";

import { AdminHeader } from "@/components/admin/admin-header";
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
    <main className="min-h-dvh bg-[#f6f7f9] px-4 py-6 text-[#1c1c1c] sm:px-6 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <AdminHeader
          adminName={session.name}
          title={`مرحباً ${session.name}`}
          subtitle="تجد طلباتك هنا"
          showName={false}
          showGuide
          light
          homeHref="/consultant"
        />
        {children}
      </div>
    </main>
  );
}
