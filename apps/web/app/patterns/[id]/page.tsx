import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  CalendarCheck,
  Heart,
  Lightbulb,
  MessageCircle,
  Quote,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  findPattern,
  getPatternExtras,
  patterns,
  relationships,
  type PatternId,
} from "@prism-k/data";
import { Card, CardBody } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";

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

interface SectionProps {
  title: string;
  Icon: typeof Sparkles;
  children: React.ReactNode;
  accent: string;
}

function Section({ title, Icon, children, accent }: SectionProps): JSX.Element {
  return (
    <Card className="overflow-hidden">
      <CardBody className="p-7">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${accent}1a`, color: accent }}
          >
            <Icon className="h-5 w-5" />
          </div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        </div>
        <div className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700">{children}</div>
      </CardBody>
    </Card>
  );
}

export default function PatternDetailPage({ params }: { params: { id: string } }): JSX.Element {
  const p = findPattern(params.id);
  if (!p) notFound();

  const accent = p.signature.color;
  const idx = patterns.findIndex((x) => x.id === p.id);
  const prev = idx > 0 ? patterns[idx - 1] : patterns[patterns.length - 1];
  const next = idx >= 0 && idx < patterns.length - 1 ? patterns[idx + 1] : patterns[0];

  return (
    <article>
      {/* Hero */}
      <header
        className="relative overflow-hidden text-white"
        style={{
          background: `linear-gradient(135deg, ${accent}, ${accent}88)`,
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.4), transparent 40%)",
          }}
          aria-hidden
        />
        <Container size="md" className="relative py-16 text-center">
          <Link
            href="/patterns"
            className="inline-flex items-center gap-1 text-xs font-medium text-white/70 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> 패턴 사전
          </Link>
          <p className="mt-6 text-xs uppercase tracking-[0.3em] opacity-80">
            {p.signature.word}
          </p>
          <h1 className="mt-3 text-7xl font-black tracking-tight sm:text-8xl">{p.id}</h1>
          <p className="mt-3 text-2xl font-semibold sm:text-3xl">{p.name}</p>
          <p className="mt-4 text-base opacity-90">“{p.slogan}”</p>
          <div className="mt-6 inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-1.5 text-xs backdrop-blur">
            <span>{p.dimensionalKey}</span>
            <span className="opacity-50">·</span>
            <span>시그니처 동물 — {p.signature.animal}</span>
          </div>
        </Container>
      </header>

      <Container size="md" className="space-y-5 py-12">
        <Section title="이 패턴은 이런 모습이에요" Icon={Sparkles} accent={accent}>
          {p.description.map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </Section>

        <Section title={`사례 — ${p.story.persona}`} Icon={Quote} accent={accent}>
          <p className="italic text-slate-600">{p.story.scene}</p>
        </Section>

        <div className="grid gap-5 md:grid-cols-2">
          <Section title="강점 영역" Icon={TrendingUp} accent={accent}>
            <ul className="space-y-1.5">
              {p.strengths.map((s) => (
                <li key={s} className="flex items-start gap-2">
                  <span
                    className="mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: accent }}
                  />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </Section>
          <Section title="유의할 영역" Icon={Target} accent={accent}>
            <ul className="space-y-1.5">
              {p.watchOuts.map((s) => (
                <li key={s} className="flex items-start gap-2">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-300" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </Section>
        </div>

        <Section title="잘 어울리는 환경" Icon={Heart} accent={accent}>
          <p>{p.fitsWith}</p>
        </Section>

        <Section title="자주 듣는 말" Icon={MessageCircle} accent={accent}>
          <ul className="space-y-1.5">
            {p.oftenHeard.map((s) => (
              <li key={s} className="text-slate-600">
                {s}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="다시 바라보기" Icon={Lightbulb} accent={accent}>
          <p
            className="rounded-lg p-4 italic"
            style={{
              backgroundColor: `${accent}0d`,
              borderLeft: `3px solid ${accent}`,
            }}
          >
            {p.reframe}
          </p>
        </Section>

        {(() => {
          const extras = getPatternExtras(p.id);
          return (
            <>
              <Section title="잘 어울리는 직무 예시" Icon={Briefcase} accent={accent}>
                <ul className="flex flex-wrap gap-2">
                  {extras.careers.map((c) => (
                    <li
                      key={c}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-slate-500">
                  나열된 직무는 강점이 자연스럽게 발휘되기 쉬운 환경의 예시이며, 다른 영역에서의
                  성공 가능성을 제한하지 않습니다.
                </p>
              </Section>

              <Section title="커뮤니케이션 스타일" Icon={MessageCircle} accent={accent}>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      자연스러운 표현 방식
                    </p>
                    <p className="mt-1.5">{extras.communication.natural}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      상대에게서 필요한 것
                    </p>
                    <p className="mt-1.5">{extras.communication.needsFromOthers}</p>
                  </div>
                </div>
              </Section>

              <Section title="이번 달 시도해 볼 일상 루틴" Icon={CalendarCheck} accent={accent}>
                <ul className="space-y-1.5">
                  {extras.daily.map((d) => (
                    <li key={d} className="flex items-start gap-2">
                      <span
                        className="mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: accent }}
                      />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            </>
          );
        })()}

        {(() => {
          const fixtures = relationships.filter((r) => r.pair.includes(p.id));
          if (fixtures.length === 0) return null;
          return (
            <Section title="관계 매트릭스 사례" Icon={MessageCircle} accent={accent}>
              <ul className="space-y-3">
                {fixtures.map((r) => (
                  <li
                    key={r.pair}
                    className="rounded-lg border border-slate-100 bg-slate-50/50 p-3"
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {r.pairKor}{" "}
                      <span className="text-xs font-normal text-slate-500">· {r.context}</span>
                    </p>
                    <p className="mt-1.5 text-xs text-slate-600">{r.advice}</p>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-500">
                자세한 매칭 분석은{" "}
                <Link href="/match" className="underline">
                  매칭 페이지
                </Link>
                에서 두 사람의 토큰으로 함께 확인할 수 있어요.
              </p>
            </Section>
          );
        })()}

        <nav className="grid gap-3 pt-6 sm:grid-cols-2">
          {prev ? (
            <Link
              href={`/patterns/${prev.id}`}
              className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-soft"
            >
              <ArrowLeft className="h-4 w-4 flex-shrink-0 text-slate-400 group-hover:-translate-x-0.5" />
              <span className="flex-1">
                <span className="block text-[11px] uppercase tracking-wide text-slate-500">
                  이전 패턴
                </span>
                <span
                  className="mt-0.5 block text-sm font-semibold"
                  style={{ color: prev.signature.color }}
                >
                  {prev.id} · {prev.name}
                </span>
              </span>
            </Link>
          ) : null}
          {next ? (
            <Link
              href={`/patterns/${next.id}`}
              className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-right transition hover:border-slate-300 hover:shadow-soft sm:order-last"
            >
              <span className="flex-1">
                <span className="block text-[11px] uppercase tracking-wide text-slate-500">
                  다음 패턴
                </span>
                <span
                  className="mt-0.5 block text-sm font-semibold"
                  style={{ color: next.signature.color }}
                >
                  {next.id} · {next.name}
                </span>
              </span>
              <ArrowLeft className="h-4 w-4 flex-shrink-0 rotate-180 text-slate-400 group-hover:translate-x-0.5" />
            </Link>
          ) : null}
        </nav>

        <p className="pt-4 text-center">
          <Link
            href="/patterns"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" /> 16 패턴 사전으로 돌아가기
          </Link>
        </p>
      </Container>
    </article>
  );
}
