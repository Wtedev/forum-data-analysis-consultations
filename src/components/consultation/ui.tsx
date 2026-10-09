import { clsx } from "clsx";
import type { ReactNode } from "react";

export const inputClassName =
  "w-full rounded-xl border border-slate-200/90 bg-white px-4 py-3.5 text-[15px] text-foreground shadow-sm outline-none transition placeholder:text-slate-400 focus:border-madrak-primary focus:ring-[3px] focus:ring-madrak-primary/15";

export const labelClassName = "mb-2 block text-sm font-medium text-slate-700";

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="mt-1.5 text-xs font-medium text-red-600" role="alert">
      {message}
    </p>
  );
}

export function RequiredMark() {
  return (
    <span className="text-madrak-primary" aria-hidden="true">
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
      {hint ? <p className="-mt-1 mb-2 text-xs text-slate-500">{hint}</p> : null}
      {children}
      <FieldError message={error} />
    </div>
  );
}

export function RadioOption({
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
          ? "border-madrak-primary bg-madrak-primary text-white shadow-md shadow-madrak-primary/20"
          : "border-slate-200 bg-white text-slate-700 hover:border-madrak-primary/40 hover:bg-madrak-primary/5",
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
        "inline-flex min-h-[48px] items-center justify-center rounded-xl bg-madrak-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-madrak-primary/25 transition hover:bg-[#057a7f] focus:outline-none focus:ring-[3px] focus:ring-madrak-primary/30 disabled:cursor-not-allowed disabled:opacity-55",
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
        "inline-flex min-h-[48px] items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-madrak-primary/30 hover:bg-slate-50 focus:outline-none focus:ring-[3px] focus:ring-madrak-primary/15 disabled:cursor-not-allowed disabled:opacity-55",
        className,
      )}
    >
      {children}
    </button>
  );
}
