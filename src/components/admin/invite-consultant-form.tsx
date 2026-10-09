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
    <div className="rounded-2xl bg-white px-4 py-4 shadow-[0_8px_20px_rgba(62,76,134,0.05)] ring-1 ring-[#eef0f6]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#3e4c86]">المستشارون</h2>
          <p className="mt-1 text-sm font-medium text-[#8b93ab]">كل مستشار وعدد الاستشارات الظاهرة له.</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="inline-flex h-10 items-center justify-center rounded-full bg-[#3e4c86] px-4 text-[13px] font-bold text-white transition hover:bg-[#354272]"
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
            className="inline-flex h-10 items-center justify-center rounded-full bg-[#3e4c86] px-4 text-[13px] font-bold text-white transition hover:bg-[#354272] disabled:opacity-40"
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
