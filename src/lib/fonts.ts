import localFont from "next/font/local";

/**
 * الخط الرسمي للنظام — Lenos (ملفات محلية)
 * المسار: public/fonts/lenos/
 */
export const fontMadrak = localFont({
  variable: "--font-madrak",
  display: "swap",
  src: [
    {
      path: "../../public/fonts/lenos/Lenos-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/lenos/Lenos-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/lenos/Lenos-SemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/lenos/Lenos-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
});
