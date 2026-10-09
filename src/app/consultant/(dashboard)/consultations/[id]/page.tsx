import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ConsultationDetailPanel } from "@/components/admin/consultation-detail-panel";
import { getAdminSession } from "@/lib/admin-auth";
import { getConsultationDetailForAdmin } from "@/lib/admin-queries";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ConsultantConsultationDetailPage({ params }: PageProps) {
  const session = await getAdminSession();
  if (!session?.consultantId) {
    redirect("/admin/login?next=/consultant");
  }

  const { id } = await params;
  const consultation = await getConsultationDetailForAdmin(id, session);

  if (!consultation) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <Link
        href="/consultant"
        className="inline-flex text-sm font-medium text-[#1c1c1c] hover:underline"
      >
        ← العودة إلى طلباتك
      </Link>
      <ConsultationDetailPanel initialData={consultation} mode="consultant" />
    </div>
  );
}
