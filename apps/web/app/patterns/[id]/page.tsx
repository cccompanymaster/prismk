import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findPattern, patterns, type PatternId } from "@prism-k/data";

export function generateStaticParams(): { id: PatternId }[] {
  return patterns.map((p) => ({ id: p.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const p = findPattern(params.id);
  if (!p) return { title: "알 수 없는 패턴" };
  return {
    title: `${p.name} (${p.id})`,
    description: p.shortSlogan,
  };
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <div className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700">{children}</div>
    </section>
  );
}

export default function PatternDetailPage({ params }: { params: { id: string } }): JSX.Element {
  const p = findPattern(params.id);
  if (!p) notFound();

  return (
    <article>
      <header
        className="text-white"
        style={{
          background: `linear-gradient(135deg, ${p.signature.color}, ${p.signature.color}aa)`,
        }}
      >
        <div className="mx-auto max-w-3xl px-4 py-14 text-center">
          <p className="text-sm uppercase tracking-wide opacity-80">{p.signature.word}</p>
          <h1 className="mt-2 text-5xl font-extrabold">{p.id}</h1>
          <p className="mt-3 text-2xl font-semibold">{p.name}</p>
          <p className="mt-4 text-base opacity-90">“{p.slogan}”</p>
          <p className="mt-2 text-xs opacity-70">시그니처 동물 · {p.signature.animal}</p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
        <Section title="이 패턴은 이런 모습이에요">
          {p.description.map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </Section>

        <Section title={`사례 · ${p.story.persona}`}>
          <p>{p.story.scene}</p>
        </Section>

        <Section title="강점 영역">
          <ul className="list-disc space-y-1 pl-5">
            {p.strengths.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </Section>

        <Section title="유의할 영역">
          <ul className="list-disc space-y-1 pl-5">
            {p.watchOuts.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </Section>

        <Section title="잘 어울리는 환경">
          <p>{p.fitsWith}</p>
        </Section>

        <Section title="자주 듣는 말">
          <ul className="list-disc space-y-1 pl-5">
            {p.oftenHeard.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </Section>

        <Section title="다시 바라보기">
          <p>{p.reframe}</p>
        </Section>

        <p className="text-center">
          <Link href="/patterns" className="text-sm text-slate-500 hover:text-slate-700">
            ← 16 패턴 사전으로 돌아가기
          </Link>
        </p>
      </div>
    </article>
  );
}
