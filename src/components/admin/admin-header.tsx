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
  light?: boolean;
};

export function AdminHeader({
  adminName,
  title = "إدارة طلبات الاستشارات",
  subtitle,
  showName = true,
  homeHref = "/admin",
  showDirectory = false,
  showGuide = false,
  light = false,
}: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const tabClass = (active: boolean) =>
    light
      ? active
        ? "whitespace-nowrap rounded-full bg-[#e8f8ef] px-3 py-1.5 text-xs font-semibold text-[#157a43] sm:text-sm"
        : "whitespace-nowrap rounded-full bg-[#f4f5f7] px-3 py-1.5 text-xs font-semibold text-[#4b5563] transition hover:bg-[#eef0f3] sm:text-sm"
      : active
        ? "whitespace-nowrap rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-[#061223] sm:px-3 sm:py-2 sm:text-sm"
        : "whitespace-nowrap rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white/15 sm:px-3 sm:py-2 sm:text-sm";

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <>
    {showGuide ? (
      <div className="mb-3 flex justify-end">
        <PlatformGuide />
      </div>
    ) : null}
    <header className={light
      ? "mb-5 rounded-3xl border border-[#eceef2] bg-white px-4 py-3.5 text-[#1c1c1c] shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:mb-8 sm:px-6 sm:py-5"
      : "mb-6 flex flex-col gap-3 rounded-2xl bg-[var(--kf-bg)] px-4 py-4 text-[#e6edf8] shadow-[0_8px_24px_rgba(10,15,29,0.16)] sm:mb-8 sm:px-6 sm:py-5"}>
      <div className={light
        ? "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        : "flex flex-wrap items-start justify-between gap-3"}>
      <div className="min-w-0">
        <p className={light ? "text-xs font-medium text-[#8b909a]" : "text-xs font-semibold text-[#cfe3ff]/80"}>ملتقى تحليل البيانات ٢</p>
        <p className="mt-0.5 text-lg font-bold leading-snug">{title}</p>
        {subtitle ? <p className={light ? "mt-1 text-sm text-[#6b7280]" : "mt-1 text-sm font-medium text-[#cfe3ff]"}>{subtitle}</p> : null}
        {showName ? <p className={light ? "text-sm text-[#6b7280]" : "text-sm font-medium text-[#cfe3ff]"}>{adminName}</p> : null}
      </div>

      <div className={light ? "flex w-full min-w-0 items-center gap-2 sm:w-auto" : "flex items-center gap-2"}>
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
            className={light
              ? "whitespace-nowrap rounded-full bg-[#f4f5f7] px-3 py-1.5 text-xs font-semibold text-[#4b5563] transition hover:bg-[#eef0f3] sm:text-sm"
              : "whitespace-nowrap rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white/15 sm:px-3 sm:py-2 sm:text-sm"}
          >
            طلبات الاستشارات
          </Link>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className={light
            ? "whitespace-nowrap rounded-full border border-[#e6e8ec] bg-white px-3 py-1.5 text-xs font-semibold text-[#374151] transition hover:bg-[#f7f8fa] sm:text-sm"
            : "whitespace-nowrap rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10 sm:px-4 sm:py-2 sm:text-sm"}
        >
          خروج
        </button>
      </div>
      </div>
    </header>
    </>
  );
}
