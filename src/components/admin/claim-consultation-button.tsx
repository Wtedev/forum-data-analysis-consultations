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
        className="inline-flex rounded-lg bg-[#157a43] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-[#126838] disabled:opacity-40"
      >
        {claiming ? "جاري الأخذ..." : "أخذ الاستشارة"}
      </button>
      {error ? <span className="text-xs font-medium text-[#b42318]">{error}</span> : null}
    </span>
  );
}
