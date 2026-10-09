"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { SecondaryButton } from "@/components/consultation/ui";

type AdminHeaderProps = {
  adminName: string;
};

export function AdminHeader({ adminName }: AdminHeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-b from-madrak-primary to-[#056b6f] px-6 py-5 text-white shadow-lg shadow-madrak-primary/20">
      <div className="flex items-center gap-4">
        <Image
          src="/images/madrak-logo.svg"
          alt="مدرك"
          width={88}
          height={36}
          className="h-9 w-auto brightness-0 invert"
        />
        <div>
          <p className="text-sm text-white/75">لوحة الإدارة</p>
          <p className="font-semibold">{adminName}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          className="rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10"
        >
          الطلبات
        </Link>
        <SecondaryButton
          onClick={handleLogout}
          className="min-h-0 border-white/25 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
        >
          خروج
        </SecondaryButton>
      </div>
    </header>
  );
}
