"use client";

import { useState } from "react";
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
    <div className="mx-auto max-w-2xl px-4 py-12">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">두 사람의 매칭 분석</h1>
        <p className="mt-3 text-sm text-slate-600">
          두 사람의 결과 토큰과 관계 맥락을 입력하면, 갈등이 두드러지는 영역과 서로 채워주는 영역을
          알려드립니다.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <Field label="토큰 A">
          <input
            type="text"
            value={tokenA}
            onChange={(e) => setTokenA(e.target.value.trim())}
            placeholder="예: 12345678-aaaa-bbbb-cccc-..."
            required
            minLength={8}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </Field>
        <Field label="토큰 B">
          <input
            type="text"
            value={tokenB}
            onChange={(e) => setTokenB(e.target.value.trim())}
            placeholder="예: 87654321-zzzz-yyyy-xxxx-..."
            required
            minLength={8}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </Field>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-slate-700">관계 맥락</legend>
          <div className="flex flex-wrap gap-2">
            {CONTEXTS.map(({ key, label }) => {
              const selected = context === key;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => setContext(key)}
                  aria-pressed={selected}
                  className={`rounded-full border px-4 py-1.5 text-sm transition ${
                    selected
                      ? "border-pattern-DI bg-pattern-DI text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </fieldset>
        <button
          type="submit"
          disabled={loading || tokenA.length < 8 || tokenB.length < 8}
          className="w-full rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "분석 중…" : "매칭 분석하기"}
        </button>
      </form>

      {error ? (
        <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      {outcome ? <MatchResult outcome={outcome} /> : null}

      <p className="mt-12 text-center text-xs text-slate-500">
        이 분석은 자기이해의 도구이며, 관계 결정의 근거가 아닙니다.
      </p>
    </div>
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
    <article className="mt-10 space-y-5">
      <header className="rounded-2xl bg-slate-900 p-6 text-white">
        <p className="text-xs uppercase tracking-wide opacity-70">{outcome.contextLabel}</p>
        <h2 className="mt-1 text-2xl font-bold">{outcome.pairKor}</h2>
        <p className="mt-2 text-sm opacity-80">
          {outcome.participants.a.name ?? outcome.participants.a.mainPattern} ·{" "}
          {outcome.participants.b.name ?? outcome.participants.b.mainPattern}
        </p>
        {outcome.fallback ? (
          <p className="mt-3 inline-block rounded-full bg-white/20 px-2.5 py-1 text-xs">
            정확한 매트릭스 사례가 없어 일반 원리에서 추정한 결과입니다.
          </p>
        ) : null}
      </header>
      <Card label="자주 부딪히는 영역" body={outcome.conflict} />
      <Card label="서로 채워주는 영역" body={outcome.complement} />
      <Card label="함께 잘 살기 위한 한 가지" body={outcome.advice} />
    </article>
  );
}

function Card({ label, body }: { label: string; body: string }): JSX.Element {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-800">{body}</p>
    </section>
  );
}
