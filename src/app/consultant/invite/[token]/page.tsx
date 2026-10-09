import { AcceptInviteForm } from "@/components/consultant/accept-invite-form";
import { hashInviteToken } from "@/lib/invite-token";
import { getPrisma } from "@/lib/prisma";

export const metadata = {
  title: "قبول دعوة المستشار | ملتقى تحليل البيانات ٢",
};

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function AcceptInvitePage({ params }: PageProps) {
  const { token } = await params;
  const invite = await getPrisma().consultantInvite.findUnique({
    where: { tokenHash: hashInviteToken(token) },
  });
  const valid = Boolean(invite && !invite.acceptedAt && invite.expiresAt.getTime() >= Date.now());

  return (
    <main className="kf-page flex min-h-dvh items-center justify-center px-4 py-12">
      {valid && invite ? (
        <AcceptInviteForm token={token} name={invite.name} email={invite.email} />
      ) : (
        <div className="kf-glass w-full max-w-md rounded-3xl p-8 text-center text-slate-200 shadow-2xl shadow-black/40">
          <h1 className="text-xl font-semibold text-white">الدعوة غير صالحة</h1>
          <p className="mt-3 text-sm leading-relaxed">انتهت صلاحية الرابط أو استُخدم من قبل. اطلب دعوة جديدة من الإدارة.</p>
        </div>
      )}
    </main>
  );
}
