import "server-only";

import { randomBytes } from "node:crypto";

import { NO_PREFERENCE_CHOICE } from "@/lib/consultants";
import { getPrisma } from "@/lib/prisma";

export type ConsultantOption = {
  id: string;
  label: string;
};

export async function listPublicConsultantOptions(): Promise<ConsultantOption[]> {
  const accounts = await getPrisma().adminUser.findMany({
    where: { role: "CONSULTANT", consultantKey: { not: null } },
    select: { consultantKey: true, name: true },
    orderBy: { name: "asc" },
  });

  return [
    NO_PREFERENCE_CHOICE,
    ...accounts.flatMap((account) =>
      account.consultantKey ? [{ id: account.consultantKey, label: account.name }] : [],
    ),
  ];
}

export async function resolveConsultantChoice(label: string) {
  const normalized = label.trim();
  if (normalized === NO_PREFERENCE_CHOICE.label) return NO_PREFERENCE_CHOICE.id;

  const account = await getPrisma().adminUser.findFirst({
    where: { role: "CONSULTANT", name: normalized, consultantKey: { not: null } },
    select: { consultantKey: true },
  });

  return account?.consultantKey ?? null;
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

  return Object.fromEntries(
    accounts.flatMap((account) => (account.consultantKey ? [[account.consultantKey, account.name]] : [])),
  ) as Record<string, string>;
}
