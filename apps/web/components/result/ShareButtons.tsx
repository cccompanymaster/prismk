"use client";

import { useState } from "react";

interface Props {
  token: string;
  displayCode: string;
}

const CARD_FORMATS: { key: "square" | "story" | "talk"; label: string; suffix: string }[] = [
  { key: "square", label: "정사각형 (1080×1080)", suffix: "" },
  { key: "story", label: "스토리 (1080×1920)", suffix: "story/" },
  { key: "talk", label: "카톡 (720×900)", suffix: "talk/" },
];

export function ShareButtons({ token, displayCode }: Props): JSX.Element {
  const [copied, setCopied] = useState(false);
  const [instaTipOpen, setInstaTipOpen] = useState(false);
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

  const handleKakao = (): void => {
    const w = window as unknown as {
      Kakao?: { isInitialized: () => boolean; Share: { sendDefault: (opts: object) => void } };
    };
    if (w.Kakao && w.Kakao.isInitialized()) {
      w.Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: `내 PRISM-K — ${displayCode}`,
          description: "PRISM-K 검사 결과를 확인해 보세요",
          imageUrl: `${window.location.origin}/result/${token}/opengraph-image`,
          link: { mobileWebUrl: url, webUrl: url },
        },
      });
      return;
    }
    // Fallback: copy URL — Kakao SDK not initialized.
    void handleCopy();
  };

  const cardBase = `/api/cards/${encodeURIComponent(token)}`;

  return (
    <section className="mx-auto mt-10 max-w-3xl px-4">
      <h2 className="text-center text-base font-semibold text-slate-900">결과 공유하기</h2>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:border-slate-300"
        >
          {copied ? "✓ 링크 복사됨" : "결과 링크 복사"}
        </button>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`내 PRISM-K — ${displayCode}`)}&url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:border-slate-300"
        >
          트위터로 공유
        </a>
        <button
          type="button"
          onClick={handleKakao}
          className="rounded-xl border border-yellow-300 bg-yellow-100 px-4 py-2 text-sm text-yellow-900 hover:border-yellow-400"
        >
          카카오톡으로 공유
        </button>
        <button
          type="button"
          onClick={() => setInstaTipOpen((v) => !v)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:border-slate-300"
        >
          인스타그램 공유 안내
        </button>
      </div>

      {instaTipOpen ? (
        <p className="mx-auto mt-3 max-w-md rounded-lg bg-slate-50 p-3 text-center text-xs text-slate-600">
          인스타그램은 외부 자동 업로드를 지원하지 않습니다. 아래 카드를 다운로드한 뒤 직접
          업로드해 주세요.
        </p>
      ) : null}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
          결과 카드 다운로드
        </p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {CARD_FORMATS.map((f) => (
            <a
              key={f.key}
              href={`${cardBase}/${f.suffix}`}
              download={`prism-k-${displayCode}-${f.key}.png`}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-xs text-slate-700 hover:border-slate-300"
            >
              {f.label}
            </a>
          ))}
        </div>
        <p className="mt-3 text-center text-[11px] text-slate-500">
          이미지에는 PRISM-K 윤리 안내 문구가 자동으로 포함됩니다.
        </p>
      </div>
    </section>
  );
}
