import type { Metadata } from "next";
import Link from "next/link";
import { patterns } from "@prism-k/data";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "16 패턴 사전",
  description:
    "PRISM-K 16개 성격 패턴의 시그니처 컬러·동물·슬로건과 한 줄 소개를 한눈에 확인할 수 있습니다.",
};

export default function PatternsPage(): JSX.Element {
  return (
    <>
      <section className="border-b border-slate-100 bg-slate-50 py-16">
        <Container>
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-slate-500">16 Patterns · 256 Codes</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              16 패턴 사전
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-600">
              어떤 패턴도 다른 패턴보다 더 좋거나 나쁘지 않습니다. 각 패턴은 강점과 도전 영역의
              균형으로 구성되어 있어요.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container size="xl">
          <ul className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {patterns.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/patterns/${p.id}`}
                  className="group block h-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-soft-lg"
                >
                  <div
                    className="relative h-32 overflow-hidden p-5 text-white"
                    style={{
                      background: `linear-gradient(135deg, ${p.signature.color}, ${p.signature.color}cc)`,
                    }}
                  >
                    <span
                      className="pointer-events-none absolute -right-4 -top-4 select-none text-[7rem] font-black leading-none opacity-10"
                      aria-hidden
                    >
                      {p.id}
                    </span>
                    <p className="text-[11px] font-medium uppercase tracking-widest opacity-80">
                      {p.signature.word}
                    </p>
                    <p className="mt-1 text-3xl font-extrabold">{p.id}</p>
                    <p className="text-sm font-medium opacity-95">{p.name}</p>
                  </div>
                  <div className="p-5">
                    <p className="text-sm leading-relaxed text-slate-700">
                      “{p.shortSlogan}”
                    </p>
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                      <span>시그니처 동물 · {p.signature.animal}</span>
                      <span className="text-slate-400 transition-transform group-hover:translate-x-0.5">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
