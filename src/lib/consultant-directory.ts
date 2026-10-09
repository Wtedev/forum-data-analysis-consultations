import "server-only";

import { randomBytes } from "node:crypto";

import { CONSULTANTS } from "@/lib/consultants";
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

  const options: ConsultantOption[] = CONSULTANTS.map((item) => ({
    id: item.id,
    label: item.label,
  }));

  for (const account of accounts) {
    if (!account.consultantKey || options.some((item) => item.id === account.consultantKey)) continue;
    options.push({ id: account.consultantKey, label: account.name });
  }

  return options;
}

export async function resolveConsultantChoice(label: string) {
  const normalized = label.trim();
  const known = CONSULTANTS.find((item) => item.label === normalized);
  if (known) return known.id;

  const account = await getPrisma().adminUser.findFirst({
    where: { role: "CONSULTANT", name: normalized, consultantKey: { not: null } },
    select: { consultantKey: true },
  });

  return account?.consultantKey ?? null;
}

export function consultantKeyForInvite(name: string) {
  const normalized = name.trim();
  const known = CONSULTANTS.find(
    (item) => item.id !== "NO_PREFERENCE" && (item.shortLabel === normalized || item.label === normalized),
  );
  if (known) return known.id;
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
