import type { Metadata } from "next";

import { fontMadrak } from "@/lib/fonts";

import "./globals.css";

export const metadata: Metadata = {
  title: "بوصلتك الجامعية | نموذج الاستشارات الأكاديمية",
  description: "نموذج الاستشارات الأكاديمية — بوصلتك الجامعية من مدرك.",
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
