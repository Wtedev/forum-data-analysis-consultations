"use client";

import { useRouter } from "next/navigation";

import { PlatformGuide } from "@/components/consultant/platform-guide";

export function ConsultantBanner({ name }: { name: string }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <header className="mb-5 rounded-[28px] bg-[#3e4c86] px-4 py-4 text-white shadow-[0_10px_24px_rgba(62,76,134,0.16)] sm:px-5 sm:py-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
          <p className="text-[1.35rem] font-bold leading-none sm:text-2xl">أهلاً، مستشارنا</p>
          <p className="max-w-full truncate text-sm font-medium leading-5 text-white/70">{name}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2.5">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-8 items-center whitespace-nowrap rounded-full bg-[#f07a72] px-3.5 text-[13px] font-semibold leading-none text-white transition hover:bg-[#e56d65]"
          >
            تسجيل خروج
          </button>
          <PlatformGuide tone="onDark" />
        </div>
      </div>
    </header>
  );
}
