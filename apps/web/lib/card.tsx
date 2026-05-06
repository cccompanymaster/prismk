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

interface FormatScale {
  padding: number;
  watermarkSize: number;
  eyebrowSize: number;
  codeSize: number;
  nameSize: number;
  sloganSize: number;
  hashtagSize: number;
  footerSize: number;
  brandSize: number;
  decorRadius: number;
}

const SCALES: Record<CardFormat, FormatScale> = {
  square: {
    padding: 60,
    watermarkSize: 280,
    eyebrowSize: 22,
    codeSize: 220,
    nameSize: 56,
    sloganSize: 40,
    hashtagSize: 22,
    footerSize: 18,
    brandSize: 22,
    decorRadius: 200,
  },
  story: {
    padding: 80,
    watermarkSize: 360,
    eyebrowSize: 26,
    codeSize: 260,
    nameSize: 64,
    sloganSize: 46,
    hashtagSize: 24,
    footerSize: 20,
    brandSize: 26,
    decorRadius: 280,
  },
  talk: {
    padding: 50,
    watermarkSize: 220,
    eyebrowSize: 18,
    codeSize: 180,
    nameSize: 44,
    sloganSize: 32,
    hashtagSize: 18,
    footerSize: 14,
    brandSize: 18,
    decorRadius: 160,
  },
};

export function renderCard({ result, format, siteHost = "prism-k.kr" }: RendererInput): JSX.Element {
  const main = result.patterns.main;
  const sub = result.patterns.sub;
  const accent = main?.signature.color ?? "#7E57C2";
  const accentSub = sub?.signature.color ?? accent;
  const s = SCALES[format];

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
        padding: s.padding,
        boxSizing: "border-box",
      }}
    >
      {/* Decorative top-right glow */}
      <div
        style={{
          position: "absolute",
          top: -s.decorRadius / 2,
          right: -s.decorRadius / 2,
          width: s.decorRadius,
          height: s.decorRadius,
          borderRadius: s.decorRadius,
          background: "radial-gradient(circle, rgba(255,255,255,0.35), transparent 70%)",
          display: "flex",
        }}
      />
      {/* Decorative bottom-left glow */}
      <div
        style={{
          position: "absolute",
          bottom: -s.decorRadius / 2,
          left: -s.decorRadius / 2,
          width: s.decorRadius,
          height: s.decorRadius,
          borderRadius: s.decorRadius,
          background: "radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%)",
          display: "flex",
        }}
      />

      {/* Watermark of 한 단어 */}
      <div
        style={{
          position: "absolute",
          top: format === "story" ? 240 : 140,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: s.watermarkSize,
          fontWeight: 900,
          color: "white",
          opacity: 0.06,
          letterSpacing: "-0.02em",
          display: "flex",
          justifyContent: "center",
          lineHeight: 1,
        }}
      >
        {main?.signature.word ?? ""}
      </div>

      {/* Top bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: s.brandSize,
          fontWeight: 700,
          letterSpacing: "0.08em",
          opacity: 0.9,
        }}
      >
        <div style={{ display: "flex" }}>PRISM-K</div>
        <div
          style={{
            display: "flex",
            opacity: 0.85,
            background: "rgba(255,255,255,0.18)",
            borderRadius: 999,
            padding: "6px 14px",
            fontSize: s.brandSize - 4,
            letterSpacing: "0.12em",
          }}
        >
          {result.version === "lite" ? "LITE" : "FULL"}
        </div>
      </div>

      {/* Main content centered */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: format === "story" ? 28 : 22,
          textAlign: "center",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: s.eyebrowSize,
            fontWeight: 600,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            opacity: 0.75,
          }}
        >
          {main?.signature.word ?? "PRISM-K"}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: s.codeSize,
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 0.9,
          }}
        >
          {result.code.display}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: s.nameSize,
            fontWeight: 700,
            opacity: 0.96,
          }}
        >
          {main?.name ?? ""}
          {sub ? ` × ${sub.name}` : ""}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: s.sloganSize,
            fontWeight: 500,
            opacity: 0.92,
            maxWidth: "85%",
            fontStyle: "italic",
          }}
        >
          “{main?.slogan ?? ""}”
        </div>
        {/* Divider */}
        <div
          style={{
            display: "flex",
            width: 64,
            height: 3,
            background: "rgba(255,255,255,0.6)",
            borderRadius: 999,
            marginTop: 8,
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: s.hashtagSize,
            fontWeight: 600,
            opacity: 0.85,
            letterSpacing: "0.04em",
          }}
        >
          #내PRISM #{result.code.display.replace("-", "")}
        </div>
      </div>

      {/* Bottom: site + ethics */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          opacity: 0.9,
        }}
      >
        <div style={{ display: "flex", fontSize: s.footerSize, fontWeight: 600 }}>{siteHost}</div>
        <div
          style={{
            display: "flex",
            fontSize: s.footerSize - 2,
            opacity: 0.75,
            textAlign: "center",
          }}
        >
          {ETHICS_FOOTER}
        </div>
      </div>
    </div>
  );
}
