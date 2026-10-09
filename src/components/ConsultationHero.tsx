import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import {
  ForumLogosBar,
  ForumPill,
  ForumTitle,
} from "@/components/consultation/forum-brand";

export default function ConsultationHero() {
  return (
    <main className="kf-page relative min-h-dvh overflow-hidden px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100dvh-3rem)] max-w-3xl flex-col gap-6 sm:min-h-[calc(100dvh-5rem)]">
        <ForumLogosBar />

        <section className="kf-glass flex flex-1 flex-col items-center justify-center rounded-[2rem] px-6 py-12 text-center sm:px-12 sm:py-16">
          <ForumPill>ملتقى</ForumPill>

          <div className="mt-8">
            <ForumTitle size="lg" />
          </div>

          <p className="mt-8 max-w-xl text-sm leading-[1.95] text-slate-300 sm:text-base">
            عندك بيانات وتحتاج من يساعدك تفهمها؟ نقدّم للمستفيدين استشارات في تحليل
            البيانات تساعدهم على تنظيمها وتحليلها وتحويلها إلى رؤى تدعم اتخاذ القرار
            في القطاع غير الربحي.
          </p>

          <Link
            href="/consultation"
            className="kf-gradient-bg group mt-10 inline-flex min-h-[52px] items-center gap-2 rounded-xl px-8 text-base font-bold text-[#061223] shadow-lg shadow-emerald-400/10 transition hover:brightness-110"
          >
            <span>اطلب استشارة</span>
            <ChevronLeft
              className="h-5 w-5 transition group-hover:-translate-x-0.5"
              aria-hidden
            />
          </Link>
        </section>

        <p className="text-center text-xs tracking-wide text-slate-500">
          بناء قدرات الشباب
          <span className="mt-0.5 block text-[10px] uppercase text-slate-600">
            Building Youth Capacities
          </span>
        </p>
      </div>
    </main>
  );
}
