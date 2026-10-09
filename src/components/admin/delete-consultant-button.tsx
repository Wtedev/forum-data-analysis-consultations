"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteConsultantButton({
  id,
  name,
  kind,
}: {
  id: string;
  name: string;
  kind: "account" | "invite";
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    const confirmed = window.confirm(
      kind === "account"
        ? `حذف ${name}؟ سيُغلق حسابه وتُفك الاستشارات المسندة إليه.`
        : `حذف دعوة ${name}؟`,
    );
    if (!confirmed) return;

    setDeleting(true);
    setError(null);

    try {
      const path =
        kind === "account" ? `/api/admin/consultants/${id}` : `/api/admin/consultants/invites/${id}`;
      const response = await fetch(path, { method: "DELETE" });
      const result = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || !result.success) {
        setError(result.message ?? "تعذر الحذف");
        return;
      }

      router.refresh();
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={remove}
        disabled={deleting}
        className="inline-flex min-h-9 items-center justify-center rounded-lg bg-[#fdecec] px-3 text-sm font-semibold text-[#b42318] transition hover:bg-[#f8d7d7] disabled:opacity-40"
      >
        {deleting ? "جاري الحذف..." : "حذف"}
      </button>
      {error ? <span className="text-xs font-medium text-[#b42318]">{error}</span> : null}
    </div>
  );
}
