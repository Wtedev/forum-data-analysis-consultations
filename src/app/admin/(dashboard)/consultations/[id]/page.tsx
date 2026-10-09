import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ConsultationDetailPanel } from "@/components/admin/consultation-detail-panel";
import { getAdminSession } from "@/lib/admin-auth";
import { getConsultationDetailForAdmin } from "@/lib/admin-queries";
import { getPrisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminConsultationDetailPage({ params }: PageProps) {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/admin/login");
  }

  const { id } = await params;
  const [consultation, assignees] = await Promise.all([
    getConsultationDetailForAdmin(id),
    getPrisma().adminUser.findMany({
      where: { role: "CONSULTANT", consultantKey: { not: null } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!consultation) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <Link
        href="/admin"
        className="inline-flex text-sm font-medium text-[#1c1c1c] hover:underline"
      >
        ← العودة لطلبات الاستشارات
      </Link>
      <ConsultationDetailPanel initialData={consultation} mode="admin" assignees={assignees} />
    </div>
  );
}
