import { notFound, redirect } from "next/navigation";

import { ConsultantConsultationView } from "@/components/consultant/consultant-consultation-view";
import { getAdminSession } from "@/lib/admin-auth";
import { getConsultationDetailForAdmin } from "@/lib/admin-queries";
import type { ConsultationDetail } from "@/lib/admin-serialize";

type PageProps = {
  params: Promise<{ id: string }>;
};

function hideBeneficiaryUntilAssigned(consultation: ConsultationDetail, viewerId: string): ConsultationDetail {
  if (consultation.assignedTo?.id === viewerId) return consultation;
  return {
    ...consultation,
    phone: "",
    email: null,
    genderLabel: "",
    currentStageLabel: "",
    university: null,
    majorInterest: null,
    projectOrTeamName: null,
    teamMemberCount: null,
  };
}

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
      viewerId={session.sub}
      initialData={hideBeneficiaryUntilAssigned(consultation, session.sub)}
    />
  );
}
