import "server-only";

import { consultantShortLabel } from "@/lib/consultants";

const CONSULTANT_ACCOUNTS = [
  {
    id: "ABDALSALAM_ALSAGHEER",
    email: "ceo@kafaat.org.sa",
    passwordEnv: "CONSULTANT_ABDALSALAM_PASSWORD",
  },
] as const;

export type ConsultantAccountId = (typeof CONSULTANT_ACCOUNTS)[number]["id"];

export function consultantLoginConfigured(): boolean {
  return CONSULTANT_ACCOUNTS.some((account) => Boolean(process.env[account.passwordEnv]));
}

export function findConsultantAccount(email: string): {
  id: ConsultantAccountId;
  email: string;
  name: string;
  password: string;
} | null {
  const normalized = email.trim().toLowerCase();
  const account = CONSULTANT_ACCOUNTS.find((item) => item.email === normalized);
  if (!account) return null;

  const password = process.env[account.passwordEnv];
  if (!password) return null;

  return {
    id: account.id,
    email: account.email,
    name: consultantShortLabel(account.id),
    password,
  };
}
