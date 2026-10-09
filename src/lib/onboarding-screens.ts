export type OnboardingCtaZone = {
  /** CSS bottom offset, e.g. "10%" */
  bottom: string;
  /** CSS width, e.g. "78%" */
  width: string;
  /** CSS height, e.g. "7%" */
  height: string;
  /** Horizontal center by default; override left if needed */
  left?: string;
};

export type OnboardingScreen = {
  id: string;
  mobileSrc: string;
  desktopSrc: string;
  alt: string;
  /** Transparent tap target over the CTA baked into the artwork */
  cta: {
    href: string;
    ariaLabel: string;
    /** Tap target on mobile artwork (9:16) */
    zone: OnboardingCtaZone;
    /** Optional override for desktop artwork (16:9) */
    desktopZone?: OnboardingCtaZone;
  };
};

export const ONBOARDING_SCREENS: OnboardingScreen[] = [
  {
    id: "intro-1",
    mobileSrc: "/images/onboarding/intro-mobile-1.webp",
    desktopSrc: "/images/onboarding/intro-desktop-1.webp",
    alt: "بوصلتك الجامعية — نموذج الاستشارات الأكاديمية من مدرك",
    cta: {
      href: "/consultation",
      ariaLabel: "اطلب الاستشارة",
      zone: {
        bottom: "11%",
        width: "76%",
        height: "7.5%",
        left: "50%",
      },
      desktopZone: {
        bottom: "14%",
        width: "22%",
        height: "12%",
        left: "50%",
      },
    },
  },
];
