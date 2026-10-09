"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { SecondaryButton } from "@/components/consultation/ui";

type AdminHeaderProps = {
  adminName: string;
  title?: string;
  homeHref?: string;
};

export function AdminHeader({
  adminName,
  title = "لوحة الإدارة",
  homeHref = "/admin",
}: AdminHeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#034f52] px-6 py-5 text-white shadow-lg shadow-[#034f52]/20">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-[#d8f4ef]">ملتقى تحليل البيانات ٢</p>
        <p className="mt-0.5 text-lg font-bold leading-snug">{title}</p>
        <p className="text-sm font-medium text-[#d8f4ef]">{adminName}</p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href={homeHref}
          className="rounded-lg px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          الطلبات
        </Link>
        <SecondaryButton
          onClick={handleLogout}
          className="min-h-0 border-white bg-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/25"
        >
          خروج
        </SecondaryButton>
      </div>
    </header>
  );
}
