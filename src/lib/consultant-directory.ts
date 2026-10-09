import "server-only";

import { randomBytes } from "node:crypto";

import { NO_PREFERENCE_CHOICE } from "@/lib/consultants";
import { getPrisma } from "@/lib/prisma";

export type ConsultantOption = {
  id: string;
  label: string;
};

export async function listPublicConsultantOptions(): Promise<ConsultantOption[]> {
  const now = new Date();
  const [accounts, invites] = await Promise.all([
    getPrisma().adminUser.findMany({
      where: { role: "CONSULTANT", consultantKey: { not: null } },
      select: { consultantKey: true, name: true, email: true },
    }),
    getPrisma().consultantInvite.findMany({
      where: { acceptedAt: null, expiresAt: { gt: now } },
      select: { consultantKey: true, name: true, email: true },
    }),
  ]);

  const activeEmails = new Set(accounts.map((account) => account.email));
  const activeKeys = new Set(accounts.flatMap((account) => (account.consultantKey ? [account.consultantKey] : [])));
  const options = [
    ...accounts.flatMap((account) =>
      account.consultantKey ? [{ id: account.consultantKey, label: account.name }] : [],
    ),
    ...invites.flatMap((invite) =>
      !activeEmails.has(invite.email) && !activeKeys.has(invite.consultantKey)
        ? [{ id: invite.consultantKey, label: invite.name }]
        : [],
    ),
  ].sort((a, b) => a.label.localeCompare(b.label, "ar"));

  return [NO_PREFERENCE_CHOICE, ...options];
}

export async function resolveConsultantChoice(label: string) {
  const normalized = label.trim();
  if (normalized === NO_PREFERENCE_CHOICE.label) return NO_PREFERENCE_CHOICE.id;

  const account = await getPrisma().adminUser.findFirst({
    where: { role: "CONSULTANT", name: normalized, consultantKey: { not: null } },
    select: { consultantKey: true },
  });
  if (account?.consultantKey) return account.consultantKey;

  const invite = await getPrisma().consultantInvite.findFirst({
    where: { name: normalized, acceptedAt: null, expiresAt: { gt: new Date() } },
    select: { consultantKey: true },
    orderBy: { createdAt: "desc" },
  });

  return invite?.consultantKey ?? null;
}

export function consultantKeyForInvite() {
  return `c_${randomBytes(8).toString("hex")}`;
}

export async function consultantNamesByKey(keys: string[]) {
  const unique = [...new Set(keys.filter(Boolean))];
  if (unique.length === 0) return {};

  const accounts = await getPrisma().adminUser.findMany({
    where: { consultantKey: { in: unique } },
    select: { consultantKey: true, name: true },
  });
  const names = Object.fromEntries(
    accounts.flatMap((account) => (account.consultantKey ? [[account.consultantKey, account.name]] : [])),
  ) as Record<string, string>;

  const missing = unique.filter((key) => !names[key]);
  if (missing.length === 0) return names;

  const invites = await getPrisma().consultantInvite.findMany({
    where: { consultantKey: { in: missing } },
    select: { consultantKey: true, name: true },
    orderBy: { createdAt: "desc" },
  });
  for (const invite of invites) {
    if (!names[invite.consultantKey]) names[invite.consultantKey] = invite.name;
  }

  return names;
}
