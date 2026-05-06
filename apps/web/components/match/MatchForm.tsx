"use client";

import { motion } from "framer-motion";
import { ArrowRight, Heart, Loader2, Search, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";
import { postMatch, type MatchOutcomeDto } from "@/lib/api";

const CONTEXTS = [
  { key: "work", label: "동료" },
  { key: "friend", label: "친구" },
  { key: "love", label: "연인" },
  { key: "family", label: "가족" },
] as const;

type ContextKey = (typeof CONTEXTS)[number]["key"];

export function MatchForm(): JSX.Element {
  const [tokenA, setTokenA] = useState("");
  const [tokenB, setTokenB] = useState("");
  const [context, setContext] = useState<ContextKey>("work");
  const [loading, setLoading] = useState(false);
  const [outcome, setOutcome] = useState<MatchOutcomeDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOutcome(null);
    try {
      const res = await postMatch({ tokenA, tokenB, context });
      setOutcome(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "매칭 분석에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="md" className="py-12">
      <header className="text-center">
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-pattern-DI/10 text-pattern-DI">
          <Users className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          두 사람의 매칭 분석
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
          두 사람의 결과 토큰과 관계 맥락을 입력하면, 갈등이 두드러지는 영역과 서로 채워주는
          영역을 알려드립니다.
        </p>
      </header>

      <Card className="mt-10">
        <CardBody className="p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="토큰 A">
              <input
                type="text"
                value={tokenA}
                onChange={(e) => setTokenA(e.target.value.trim())}
                placeholder="예: 12345678-aaaa-bbbb-cccc-…"
                required
                minLength={8}
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-mono outline-none transition focus:border-pattern-DI focus:ring-2 focus:ring-pattern-DI/20"
              />
            </Field>
            <Field label="토큰 B">
              <input
                type="text"
                value={tokenB}
                onChange={(e) => setTokenB(e.target.value.trim())}
                placeholder="예: 87654321-zzzz-yyyy-xxxx-…"
                required
                minLength={8}
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-mono outline-none transition focus:border-pattern-DI focus:ring-2 focus:ring-pattern-DI/20"
              />
            </Field>
            <fieldset>
              <legend className="text-sm font-medium text-slate-700">관계 맥락</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {CONTEXTS.map(({ key, label }) => {
                  const selected = context === key;
                  return (
                    <button
                      type="button"
                      key={key}
                      onClick={() => setContext(key)}
                      aria-pressed={selected}
                      className={cn(
                        "rounded-full border-2 px-4 py-1.5 text-sm font-medium transition",
                        selected
                          ? "border-pattern-DI bg-pattern-DI text-white shadow-soft"
                          : "border-slate-200 bg-white text-slate-700 hover:border-pattern-DI/40",
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <Button
              type="submit"
              variant="accent"
              size="lg"
              block
              disabled={loading || tokenA.length < 8 || tokenB.length < 8}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> 분석 중…
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" /> 매칭 분석하기
                </>
              )}
            </Button>
          </form>
        </CardBody>
      </Card>

      {error ? (
        <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      {outcome ? <MatchResult outcome={outcome} /> : null}

      <p className="mt-12 flex items-center justify-center gap-1.5 text-center text-xs text-slate-500">
        <Heart className="h-3.5 w-3.5" />
        이 분석은 자기이해의 도구이며, 관계 결정의 근거가 아닙니다.
      </p>
    </Container>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }): JSX.Element {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function MatchResult({ outcome }: { outcome: MatchOutcomeDto }): JSX.Element {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
      className="mt-10 space-y-4"
    >
      <header className="overflow-hidden rounded-3xl bg-slate-900 p-7 text-white">
        <p className="text-xs uppercase tracking-[0.3em] opacity-70">{outcome.contextLabel}</p>
        <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{outcome.pairKor}</h2>
        <p className="mt-2 text-sm opacity-80">
          {outcome.participants.a.name ?? outcome.participants.a.mainPattern}
          <span className="mx-2 opacity-50">×</span>
          {outcome.participants.b.name ?? outcome.participants.b.mainPattern}
        </p>
        {outcome.fallback ? (
          <p className="mt-4 inline-block rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur">
            정확한 매트릭스 사례가 없어 일반 원리에서 추정한 결과입니다.
          </p>
        ) : null}
      </header>
      <ResultCard label="자주 부딪히는 영역" body={outcome.conflict} icon="⚡" />
      <ResultCard label="서로 채워주는 영역" body={outcome.complement} icon="✨" />
      <ResultCard label="함께 잘 살기 위한 한 가지" body={outcome.advice} icon="🌱" />
      <p className="pt-1 text-center text-xs text-slate-500">
        결과는 90일 후 자동으로 만료됩니다.{" "}
        <a href="/match" className="text-slate-400 hover:text-slate-600">
          새 분석 시작 <ArrowRight className="inline h-3 w-3" />
        </a>
      </p>
    </motion.article>
  );
}

function ResultCard({
  label,
  body,
  icon,
}: {
  label: string;
  body: string;
  icon: string;
}): JSX.Element {
  return (
    <Card>
      <CardBody className="p-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <span aria-hidden>{icon}</span>
          {label}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-800">{body}</p>
      </CardBody>
    </Card>
  );
}
