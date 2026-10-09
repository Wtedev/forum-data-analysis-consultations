import { DeleteConsultantButton } from "@/components/admin/delete-consultant-button";
import { InviteConsultantForm } from "@/components/admin/invite-consultant-form";
import { getPrisma } from "@/lib/prisma";

export const metadata = {
  title: "المستشارون | ملتقى تحليل البيانات في القطاع غير الربحي 2",
};

export default async function ConsultantsPage() {
  const [consultants, pendingInvites, assignedGroups, preferredGroups] = await Promise.all([
    getPrisma().adminUser.findMany({
      where: { role: "CONSULTANT" },
      select: { id: true, name: true, email: true, consultantKey: true },
      orderBy: { name: "asc" },
    }),
    getPrisma().consultantInvite.findMany({
      where: { acceptedAt: null, expiresAt: { gt: new Date() } },
      select: { id: true, name: true, email: true },
      orderBy: { createdAt: "desc" },
    }),
    getPrisma().consultation.groupBy({
      by: ["assignedToId"],
      where: { assignedToId: { not: null } },
      _count: { _all: true },
    }),
    getPrisma().consultation.groupBy({
      by: ["preferredConsultant"],
      where: { assignedToId: null, preferredConsultant: { not: "NO_PREFERENCE" } },
      _count: { _all: true },
    }),
  ]);

  const assignedCount = new Map(
    assignedGroups.flatMap((group) => (group.assignedToId ? [[group.assignedToId, group._count._all] as const] : [])),
  );
  const preferredCount = new Map(preferredGroups.map((group) => [group.preferredConsultant, group._count._all]));
  const activeEmails = new Set(consultants.map((consultant) => consultant.email));
  const waiting = pendingInvites.filter((invite) => !activeEmails.has(invite.email));

  return (
    <div className="space-y-6">
      <InviteConsultantForm />
      <div className="space-y-3">
        {consultants.length === 0 && waiting.length === 0 ? (
          <div className="rounded-2xl bg-white px-4 py-8 text-center text-sm font-medium leading-7 text-[#8b93ab] shadow-[0_6px_18px_rgba(62,76,134,0.06)] ring-1 ring-[#eef0f6]">
            لا يوجد مستشارون بعد
          </div>
        ) : (
          <>
            {consultants.map((consultant) => {
              const count =
                (assignedCount.get(consultant.id) ?? 0) +
                (consultant.consultantKey ? preferredCount.get(consultant.consultantKey) ?? 0 : 0);
              return (
                <article key={consultant.id} className="flex items-center gap-3 rounded-2xl bg-white px-3.5 py-3.5 shadow-[0_6px_18px_rgba(62,76,134,0.06)] ring-1 ring-[#eef0f6]">
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-[15px] font-bold leading-6 text-[#3e4c86]">{consultant.name}</h2>
                    <p className="mt-1 truncate text-[13px] leading-5 text-[#8b93ab]" dir="ltr">{consultant.email}</p>
                    <p className="mt-1 text-[13px] font-medium text-[#8b93ab]">مفعّل · {count} استشارة</p>
                  </div>
                  <DeleteConsultantButton id={consultant.id} name={consultant.name} kind="account" />
                </article>
              );
            })}
            {waiting.map((invite) => (
              <article key={invite.id} className="flex items-center gap-3 rounded-2xl bg-white px-3.5 py-3.5 shadow-[0_6px_18px_rgba(62,76,134,0.06)] ring-1 ring-[#eef0f6]">
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-[15px] font-bold leading-6 text-[#3e4c86]">{invite.name}</h2>
                  <p className="mt-1 truncate text-[13px] leading-5 text-[#8b93ab]" dir="ltr">{invite.email}</p>
                  <p className="mt-1 text-[13px] font-medium text-[#8b93ab]">بانتظار قبول الدعوة</p>
                </div>
                <DeleteConsultantButton id={invite.id} name={invite.name} kind="invite" />
              </article>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
