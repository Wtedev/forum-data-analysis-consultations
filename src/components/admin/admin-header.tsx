"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { PlatformGuide } from "@/components/consultant/platform-guide";

type AdminHeaderProps = {
  adminName: string;
  title?: string;
  subtitle?: string;
  showName?: boolean;
  homeHref?: string;
  showDirectory?: boolean;
  showGuide?: boolean;
};

export function AdminHeader({
  adminName,
  title = "إدارة طلبات الاستشارات",
  subtitle,
  showName = true,
  homeHref = "/admin",
  showDirectory = false,
  showGuide = false,
}: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const tabClass = (active: boolean) =>
    active
      ? "whitespace-nowrap rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-[#061223] sm:px-3 sm:py-2 sm:text-sm"
      : "whitespace-nowrap rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white/15 sm:px-3 sm:py-2 sm:text-sm";

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <header className="mb-6 flex flex-col gap-3 rounded-2xl bg-[var(--kf-bg)] px-4 py-4 text-[#e6edf8] shadow-[0_8px_24px_rgba(10,15,29,0.16)] sm:mb-8 sm:px-6 sm:py-5">
      {showGuide ? (
        <div className="flex justify-end">
          <PlatformGuide />
        </div>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-[#cfe3ff]/80">ملتقى تحليل البيانات ٢</p>
        <p className="mt-0.5 text-lg font-bold leading-snug">{title}</p>
        {subtitle ? <p className="mt-1 text-sm font-medium text-[#cfe3ff]">{subtitle}</p> : null}
        {showName ? <p className="text-sm font-medium text-[#cfe3ff]">{adminName}</p> : null}
      </div>

      <div className="flex items-center gap-2">
        {showDirectory ? (
          <>
            <Link href="/admin" className={tabClass(pathname === "/admin")}>
              طلبات الاستشارات
            </Link>
            <Link href="/admin/consultants" className={tabClass(pathname.startsWith("/admin/consultants"))}>
              المستشارون
            </Link>
          </>
        ) : (
          <Link
            href={homeHref}
            className="whitespace-nowrap rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white/15 sm:px-3 sm:py-2 sm:text-sm"
          >
            طلبات الاستشارات
          </Link>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="whitespace-nowrap rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10 sm:px-4 sm:py-2 sm:text-sm"
        >
          خروج
        </button>
      </div>
      </div>
    </header>
  );
}
