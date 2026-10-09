import { redirect } from "next/navigation";

import { AdminHeader } from "@/components/admin/admin-header";
import { getAdminSession } from "@/lib/admin-auth";

export const metadata = {
  title: "إدارة طلبات الاستشارات | ملتقى تحليل البيانات في القطاع غير الربحي 2",
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  if (session.role === "CONSULTANT" && session.consultantId) {
    redirect("/consultant");
  }
  if (session.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return (
    <main className="min-h-dvh bg-[#f4f6f8] px-4 py-6 text-[#111827] sm:px-6 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <AdminHeader adminName={session.name} title="إدارة طلبات الاستشارات" showDirectory />
        {children}
      </div>
    </main>
  );
}
