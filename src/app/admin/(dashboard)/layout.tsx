import { redirect } from "next/navigation";

import { StaffShell } from "@/components/admin/staff-shell";
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
    <StaffShell adminName={session.name} title="إدارة طلبات الاستشارات" homeHref="/admin">
      {children}
    </StaffShell>
  );
}
