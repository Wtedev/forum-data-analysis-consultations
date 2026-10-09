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
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white px-6 py-5 text-[#1c1c1c] shadow-sm ring-1 ring-[#ececec]">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-[#7a7a7a]">ملتقى تحليل البيانات ٢</p>
        <p className="mt-0.5 text-lg font-bold leading-snug">{title}</p>
        <p className="text-sm font-medium text-[#5c5c5c]">{adminName}</p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href={homeHref}
          className="rounded-lg bg-[#f1f1ef] px-3 py-2 text-sm font-semibold text-[#1c1c1c] transition hover:bg-[#e7e7e5]"
        >
          طلبات الاستشارات
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-xl border border-[#e4e4e2] bg-white px-4 py-2 text-sm font-semibold text-[#1c1c1c] transition hover:bg-[#f6f6f4]"
        >
          خروج
        </button>
      </div>
    </header>
  );
}
