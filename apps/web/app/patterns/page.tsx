import type { Metadata } from "next";
import Link from "next/link";
import { patterns } from "@prism-k/data";

export const metadata: Metadata = {
  title: "16 패턴 사전",
  description:
    "PRISM-K 16개 성격 패턴의 시그니처 컬러·동물·슬로건과 한 줄 소개를 한눈에 확인할 수 있습니다.",
};

export default function PatternsPage(): JSX.Element {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">16 패턴 사전</h1>
        <p className="mt-3 text-sm text-slate-600">
          어떤 패턴도 다른 패턴보다 더 좋거나 나쁘지 않습니다. 각 패턴은 강점과 도전 영역의 균형으로
          구성되어 있어요.
        </p>
      </header>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {patterns.map((p) => (
          <li key={p.id}>
            <Link
              href={`/patterns/${p.id}`}
              className="group block h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div
                className="h-24 px-5 py-4 text-white"
                style={{
                  background: `linear-gradient(135deg, ${p.signature.color}, ${p.signature.color}cc)`,
                }}
              >
                <p className="text-xs uppercase tracking-wide opacity-80">{p.signature.word}</p>
                <p className="mt-1 text-2xl font-bold">{p.id}</p>
                <p className="text-sm opacity-90">{p.name}</p>
              </div>
              <div className="px-5 py-4">
                <p className="text-sm leading-relaxed text-slate-700 group-hover:text-slate-900">
                  “{p.shortSlogan}”
                </p>
                <p className="mt-3 text-xs text-slate-500">시그니처 동물 · {p.signature.animal}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
