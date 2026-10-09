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
      ? "rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#061223]"
      : "rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/15";

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
        {subtitle ? <p className="mt-1 text-sm font-medium text-[#cfe3ff]">{subtitle}</p> : null}
        {showName ? <p className="text-sm font-medium text-[#cfe3ff]">{adminName}</p> : null}
      </div>

      <div className="flex items-center gap-3">
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
            className="rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            طلبات الاستشارات
          </Link>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          خروج
        </button>
        {showGuide ? <PlatformGuide /> : null}
      </div>
    </header>
  );
}
