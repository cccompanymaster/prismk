import Link from "next/link";

export default function HomePage(): JSX.Element {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-bold text-slate-900">PRISM-K</h1>
      <p className="mt-3 text-lg text-slate-600">
        한국형 차세대 성격 검사 (placeholder — 랜딩은 Task 3.2에서 채워집니다)
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/test/lite"
          className="rounded-lg bg-pattern-DI px-5 py-3 text-white shadow hover:opacity-95"
        >
          라이트판 시작 (6분)
        </Link>
        <Link
          href="/test/full"
          className="rounded-lg bg-slate-900 px-5 py-3 text-white shadow hover:opacity-95"
        >
          풀 버전 시작 (20-25분)
        </Link>
      </div>
    </div>
  );
}
