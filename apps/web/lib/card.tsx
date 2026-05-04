import type { ResultDto } from "@/lib/api";

const ETHICS_FOOTER =
  "이는 현재의 패턴이며 자라납니다. 채용·인사·결혼 결정에 단독 사용되지 않습니다.";

export type CardFormat = "square" | "story" | "talk";

export interface CardDimensions {
  width: number;
  height: number;
  scale: number;
}

export const CARD_SIZES: Record<CardFormat, CardDimensions> = {
  square: { width: 1080, height: 1080, scale: 1 },
  story: { width: 1080, height: 1920, scale: 1 },
  talk: { width: 720, height: 900, scale: 0.85 },
};

interface RendererInput {
  result: ResultDto;
  format: CardFormat;
  siteHost?: string;
}

export function renderCard({ result, format, siteHost = "prism-k.kr" }: RendererInput): JSX.Element {
  const main = result.patterns.main;
  const sub = result.patterns.sub;
  const accent = main?.signature.color ?? "#7E57C2";
  const accentSub = sub?.signature.color ?? accent;
  const dim = CARD_SIZES[format];

  const codeFontSize = format === "story" ? 240 : format === "square" ? 200 : 160;
  const nameFontSize = format === "story" ? 64 : format === "square" ? 56 : 44;
  const sloganFontSize = format === "story" ? 48 : format === "square" ? 40 : 32;
  const watermarkFontSize = format === "story" ? 320 : format === "square" ? 280 : 220;
  const footerFontSize = format === "story" ? 22 : format === "square" ? 20 : 16;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        background: `linear-gradient(135deg, ${accent} 0%, ${accentSub} 100%)`,
        color: "white",
        fontFamily: "sans-serif",
        padding: format === "story" ? 80 : 60,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: format === "story" ? 200 : 120,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: watermarkFontSize,
          fontWeight: 900,
          color: "white",
          opacity: 0.07,
          letterSpacing: "0.02em",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {main?.signature.word ?? ""}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: footerFontSize + 4,
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          opacity: 0.85,
        }}
      >
        <div style={{ display: "flex" }}>PRISM-K</div>
        <div style={{ display: "flex", opacity: 0.7 }}>
          {result.version === "lite" ? "LITE" : "FULL"}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: format === "story" ? 32 : 24,
          textAlign: "center",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: codeFontSize,
            fontWeight: 900,
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          {result.code.display}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: nameFontSize,
            fontWeight: 700,
            opacity: 0.95,
          }}
        >
          {main?.name ?? ""}
          {sub ? ` × ${sub.name}` : ""}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: sloganFontSize,
            fontWeight: 500,
            opacity: 0.9,
            maxWidth: "90%",
          }}
        >
          “{main?.slogan ?? ""}”
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          fontSize: footerFontSize,
          opacity: 0.85,
        }}
      >
        <div style={{ display: "flex" }}>
          #내PRISM #{result.code.display.replace("-", "")} · {siteHost}
        </div>
        <div style={{ display: "flex", opacity: 0.75, fontSize: footerFontSize - 2 }}>
          {ETHICS_FOOTER}
        </div>
      </div>
    </div>
  );
}
