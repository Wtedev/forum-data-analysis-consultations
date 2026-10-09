import { redirect } from "next/navigation";

import { StaffShell } from "@/components/admin/staff-shell";
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
    <StaffShell adminName={session.name} title="طلبات الاستشارات" homeHref="/consultant">
      {children}
    </StaffShell>
  );
}
