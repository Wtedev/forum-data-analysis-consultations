"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ClaimConsultationButton({
  consultationId,
  onClaimed,
  variant = "soft",
}: {
  consultationId: string;
  onClaimed?: (assignee: { id: string; name: string }) => void;
  variant?: "soft" | "bar";
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
            ? "inline-flex h-11 items-center justify-center rounded-xl bg-[#e4ad45] px-3 text-sm font-bold text-white transition hover:bg-[#d9a13a] disabled:opacity-40"
            : "inline-flex rounded-full border border-[#d7f0e2] bg-[#f4fbf7] px-3 py-1.5 text-sm font-semibold text-[#157a43] transition hover:bg-[#e8f7ee] disabled:opacity-40"
        }
      >
        {claiming ? "جاري الأخذ..." : variant === "bar" ? "استلام الاستشارة" : "أخذ الاستشارة"}
      </button>
      {error ? <span className="text-xs font-medium text-[#b42318]">{error}</span> : null}
    </span>
  );
}
