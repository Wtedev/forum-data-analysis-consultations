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
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white px-6 py-5 text-[#111827] shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-[#e6e8ec]">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-[#9ca3af]">ملتقى تحليل البيانات ٢</p>
        <p className="mt-0.5 text-lg font-bold leading-snug">{title}</p>
        <p className="text-sm font-medium text-[#6b7280]">{adminName}</p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href={homeHref}
          className="rounded-lg bg-[#f3f4f6] px-3 py-2 text-sm font-semibold text-[#111827] transition hover:bg-[#e8eaee]"
        >
          طلبات الاستشارات
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-xl border border-[#e6e8ec] bg-white px-4 py-2 text-sm font-semibold text-[#111827] transition hover:bg-[#f7f8fa]"
        >
          خروج
        </button>
      </div>
    </header>
  );
}
