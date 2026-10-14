import type { ReactNode } from "react";

import { WhatsAppIcon } from "@/components/admin/whatsapp-link";

const KAFAAT_SITE = "https://kafaat.org.sa";
const KAFAAT_WHATSAPP = "https://wa.me/966537527747";

const SOCIAL_LINKS = [
  {
    label: "يوتيوب",
    href: "https://youtube.com/@kafaatbyc?si=Vxhs5X3vQhSFVV01",
    icon: <YoutubeIcon />,
  },
  {
    label: "لينكدإن",
    href: "https://www.linkedin.com/company/جمعية-كفاءات-لـبناء-قدرات-الشباب/",
    icon: <LinkedInIcon />,
  },
  { label: "إكس", href: "https://x.com/KafaatBYC", icon: <XIcon /> },
  {
    label: "تيك توك",
    href: "https://www.tiktok.com/@kafaatbyc?_t=ZS-8yURjlh4To8&_r=1",
    icon: <TikTokIcon />,
  },
  {
    label: "إنستغرام",
    href: "https://www.instagram.com/kafaatbyc?igsh=MXc4MzhiNTJ6M2FtMA==",
    icon: <InstagramIcon />,
  },
] as const;

export function SuccessLinks() {
  return (
    <div className="mt-6 w-full max-w-sm">
      <div className="grid grid-cols-2 gap-2.5">
        <OutboundLink href={KAFAAT_SITE} className="border border-white/15 bg-white/[0.06] text-white hover:bg-white/10">
          موقع كفاءات
        </OutboundLink>
        <OutboundLink href={KAFAAT_WHATSAPP} className="bg-[#3dcb8c] text-white hover:bg-[#34b87e]">
          <WhatsAppIcon className="h-4 w-4" />
          واتساب
        </OutboundLink>
      </div>
      <p className="mb-2.5 mt-5 text-xs font-medium text-slate-400">وسائل التواصل</p>
      <div className="flex items-center justify-center gap-2">
        {SOCIAL_LINKS.map((item) => (
          <a
            key={item.label}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={item.label}
            title={item.label}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-white transition hover:bg-white/10"
          >
            {item.icon}
          </a>
        ))}
      </div>
    </div>
  );
}

function OutboundLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex h-11 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-bold transition ${className}`}
    >
      {children}
    </a>
  );
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden fill="currentColor">
      <path d="M23 12.2s0-3.2-.4-4.6c-.2-.9-.9-1.6-1.8-1.8C19.2 5.4 12 5.4 12 5.4s-7.2 0-8.8.4c-.9.2-1.6.9-1.8 1.8C1 9 1 12.2 1 12.2s0 3.2.4 4.6c.2.9.9 1.6 1.8 1.8 1.6.4 8.8.4 8.8.4s7.2 0 8.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.4.4-4.6.4-4.6zM9.8 15.5v-6.6l6.2 3.3-6.2 3.3z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden fill="currentColor">
      <path d="M4.7 3.3A2.2 2.2 0 1 0 4.7 7.7 2.2 2.2 0 0 0 4.7 3.3zM3 8.8h3.4V21H3V8.8zM9.2 8.8H12.5v1.7h.1c.5-.9 1.6-1.9 3.4-1.9 3.6 0 4.3 2.4 4.3 5.5V21H16.9v-5.4c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21H9.2V8.8z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden fill="currentColor">
      <path d="M17.6 3H20.4l-6.3 7.2L21.5 21h-5.6l-4.4-5.8L6.4 21H3.6l6.7-7.7L2.7 3h5.7l4 5.3L17.6 3zm-1 16.2h1.6L7.5 4.7H5.8l10.8 14.5z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden fill="currentColor">
      <path d="M14.5 3c.4 2.6 1.8 4.4 4.3 4.7v2.4c-1.5 0-2.9-.5-4.2-1.3v6.6c0 3.4-2.6 6.1-6.1 6.1S2.4 18.8 2.4 15.4c0-3.3 2.6-6 6-6.1v2.6c-1.9.1-3.4 1.7-3.4 3.5 0 2 1.6 3.5 3.5 3.5s3.4-1.6 3.4-3.6V3h2.6z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden fill="currentColor">
      <path d="M12 0C8.74 0 8.333.015 7.053.072 2.695.272.273 2.69.073 7.052.015 8.333 0 8.74 0 12c0 3.259.015 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.985 8.741 24 12 24c3.259 0 3.668-.015 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.618-6.78-6.98-6.98C15.668.014 15.259 0 12 0zm0 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}
