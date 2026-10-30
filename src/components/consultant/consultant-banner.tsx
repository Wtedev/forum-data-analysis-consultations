"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clsx } from "clsx";

import { PlatformGuide } from "@/components/consultant/platform-guide";

export function ConsultantBanner({
  name,
  visibleToApplicants,
}: {
  name: string;
  visibleToApplicants: boolean;
}) {
  const router = useRouter();
  const [visible, setVisible] = useState(visibleToApplicants);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setVisible(visibleToApplicants);
  }, [visibleToApplicants]);

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  async function toggleVisibility() {
    const next = !visible;
    setVisible(next);
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/consultant/visibility", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible: next }),
      });
      const result = (await response.json()) as { success?: boolean; message?: string; visible?: boolean };
      if (!response.ok || !result.success || typeof result.visible !== "boolean") {
        setVisible(!next);
        setError(result.message ?? "تعذر تحديث الظهور");
        return;
      }
      setVisible(result.visible);
      router.refresh();
    } catch {
      setVisible(!next);
      setError("تعذر الاتصال بالخادم");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mb-5">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <img src="/images/kafaat-logo.png?v=5" alt="جمعية كفاءات الأهلية" width={800} height={579} className="h-14 w-auto max-w-[40%] shrink-0 object-contain" />
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
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-[13px] font-medium leading-5 text-white/80">ظهور اسمك للمستفيدين</p>
          <button
            type="button"
            role="switch"
            aria-checked={visible}
            aria-label="ظهور اسمك للمستفيدين"
            disabled={saving}
            onClick={() => void toggleVisibility()}
            className={clsx(
              "relative h-5 w-9 shrink-0 rounded-full transition disabled:opacity-50",
              visible ? "bg-[#12b76a]" : "bg-white/25",
            )}
          >
            <span
              className={clsx(
                "absolute top-0.5 h-4 w-4 rounded-full bg-white transition",
                visible ? "left-0.5" : "right-0.5",
              )}
            />
          </button>
        </div>
        {error ? <p className="mt-2 text-[12px] font-medium text-[#fecaca]">{error}</p> : null}
      </header>
      {visible ? null : (
        <div className="mt-3 flex overflow-hidden rounded-2xl bg-[#fff6ed] shadow-[0_8px_20px_rgba(154,52,18,0.06)] ring-1 ring-[#f3d3b6]" role="status">
          <div className="w-1.5 shrink-0 bg-[#c2410c]" aria-hidden />
          <div className="px-4 py-3">
            <p className="text-sm font-bold leading-6 text-[#9a3412]">اسمك مغلق أمام المستفيدين</p>
            <p className="mt-0.5 text-[13px] font-medium leading-6 text-[#9a3412]/80">
              لا يظهر اسمك في نموذج طلب الاستشارة، ولا يستطيع المستفيد توجيه الطلب إليك حتى تعيد فتح الظهور.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
