"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { FieldError, inputClassName, PrimaryButton } from "@/components/consultation/ui";

export function AcceptInviteForm({
  token,
  name,
  email,
}: {
  token: string;
  name: string;
  email: string;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/consultant/invites/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      const result = (await response.json()) as { success?: boolean; message?: string; redirectTo?: string };

      if (!response.ok || !result.success) {
        setError(result.message ?? "تعذر تفعيل الحساب");
        return;
      }

      router.replace(result.redirectTo ?? "/consultant");
      router.refresh();
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="kf-glass w-full max-w-md rounded-3xl p-8 shadow-2xl shadow-black/40">
      <p className="text-center text-sm font-semibold text-[#cfe3ff]">
        ملتقى تحليل البيانات <span className="text-[#4fd39b]">٢</span>
      </p>
      <h1 className="mt-3 text-center text-xl font-semibold text-white">قبول دعوة المستشار</h1>
      <p className="mt-2 text-center text-sm text-slate-300">
        {name}
        <span className="mt-1 block" dir="ltr">
          {email}
        </span>
      </p>

      <div className="mt-8 space-y-5">
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-200">
            كلمة المرور
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            dir="ltr"
            minLength={8}
            required
            className={inputClassName}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-slate-200">
            تأكيد كلمة المرور
          </label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            dir="ltr"
            minLength={8}
            required
            className={inputClassName}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>
        {error ? <FieldError message={error} /> : null}
        <PrimaryButton type="submit" disabled={saving} className="w-full">
          {saving ? "جاري التفعيل..." : "تفعيل الحساب"}
        </PrimaryButton>
      </div>
    </form>
  );
}
