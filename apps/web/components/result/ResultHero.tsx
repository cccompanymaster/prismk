import type { ResultDto } from "@/lib/api";

export function ResultHero({ result }: { result: ResultDto }): JSX.Element {
  const main = result.patterns.main;
  const sub = result.patterns.sub;
  const accent = main?.signature.color ?? "#7E57C2";

  return (
    <section
      className="relative overflow-hidden text-white"
      style={{
        background: `linear-gradient(135deg, ${accent}, ${sub?.signature.color ?? accent})`,
      }}
    >
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        {result.version === "lite" ? (
          <p className="mb-4 inline-block rounded-full bg-white/20 px-3 py-1 text-xs">
            라이트판 결과 · 약식 추정 (정밀 결과는 풀 버전)
          </p>
        ) : null}
        <p className="text-sm opacity-80">{main?.signature.word}</p>
        <h1 className="mt-2 text-5xl font-extrabold tracking-tight sm:text-6xl">
          {result.code.display}
        </h1>
        <p className="mt-4 text-xl font-medium">
          {main ? main.name : ""}
          {sub ? <span className="opacity-80"> × {sub.name}</span> : null}
        </p>
        {main ? <p className="mt-3 text-base opacity-90">“{main.slogan}”</p> : null}
      </div>
    </section>
  );
}
