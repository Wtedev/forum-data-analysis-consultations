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
      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-[#e6e8ec]">
        <table className="min-w-full text-sm">
          <thead className="bg-[#f7f8fa] text-[#6b7280]">
            <tr>
              <th className="px-4 py-3 text-start font-medium">الاسم</th>
              <th className="px-4 py-3 text-start font-medium">البريد</th>
              <th className="px-4 py-3 text-start font-medium">الحالة</th>
              <th className="px-4 py-3 text-start font-medium">الاستشارات</th>
            </tr>
          </thead>
          <tbody>
            {consultants.length === 0 && waiting.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center font-medium text-[#6b7280]">
                  لا يوجد مستشارون بعد
                </td>
              </tr>
            ) : (
              <>
                {consultants.map((consultant) => {
                  const count =
                    (assignedCount.get(consultant.id) ?? 0) +
                    (consultant.consultantKey ? preferredCount.get(consultant.consultantKey) ?? 0 : 0);
                  return (
                    <tr key={consultant.id} className="border-t border-[#eef0f3]">
                      <td className="px-4 py-3 font-bold text-[#111827]">{consultant.name}</td>
                      <td className="px-4 py-3 font-medium text-[#374151]" dir="ltr">
                        {consultant.email}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-[#e7f6ec] px-2.5 py-1 text-xs font-medium text-[#157a43]">
                          مفعّل
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-[#111827]">{count}</td>
                    </tr>
                  );
                })}
                {waiting.map((invite) => (
                  <tr key={invite.id} className="border-t border-[#eef0f3]">
                    <td className="px-4 py-3 font-bold text-[#111827]">{invite.name}</td>
                    <td className="px-4 py-3 font-medium text-[#374151]" dir="ltr">
                      {invite.email}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-[#fff4dc] px-2.5 py-1 text-xs font-medium text-[#a16207]">
                        بانتظار قبول الدعوة
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-[#6b7280]">—</td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
