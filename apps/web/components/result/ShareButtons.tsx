"use client";

import { Copy, Download, Image as ImageIcon, Link as LinkIcon, MessageCircle, Twitter } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";

interface Props {
  token: string;
  displayCode: string;
}

const CARD_FORMATS = [
  { key: "square", label: "정사각형", size: "1080×1080", suffix: "" },
  { key: "story", label: "스토리", size: "1080×1920", suffix: "story/" },
  { key: "talk", label: "카톡", size: "720×900", suffix: "talk/" },
] as const;

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
    void handleCopy();
  };

  const cardBase = `/api/cards/${encodeURIComponent(token)}`;

  return (
    <section className="mx-auto mt-12 max-w-3xl px-4">
      <h2 className="text-center text-base font-semibold text-slate-900">결과 공유하기</h2>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <Button variant="outline" onClick={handleCopy}>
          {copied ? <Copy className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
          {copied ? "링크 복사됨" : "결과 링크 복사"}
        </Button>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`내 PRISM-K — ${displayCode}`)}&url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-soft hover:border-slate-300 hover:bg-slate-50"
        >
          <Twitter className="h-4 w-4" /> 트위터로 공유
        </a>
        <Button variant="kakao" onClick={handleKakao}>
          <MessageCircle className="h-4 w-4" /> 카카오톡으로 공유
        </Button>
        <Button variant="ghost" onClick={() => setInstaTipOpen((v) => !v)}>
          <ImageIcon className="h-4 w-4" /> 인스타그램 안내
        </Button>
      </div>

      {instaTipOpen ? (
        <p className="mx-auto mt-3 max-w-md rounded-xl border border-slate-200 bg-slate-50 p-3 text-center text-xs text-slate-600">
          인스타그램은 외부 자동 업로드를 지원하지 않습니다. 아래 카드를 다운로드한 뒤 직접
          업로드해 주세요.
        </p>
      ) : null}

      <Card className="mt-7 bg-slate-50/60">
        <CardBody className="p-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Download className="h-3.5 w-3.5" />
            결과 카드 다운로드
          </div>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
            {CARD_FORMATS.map((f) => (
              <a
                key={f.key}
                href={`${cardBase}/${f.suffix}`}
                download={`prism-k-${displayCode}-${f.key}.png`}
                className="group flex flex-col rounded-xl border border-slate-200 bg-white p-3.5 transition hover:border-slate-300 hover:shadow-soft"
              >
                <span className="text-sm font-semibold text-slate-900">{f.label}</span>
                <span className="text-xs text-slate-500">{f.size}</span>
                <span className="mt-2 inline-flex items-center gap-1 text-xs text-pattern-DI">
                  <Download className="h-3 w-3" />
                  PNG 다운로드
                </span>
              </a>
            ))}
          </div>
          <p className="mt-4 text-center text-[11px] text-slate-500">
            이미지에는 PRISM-K 윤리 안내 문구가 자동으로 포함됩니다.
          </p>
        </CardBody>
      </Card>
    </section>
  );
}
