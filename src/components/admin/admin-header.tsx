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
    <header className="kf-gradient-bg mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl px-6 py-5 text-[#061223] shadow-[0_8px_24px_rgba(79,211,155,0.18)]">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-[#061223]/70">ملتقى تحليل البيانات ٢</p>
        <p className="mt-0.5 text-lg font-bold leading-snug">{title}</p>
        <p className="text-sm font-medium text-[#061223]/80">{adminName}</p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href={homeHref}
          className="rounded-lg bg-white/75 px-3 py-2 text-sm font-semibold text-[#061223] transition hover:bg-white"
        >
          طلبات الاستشارات
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-xl border border-[#061223]/15 bg-white/45 px-4 py-2 text-sm font-semibold text-[#061223] transition hover:bg-white/75"
        >
          خروج
        </button>
      </div>
    </header>
  );
}
