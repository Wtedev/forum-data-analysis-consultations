"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type StaffShellProps = {
  adminName: string;
  title: string;
  homeHref: string;
  children: React.ReactNode;
};

export function StaffShell({ adminName, title, homeHref, children }: StaffShellProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-dvh bg-[#e4e4e2] p-2 text-[#1c1c1c] sm:p-3">
      <div className="flex min-h-[calc(100dvh-1rem)] flex-col overflow-hidden rounded-[22px] bg-[#f7f7f5] sm:min-h-[calc(100dvh-1.5rem)] lg:flex-row-reverse">
        <aside className="flex w-full shrink-0 flex-col border-b border-[#ececec] bg-white px-4 py-4 lg:w-[260px] lg:border-b-0 lg:border-s lg:py-5">
          <div className="flex items-center gap-2 px-2" dir="ltr">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1c1c1c] text-[11px] font-bold text-white">
              م
            </span>
            <p className="truncate text-sm font-semibold" dir="rtl">
              ملتقى تحليل البيانات ٢
            </p>
          </div>

          <nav className="mt-6">
            <p className="px-2 text-[11px] font-semibold tracking-wide text-[#a3a3a3]">الصفحات</p>
            <Link
              href={homeHref}
              className="mt-2 flex items-center rounded-lg bg-[#f1f1ef] px-3 py-2 text-sm font-medium text-[#1c1c1c]"
            >
              {title}
            </Link>
          </nav>

          <div className="mt-6 border-t border-[#f0f0ee] pt-4 lg:mt-auto">
            <p className="px-2 text-sm font-medium">{adminName}</p>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-2 rounded-lg px-2 py-1.5 text-sm font-medium text-[#5c5c5c] transition hover:bg-[#f6f6f4] hover:text-[#1c1c1c]"
            >
              خروج
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1 px-4 py-5 sm:px-8 sm:py-7">
          <div className="mb-6 inline-flex items-center rounded-lg border border-[#ececec] bg-white px-3 py-1.5 text-sm text-[#3d3d3d]">
            {title}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
