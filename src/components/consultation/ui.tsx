import { clsx } from "clsx";
import type { ReactNode } from "react";

export const inputClassName =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-[15px] text-white shadow-none outline-none transition placeholder:text-slate-400 focus:border-forum-primary focus:ring-[3px] focus:ring-forum-primary/15 [color-scheme:dark] [&>option]:bg-[#0f1729]";

export const staffInputClassName =
  "w-full min-h-11 rounded-xl border border-[#e6e8ec] bg-[#f3f4f6] px-4 py-3 text-[15px] text-[#111827] shadow-none outline-none transition placeholder:text-[#9ca3af] focus:border-[#d1d5db] focus:bg-white focus:ring-2 focus:ring-black/5 [color-scheme:light] [&>option]:bg-white [&>option]:text-[#111827]";

export const labelClassName = "mb-2 block text-sm font-medium text-slate-200";

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="mt-1.5 text-xs font-medium text-red-400" role="alert">
      {message}
    </p>
  );
}

export function RequiredMark() {
  return (
    <span className="text-forum-primary" aria-hidden="true">
      {" "}
      *
    </span>
  );
}

export function FormField({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelClassName}>
        {label}
        {required ? <RequiredMark /> : null}
      </label>
      {hint ? <p className="-mt-1 mb-2 text-xs text-slate-400">{hint}</p> : null}
      {children}
      <FieldError message={error} />
    </div>
  );
}

export function RadioOption({
  name,
  value,
  label,
  icon,
  checked,
  onChange,
}: {
  name: string;
  value: string;
  label: string;
  icon?: ReactNode;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={clsx(
        "flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-3 text-center text-sm font-medium leading-snug transition",
        checked
          ? "border-forum-primary/70 bg-forum-primary/15 text-white ring-1 ring-forum-primary/40"
          : "border-white/10 bg-white/[0.04] text-slate-200 hover:border-forum-primary/40 hover:bg-forum-primary/5",
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      {icon}
      {label}
    </label>
  );
}

export function PrimaryButton({
  children,
  disabled,
  type = "button",
  onClick,
  className,
}: {
  children: ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "inline-flex min-h-[48px] items-center justify-center rounded-xl kf-gradient-bg px-6 py-3 text-sm font-bold text-[#061223] shadow-lg shadow-emerald-400/10 transition hover:brightness-110 focus:outline-none focus:ring-[3px] focus:ring-forum-primary/30 disabled:cursor-not-allowed disabled:opacity-55",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function StaffSecondaryButton({
  children,
  disabled,
  type = "button",
  onClick,
  className,
}: {
  children: ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "inline-flex min-h-11 items-center justify-center rounded-xl border border-[#e6e8ec] bg-white px-5 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#f7f8fa] focus:outline-none focus:ring-2 focus:ring-black/5 disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  disabled,
  type = "button",
  onClick,
  className,
}: {
  children: ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "inline-flex min-h-[48px] items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-forum-primary/30 hover:bg-white/[0.06] focus:outline-none focus:ring-[3px] focus:ring-forum-primary/15 disabled:cursor-not-allowed disabled:opacity-55",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function CheckboxOption({
  name,
  value,
  label,
  checked,
  onChange,
}: {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={clsx(
        "flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition",
        checked
          ? "border-forum-primary/70 bg-forum-primary/15 text-white ring-1 ring-forum-primary/40"
          : "border-white/10 bg-white/[0.04] text-slate-200 hover:border-forum-primary/40 hover:bg-forum-primary/5",
      )}
    >
      <input
        type="checkbox"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span dir="ltr">{label}</span>
    </label>
  );
}
