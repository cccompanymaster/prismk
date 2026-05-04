import Link from "next/link";

interface Version {
  href: string;
  badge: string;
  title: string;
  duration: string;
  description: string;
  bullets: string[];
  cta: string;
  accent: string;
}

const VERSIONS: Version[] = [
  {
    href: "/test/lite",
    badge: "라이트판",
    title: "내 패턴 빠르게 보기",
    duration: "36문항 · 약 6분",
    description: "메인+서브 코드와 짧은 해석을 받아볼 수 있습니다.",
    bullets: [
      "16 패턴 중 가장 가까운 메인+서브 매칭",
      "주요 강점 3가지와 한 줄 슬로건",
      "결과 카드 다운로드 (인스타·카카오용)",
    ],
    cta: "라이트판 시작",
    accent: "border-pattern-DI",
  },
  {
    href: "/test/full",
    badge: "풀 버전",
    title: "더 깊은 자기 이해",
    duration: "136문항 · 약 20-25분",
    description: "24개 facet 점수와 8개 섹션 리포트가 함께 제공됩니다.",
    bullets: [
      "6 차원 + 24 facet 정밀 프로파일",
      "스트레스·성장 영역 맞춤 가이드",
      "신뢰구간 표시와 위험 신호 점검",
    ],
    cta: "풀 버전 시작",
    accent: "border-slate-900",
  },
];

export function VersionCards(): JSX.Element {
  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="text-center text-2xl font-bold text-slate-900">
          어느 검사를 해보시겠어요?
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          두 검사 모두 무료이며, 로그인은 선택입니다.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {VERSIONS.map((v) => (
            <article
              key={v.href}
              className={`flex flex-col rounded-2xl border-2 ${v.accent} bg-white p-7 shadow-sm`}
            >
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {v.badge}
              </span>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">{v.title}</h3>
              <p className="mt-1 text-sm font-medium text-slate-500">{v.duration}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{v.description}</p>
              <ul className="mt-5 flex-1 space-y-2 text-sm text-slate-700">
                {v.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-slate-400" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={v.href}
                className="mt-7 inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow hover:opacity-95"
              >
                {v.cta}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
