"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ClaimConsultationButton({
  consultationId,
  onClaimed,
}: {
  consultationId: string;
  onClaimed?: (assignee: { id: string; name: string }) => void;
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
        setError(result.message ?? "تعذر اختيار الطلب");
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
        className="inline-flex rounded-lg bg-[#111827] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-40"
      >
        {claiming ? "جاري الاختيار..." : "اختيار"}
      </button>
      {error ? <span className="text-xs font-medium text-[#b42318]">{error}</span> : null}
    </span>
  );
}
