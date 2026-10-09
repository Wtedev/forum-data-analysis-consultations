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
    <header className="mb-5 rounded-[28px] bg-[#3e4c86] px-4 py-4 text-white shadow-[0_10px_28px_rgba(62,76,134,0.18)] sm:px-6 sm:py-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xl font-bold leading-snug sm:text-2xl">أهلاً، مستشارنا</p>
          <p className="mt-1 truncate text-sm text-white/75">{name}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-3">
          <button
            type="button"
            onClick={handleLogout}
            className="whitespace-nowrap rounded-full bg-[#f07a72] px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-[#e56d65]"
          >
            تسجيل خروج
          </button>
          <PlatformGuide tone="onDark" />
        </div>
      </div>
    </header>
  );
}
