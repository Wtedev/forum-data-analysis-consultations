"use client";

import { useState } from "react";

import { staffInputClassName } from "@/components/consultation/ui";
import type { AssignableConsultantId } from "@/lib/consultants";

type ConsultantOption = {
  id: AssignableConsultantId;
  label: string;
};

export function InviteConsultantForm({ consultants }: { consultants: ConsultantOption[] }) {
  const [consultantKey, setConsultantKey] = useState(consultants[0]?.id ?? "");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSending(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/consultants/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consultantKey, email }),
      });
      const result = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || !result.success) {
        setError(result.message ?? "تعذر إرسال الدعوة");
        return;
      }

      setMessage(result.message ?? "أُرسلت الدعوة");
      setEmail("");
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setSending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-[#e6e8ec]"
    >
      <h2 className="text-base font-semibold text-[#111827]">دعوة مستشار</h2>
      <p className="mt-1 text-sm text-[#6b7280]">
        يصل رابط تعيين كلمة المرور إلى بريده، وتظهر له الطلبات التي فضّلته.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <label htmlFor="invite-consultant" className="mb-2 block text-sm font-semibold text-[#374151]">
            المستشار
          </label>
          <select
            id="invite-consultant"
            className={staffInputClassName}
            value={consultantKey}
            onChange={(event) => setConsultantKey(event.target.value as AssignableConsultantId)}
          >
            {consultants.map((consultant) => (
              <option key={consultant.id} value={consultant.id}>
                {consultant.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="invite-email" className="mb-2 block text-sm font-semibold text-[#374151]">
            البريد
          </label>
          <input
            id="invite-email"
            type="email"
            dir="ltr"
            required
            placeholder="name@kafaat.org.sa"
            className={staffInputClassName}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={sending || !consultantKey}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#111827] px-5 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-40"
        >
          {sending ? "جاري الإرسال..." : "إرسال الدعوة"}
        </button>
      </div>

      {message ? <p className="mt-3 text-sm font-medium text-[#157a43]">{message}</p> : null}
      {error ? <p className="mt-3 text-sm font-medium text-[#b42318]">{error}</p> : null}
    </form>
  );
}
