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
    <div className="mb-5">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <img src="/images/kafaat-logo.png" alt="كفاءات" width={241} height={130} className="h-16 w-auto shrink-0 object-contain" />
        <PlatformGuide />
      </div>
      <header className="rounded-2xl bg-[linear-gradient(168deg,#121c33_0%,#1a2849_32%,#0e1528_68%,#0b0f1c_100%)] px-6 py-5 text-white shadow-[0_10px_24px_rgba(11,15,28,0.28)] sm:px-7 sm:py-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold leading-7 sm:text-xl">استشارات ملتقى تحليل البيانات</p>
            <p className="mt-2 text-sm font-medium leading-6 text-white/75">مرحبا مستشارنا، {name}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-7 shrink-0 items-center whitespace-nowrap rounded-full border border-white/15 bg-[#1a2744] px-2.5 text-[11px] font-semibold text-white transition hover:bg-[#243656]"
          >
            تسجيل خروج
          </button>
        </div>
      </header>
    </div>
  );
}
