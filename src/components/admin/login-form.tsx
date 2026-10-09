"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { FieldError, inputClassName, PrimaryButton } from "@/components/consultation/ui";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = (await response.json()) as {
        success: boolean;
        message?: string;
      };

      if (!response.ok || !result.success) {
        setError(result.message ?? "تعذر تسجيل الدخول");
        return;
      }

      router.replace(nextPath);
      router.refresh();
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/60 ring-1 ring-slate-100"
    >
      <h1 className="text-center text-xl font-semibold text-slate-800">
        لوحة إدارة الاستشارات
      </h1>
      <p className="mt-2 text-center text-sm text-slate-500">
        سجّل الدخول لإدارة طلبات بوصلتك الجامعية
      </p>

      <div className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
            البريد الإلكتروني
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            dir="ltr"
            className={inputClassName}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
            كلمة المرور
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            dir="ltr"
            className={inputClassName}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {error ? <FieldError message={error} /> : null}

        <PrimaryButton type="submit" disabled={loading} className="w-full">
          {loading ? "جاري الدخول..." : "تسجيل الدخول"}
        </PrimaryButton>
      </div>
    </form>
  );
}
