"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type AdminHeaderProps = {
  adminName: string;
  title?: string;
  homeHref?: string;
};

export function AdminHeader({
  adminName,
  title = "إدارة طلبات الاستشارات",
  homeHref = "/admin",
}: AdminHeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[var(--kf-bg)] px-6 py-5 text-[#e6edf8] shadow-[0_8px_24px_rgba(10,15,29,0.16)]">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-[#cfe3ff]/80">ملتقى تحليل البيانات ٢</p>
        <p className="mt-0.5 text-lg font-bold leading-snug">{title}</p>
        <p className="text-sm font-medium text-[#cfe3ff]">{adminName}</p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href={homeHref}
          className="rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
        >
          طلبات الاستشارات
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          خروج
        </button>
      </div>
    </header>
  );
}
