"use client";

import { useEffect, useState } from "react";

type Phase = "loading" | "text";

const LOADING_MS = 3600;
const TEXT_MS = 3200;
const DOT_STAGGER_MS = 220;

function LoadingDots() {
  return (
    <span className="flex items-center justify-center gap-2.5" aria-hidden>
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="coming-soon-dot size-2 rounded-full bg-white"
          style={{ animationDelay: `${index * DOT_STAGGER_MS}ms` }}
        />
      ))}
    </span>
  );
}

export function ComingSoonBadge() {
  const [phase, setPhase] = useState<Phase>("loading");

  useEffect(() => {
    const delay = phase === "loading" ? LOADING_MS : TEXT_MS;
    const timeoutId = setTimeout(() => {
      setPhase((current) => (current === "loading" ? "text" : "loading"));
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [phase]);

  return (
    <div
      className="rounded-full border border-[#068B90] p-0.5"
      role="status"
      aria-live="polite"
      aria-label={phase === "text" ? "قريبًا" : "جاري التحميل"}
    >
      <div className="relative flex h-11 min-w-[11rem] items-center justify-center rounded-full border-2 border-white bg-[#068B90] px-10 py-3 sm:h-12 sm:min-w-[12rem] sm:px-12">
        <span
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease-in-out ${
            phase === "loading" ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={phase !== "loading"}
        >
          <LoadingDots />
        </span>
        <span
          className={`text-lg font-bold leading-none text-white transition-opacity duration-700 ease-in-out sm:text-xl ${
            phase === "text" ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={phase !== "text"}
        >
          قريبًـا
        </span>
      </div>
    </div>
  );
}
