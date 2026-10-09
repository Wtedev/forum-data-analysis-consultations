import { Suspense } from "react";

import { AdminLoginForm } from "@/components/admin/login-form";

export const metadata = {
  title: "تسجيل الدخول | لوحة الإدارة",
};

export default function AdminLoginPage() {
  return (
    <main className="kf-page flex min-h-dvh items-center justify-center px-4 py-12">
      <Suspense fallback={<p className="text-slate-500">جاري التحميل...</p>}>
        <AdminLoginForm />
      </Suspense>
    </main>
  );
}
