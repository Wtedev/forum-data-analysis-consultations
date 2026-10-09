import Link from "next/link";
import { notFound } from "next/navigation";

import { ConsultationDetailPanel } from "@/components/admin/consultation-detail-panel";
import { getConsultationDetailForAdmin } from "@/lib/admin-queries";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminConsultationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const consultation = await getConsultationDetailForAdmin(id);

  if (!consultation) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <Link
        href="/admin"
        className="inline-flex text-sm font-medium text-madrak-primary hover:underline"
      >
        ← العودة للطلبات
      </Link>
      <ConsultationDetailPanel initialData={consultation} />
    </div>
  );
}
