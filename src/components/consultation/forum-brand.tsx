import Image from "next/image";
import { clsx } from "clsx";

/** شعارات الجهات كما في هوية الملتقى (من اليمين لليسار) */
export const FORUM_LOGOS = [
  { src: "/images/partners/partners-06.png", alt: "جمعية كفاءات الأهلية", w: 175, h: 131 },
  { src: "/images/partners/partners-02.png", alt: "المركز الوطني لتنمية القطاع غير الربحي", w: 238, h: 103 },
  { src: "/images/partners/partners-04.png", alt: "وزارة الموارد البشرية والتنمية الاجتماعية", w: 286, h: 111 },
] as const;

export function ForumLogosBar({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "kf-glass flex items-center justify-center gap-6 rounded-2xl px-5 py-4 sm:gap-10 sm:px-8",
        className,
      )}
      aria-label="الجهات المنظمة والداعمة"
    >
      {FORUM_LOGOS.map((logo) => (
        <Image
          key={logo.src}
          src={logo.src}
          alt={logo.alt}
          width={logo.w}
          height={logo.h}
          className="h-8 w-auto object-contain opacity-90 sm:h-10"
          priority
        />
      ))}
    </div>
  );
}

export function ForumPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-xl border border-white/10 bg-white/[0.06] px-5 py-1.5 text-sm text-slate-200">
      {children}
    </span>
  );
}

/** عنوان الملتقى بنفس تكوين التصميم: "تحليل البيانات" + "في القطاع غير الربحي" + الرقم 2 */
export function ForumTitle({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const big = {
    sm: "text-[1.65rem]",
    md: "text-3xl",
    lg: "text-[2.6rem] sm:text-6xl lg:text-7xl",
  }[size];
  const sub = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl sm:text-4xl lg:text-[2.75rem]",
  }[size];
  const num = {
    sm: "text-[4.2rem]",
    md: "text-[5rem]",
    lg: "text-[6.5rem] sm:text-[9rem] lg:text-[10.5rem]",
  }[size];

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-5" dir="rtl">
      <div className="text-start">
        <p className={clsx("kf-gradient-text font-bold leading-[1.15]", big)}>
          تحليل البيانات
        </p>
        <p className={clsx("font-medium leading-tight text-[#cfe3ff]", sub)}>
          في القطاع غير الربحي
        </p>
      </div>
      <span
        className={clsx("font-bold leading-none text-[var(--kf-green)]", num)}
        aria-label="النسخة الثانية"
      >
        2
      </span>
    </div>
  );
}
