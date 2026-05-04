"use client";

import { useState } from "react";

export function ShareButtons({ token }: { token: string }): JSX.Element {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/result/${token}` : "";

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="mx-auto mt-8 max-w-3xl">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:border-slate-300"
        >
          {copied ? "✓ 복사됨" : "결과 링크 복사"}
        </button>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("내 PRISM-K 결과")}&url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:border-slate-300"
        >
          트위터로 공유
        </a>
        <button
          type="button"
          disabled
          className="cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-400"
          title="Phase 4에서 결과 카드 다운로드 기능과 함께 활성화됩니다"
        >
          결과 카드 다운로드 (준비 중)
        </button>
      </div>
    </div>
  );
}
