"use client";

import { UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ClaimConsultationButton({
  consultationId,
  onClaimed,
  variant = "soft",
  size = "md",
}: {
  consultationId: string;
  onClaimed?: (assignee: { id: string; name: string }) => void;
  variant?: "soft" | "bar";
  size?: "sm" | "md";
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);

  async function claim() {
    setClaiming(true);
    setError(null);

    try {
      const response = await fetch(`/api/consultant/consultations/${consultationId}/claim`, {
        method: "POST",
      });
      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
        assignedTo?: { id: string; name: string };
      };

      if (!response.ok || !result.success || !result.assignedTo) {
        setError(result.message ?? "تعذر أخذ الاستشارة");
        return;
      }

      onClaimed?.(result.assignedTo);
      router.refresh();
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setClaiming(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={claim}
        disabled={claiming}
        title="أخذ هذه الاستشارة لتصبح مسؤولاً عنها، وتختفي من بقية المستشارين"
        className={
          variant === "bar"
            ? size === "sm"
              ? "inline-flex h-8 shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-lg border border-[#d7eadf] bg-[#f3faf6] px-2.5 text-[12px] font-semibold leading-none text-[#1f7a4d] transition hover:bg-[#e7f6ee] disabled:opacity-40"
              : "inline-flex h-11 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-[#d7eadf] bg-[#f3faf6] px-3 text-[13px] font-semibold leading-none text-[#1f7a4d] transition hover:bg-[#e7f6ee] disabled:opacity-40"
            : "inline-flex items-center gap-1.5 rounded-full border border-[#d7f0e2] bg-[#f4fbf7] px-3 py-1.5 text-sm font-semibold text-[#157a43] transition hover:bg-[#e8f7ee] disabled:opacity-40"
        }
      >
        <UserCheck className={size === "sm" ? "h-3.5 w-3.5 shrink-0" : "h-4 w-4 shrink-0"} aria-hidden />
        {claiming ? "جاري الأخذ..." : variant === "bar" ? "استلام الاستشارة" : "أخذ الاستشارة"}
      </button>
      {error ? <span className="text-xs font-medium text-[#b42318]">{error}</span> : null}
    </span>
  );
}
