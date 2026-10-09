import { notFound, redirect } from "next/navigation";

import { ConsultantConsultationView } from "@/components/consultant/consultant-consultation-view";
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
    <ConsultantConsultationView
      initialData={consultation.assignedTo ? consultation : { ...consultation, phone: "" }}
    />
  );
}
