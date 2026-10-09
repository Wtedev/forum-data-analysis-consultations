"use client";

import { useState } from "react";

import { inputClassName } from "@/components/consultation/ui";

export function PasswordField({
  id,
  autoComplete,
  value,
  onChange,
  minLength,
  required,
}: {
  id: string;
  autoComplete: "new-password" | "current-password";
  value: string;
  onChange: (value: string) => void;
  minLength?: number;
  required?: boolean;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative" dir="ltr">
      <input
        id={id}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        dir="ltr"
        minLength={minLength}
        required={required}
        className={`${inputClassName} pr-12!`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-300 transition hover:text-white"
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-4.4" />
      <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-3.2 4.2" />
      <path d="M6.1 6.1C3.7 7.8 2 12 2 12s3.5 6 10 6c1.3 0 2.5-.2 3.6-.7" />
    </svg>
  );
}
