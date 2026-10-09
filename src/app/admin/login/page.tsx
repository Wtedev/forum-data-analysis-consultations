import { Suspense } from "react";

import { AdminLoginForm } from "@/components/admin/login-form";

export const metadata = {
  title: "تسجيل الدخول | لوحة الإدارة",
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-full items-center justify-center bg-gradient-to-b from-[#f0f9f9] to-slate-100 px-4 py-12">
      <Suspense fallback={<p className="text-slate-500">جاري التحميل...</p>}>
        <AdminLoginForm />
      </Suspense>
    </main>
  );
}
