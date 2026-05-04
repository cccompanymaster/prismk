import Link from "next/link";

export function HeroSection(): JSX.Element {
  return (
    <section className="bg-gradient-to-br from-pattern-DI/10 via-white to-pattern-CA/10 py-20">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <p className="text-sm font-medium tracking-wide text-pattern-DI">
          Personality Reflection through Integrative Scaled Measurement, Korean
        </p>
        <h1 className="mt-4 text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
          나를 한 글자로 가두지 않는 검사
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-slate-600">
          16가지 성격 패턴 중 메인과 서브를 함께 보여드립니다. 256가지 정체성 코드 (DI-SS 등)로
          ‘지금의 나’를 표현하되, 결과는 자라난다는 전제를 잊지 않습니다.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/test/lite"
            className="inline-flex w-full items-center justify-center rounded-xl bg-pattern-DI px-6 py-3 text-base font-semibold text-white shadow-md transition hover:opacity-95 sm:w-auto"
          >
            라이트판 시작 · 6분
          </Link>
          <Link
            href="/test/full"
            className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-base font-semibold text-white shadow-md transition hover:opacity-95 sm:w-auto"
          >
            풀 버전 시작 · 20-25분
          </Link>
        </div>
        <p className="mt-4 text-xs text-slate-500">로그인 없이 익명으로 시작합니다.</p>
      </div>
    </section>
  );
}
