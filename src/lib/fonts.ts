import localFont from "next/font/local";

/**
 * الخط الوحيد للموقع — شامل (FF Shamel Family Sans One)
 * المسار: src/fonts/shamel/
 */
export const fontForum = localFont({
  variable: "--font-forum",
  display: "swap",
  adjustFontFallback: false,
  src: [
    {
      path: "../fonts/shamel/FFShamelFamily-SansOneBook.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/shamel/FFShamelFamily-SansOneBook.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/shamel/FFShamelFamily-SansOneBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/shamel/FFShamelFamily-SansOneBold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
});
