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
      <path d="M12 7.4A4.6 4.6 0 1 0 12 16.6 4.6 4.6 0 0 0 12 7.4zm0 7.6a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm5.9-8.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0zM12 4.6c1.6 0 1.8 0 2.4.1.6 0 1 .1 1.4.3.4.2.7.4 1 .7.3.3.5.6.7 1 .2.4.3.8.3 1.4.1.6.1.8.1 2.4s0 1.8-.1 2.4c0 .6-.1 1-.3 1.4-.2.4-.4.7-.7 1-.3.3-.6.5-1 .7-.4.2-.8.3-1.4.3-.6.1-.8.1-2.4.1s-1.8 0-2.4-.1c-.6 0-1-.1-1.4-.3-.4-.2-.7-.4-1-.7-.3-.3-.5-.6-.7-1-.2-.4-.3-.8-.3-1.4-.1-.6-.1-.8-.1-2.4s0-1.8.1-2.4c0-.6.1-1 .3-1.4.2-.4.4-.7.7-1 .3-.3.6-.5 1-.7.4-.2.8-.3 1.4-.3.6-.1.8-.1 2.4-.1zm0-1.6c-1.6 0-1.8 0-2.5.1-.7 0-1.2.1-1.6.3-.5.2-.9.5-1.3.9-.4.4-.7.8-.9 1.3-.2.4-.3.9-.3 1.6-.1.7-.1.9-.1 2.5s0 1.8.1 2.5c0 .7.1 1.2.3 1.6.2.5.5.9.9 1.3.4.4.8.7 1.3.9.4.2.9.3 1.6.3.7.1.9.1 2.5.1s1.8 0 2.5-.1c.7 0 1.2-.1 1.6-.3.5-.2.9-.5 1.3-.9.4-.4.7-.8.9-1.3.2-.4.3-.9.3-1.6.1-.7.1-.9.1-2.5s0-1.8-.1-2.5c0-.7-.1-1.2-.3-1.6-.2-.5-.5-.9-.9-1.3-.4-.4-.8-.7-1.3-.9-.4-.2-.9-.3-1.6-.3-.7-.1-.9-.1-2.5-.1z" />
    </svg>
  );
}
