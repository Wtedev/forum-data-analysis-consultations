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
      <div className="mb-3 flex justify-center">
        <img
          src="/images/kafaat-logo.jpg"
          alt="كفاءات"
          width={80}
          height={80}
          className="h-20 w-20 rounded-2xl bg-white object-contain shadow-[0_6px_18px_rgba(15,23,42,0.08)]"
        />
      </div>
      <header className="rounded-[28px] bg-[linear-gradient(168deg,#121c33_0%,#1a2849_32%,#0e1528_68%,#0b0f1c_100%)] px-4 py-4 text-white shadow-[0_10px_24px_rgba(11,15,28,0.28)] sm:px-5 sm:py-5">
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
      <p className="mt-3 text-center text-xs font-medium leading-5 text-[#8b93ab]">
        جميع الحقوق محفوظة لجمعية كفاءات الأهلية
      </p>
    </div>
  );
}
