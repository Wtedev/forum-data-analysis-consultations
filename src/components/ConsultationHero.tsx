"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

const MUDRAK_LOGO = "/images/Mud.png";
const KAFAAT_LOGO = "/images/partners/partners-06.png";

const FOOTER_PARTNER_LOGOS = [
  "/images/partners/partners-02.png",
  "/images/partners/partners-03.png",
  "/images/partners/partners-04.png",
  "/images/partners/partners-05.png",
  "/images/partners/partners-06.png",
] as const;

function TopLogosCentered({ className = "" }: { className?: string }) {
  return (
    <header
      className={`flex items-center gap-3 sm:gap-4 ${className}`}
      aria-label="شعارات ملتقى مدرك وكفاءات"
    >
      <Image
        src={MUDRAK_LOGO}
        alt="ملتقى مدرك"
        width={140}
        height={56}
        className="h-14 w-auto object-contain sm:h-16 lg:h-[4.25rem]"
        priority
      />
      <div className="relative h-11 w-28 shrink-0 sm:h-12 sm:w-32 lg:h-14 lg:w-36">
        <Image
          src={KAFAAT_LOGO}
          alt="كفاءات"
          fill
          sizes="144px"
          className="partner-logo object-contain"
          priority
        />
      </div>
    </header>
  );
}

type PartnerMarqueeProps = {
  logos?: readonly string[];
};

function PartnerMarquee({ logos = FOOTER_PARTNER_LOGOS }: PartnerMarqueeProps) {
  const track = [...logos, ...logos];

  return (
    <footer className="w-full overflow-hidden" aria-label="شركاء ملتقى مدرك">
      <div className="partners-marquee-mask">
        <div className="flex w-max animate-logo-marquee items-center gap-6 lg:gap-8">
          {track.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className="relative h-8 w-20 shrink-0 opacity-90 sm:h-9 sm:w-24 lg:h-10 lg:w-28"
              aria-hidden={index >= logos.length}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width: 1024px) 96px, 112px"
                className="partner-logo object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}

function HeroLayout() {
  return (
    <div className="relative z-10 flex h-dvh flex-col">
      <div className="flex shrink-0 justify-center px-6 pt-10 sm:pt-12 lg:pt-14">
        <TopLogosCentered className="justify-center" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-8 text-center lg:px-12">
        <p className="mb-10 max-w-xs text-sm leading-relaxed text-white/95 sm:mb-12 sm:max-w-sm sm:text-base lg:mb-14 lg:max-w-md lg:text-lg">
          تبحث عمن يوجهك في رحلتك الأكاديمية؟
        </p>

        <h1 className="mb-12 max-w-sm text-[3.5rem] font-black leading-[0.95] tracking-tight sm:mb-14 sm:max-w-md sm:text-[4.25rem] lg:mb-16 lg:max-w-lg lg:text-[5rem] xl:text-[5.5rem]">
          بوصلتك
          <br />
          الجامعية
        </h1>

        <div className="consultation-hero__glass mb-14 max-w-[19rem] rounded-2xl border border-white/15 bg-black/15 px-5 py-4 backdrop-blur-md sm:mb-16 sm:max-w-xs lg:mb-16 lg:max-w-md lg:rounded-2xl lg:px-7 lg:py-5">
          <p className="text-xs leading-[1.85] text-white/92 sm:text-sm lg:text-base lg:leading-[1.9]">
            مدرك يوجهك من خلال استشارات أكاديمية مستمرة تساعدك قبل الجامعة
            وخلال رحلتك الجامعية
          </p>
        </div>

        <Link
          href="/consultation"
          className="group inline-flex items-center gap-2 text-lg font-medium text-white transition-opacity hover:opacity-85 sm:text-xl lg:gap-3 lg:text-2xl"
        >
          <ChevronLeft
            className="h-5 w-5 transition group-hover:-translate-x-0.5 sm:h-6 sm:w-6 lg:h-7 lg:w-7"
            aria-hidden
          />
          <span>اطلب استشارة</span>
        </Link>
      </div>

      <div className="w-full shrink-0 px-4 pb-10 pt-6 sm:px-6 sm:pb-12 lg:px-10 lg:pb-14">
        <PartnerMarquee />
      </div>
    </div>
  );
}

export default function ConsultationHero() {
  return (
    <main className="consultation-hero relative h-dvh max-h-dvh overflow-hidden text-white">
      <div className="consultation-hero__gradient absolute inset-0" aria-hidden />
      <div className="consultation-hero__gradient-overlay absolute inset-0" aria-hidden />
      <div
        className="consultation-hero__shape consultation-hero__shape--one absolute -top-24 end-8 h-80 w-80 rounded-full bg-white/14 blur-3xl"
        aria-hidden
      />
      <div
        className="consultation-hero__shape consultation-hero__shape--two absolute bottom-[-7rem] start-1/4 h-[26rem] w-[26rem] rounded-full bg-cyan-200/18 blur-3xl"
        aria-hidden
      />
      <div
        className="consultation-hero__shape consultation-hero__shape--three absolute start-[-5rem] top-1/3 h-80 w-80 rounded-full bg-teal-950/28 blur-3xl"
        aria-hidden
      />
      <div className="consultation-hero__silhouette-wrap" aria-hidden />

      <HeroLayout />
    </main>
  );
}
