"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { staffInputClassName } from "@/components/consultation/ui";

export function InviteConsultantForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
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
        body: JSON.stringify({ name, email }),
      });
      const result = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || !result.success) {
        setError(result.message ?? "تعذر إرسال الدعوة");
        return;
      }

      setMessage(result.message ?? "أُرسلت الدعوة");
      setName("");
      setEmail("");
      router.refresh();
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-[#e6e8ec]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#111827]">المستشارون</h2>
          <p className="mt-1 text-sm text-[#6b7280]">كل مستشار وعدد الاستشارات الظاهرة له.</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#111827] px-5 text-sm font-semibold text-white transition hover:bg-black"
        >
          دعوة مستشار
        </button>
      </div>

      {open ? (
        <form onSubmit={handleSubmit} className="mt-4 grid gap-3 border-t border-[#eef0f3] pt-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div>
            <label htmlFor="invite-name" className="mb-2 block text-sm font-semibold text-[#374151]">
              الاسم
            </label>
            <input
              id="invite-name"
              required
              minLength={2}
              className={staffInputClassName}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="اسم المستشار"
            />
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
            disabled={sending}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#157a43] px-5 text-sm font-semibold text-white transition hover:bg-[#126838] disabled:opacity-40"
          >
            {sending ? "جاري الإرسال..." : "إرسال الدعوة"}
          </button>
        </form>
      ) : null}

      {message ? <p className="mt-3 text-sm font-medium text-[#157a43]">{message}</p> : null}
      {error ? <p className="mt-3 text-sm font-medium text-[#b42318]">{error}</p> : null}
    </div>
  );
}
