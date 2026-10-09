"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { clsx } from "clsx";

import {
  ONBOARDING_SCREENS,
  type OnboardingCtaZone,
  type OnboardingScreen,
} from "@/lib/onboarding-screens";

function ctaStyle(zone: OnboardingCtaZone): React.CSSProperties {
  return {
    bottom: zone.bottom,
    left: zone.left ?? "50%",
    width: zone.width,
    height: zone.height,
  };
}

const ctaLinkClassName =
  "absolute z-10 -translate-x-1/2 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-madrak-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

function OnboardingSlide({ screen }: { screen: OnboardingScreen }) {
  const { cta } = screen;
  const desktopZone = cta.desktopZone ?? cta.zone;

  return (
    <section className="relative h-dvh w-full overflow-hidden">
      <picture className="block h-dvh w-full">
        <source
          media="(min-width: 1024px)"
          srcSet={screen.desktopSrc}
          type="image/webp"
        />
        <img
          src={screen.mobileSrc}
          alt={screen.alt}
          className="h-dvh w-full object-cover"
          decoding="async"
          fetchPriority="high"
        />
      </picture>

      <Link
        href={cta.href}
        aria-label={cta.ariaLabel}
        className={clsx(ctaLinkClassName, "lg:hidden")}
        style={ctaStyle(cta.zone)}
      />
      <Link
        href={cta.href}
        aria-label={cta.ariaLabel}
        className={clsx(ctaLinkClassName, "hidden lg:block")}
        style={ctaStyle(desktopZone)}
      />
    </section>
  );
}

export function OnboardingViewer() {
  const [activeIndex, setActiveIndex] = useState(0);
  const screens = ONBOARDING_SCREENS;
  const screen = screens[activeIndex];
  const hasMultiple = screens.length > 1;

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(Math.max(0, Math.min(index, screens.length - 1)));
    },
    [screens.length],
  );

  if (!screen) {
    return null;
  }

  return (
    <div className="fixed inset-0 h-dvh w-full overflow-hidden bg-[#056b6f]">
      <OnboardingSlide screen={screen} />

      {hasMultiple ? (
        <>
          <div
            className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-2"
            role="tablist"
            aria-label="شاشات التعريف"
          >
            {screens.map((item, index) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                aria-label={`الشاشة ${index + 1}`}
                onClick={() => goTo(index)}
                className={clsx(
                  "h-2 rounded-full transition-all",
                  index === activeIndex
                    ? "w-6 bg-white"
                    : "w-2 bg-white/45 hover:bg-white/70",
                )}
              />
            ))}
          </div>

          {activeIndex < screens.length - 1 ? (
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              className="absolute start-4 top-4 z-20 rounded-full bg-black/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-black/30"
            >
              تخطي
            </button>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
