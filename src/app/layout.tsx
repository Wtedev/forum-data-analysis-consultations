import type { Metadata } from "next";

import { fontMadrak } from "@/lib/fonts";

import "./globals.css";

export const metadata: Metadata = {
  title: "طلب استشارة | ملتقى تحليل البيانات في القطاع غير الربحي 2",
  description: "نموذج طلب استشارات تحليل البيانات — ملتقى تحليل البيانات في القطاع غير الربحي 2.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${fontMadrak.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-madrak">{children}</body>
    </html>
  );
}
