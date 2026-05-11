import { ImageResponse } from "next/og";
import { findPattern, patterns, type PatternId } from "@prism-k/data";

export const runtime = "nodejs";
export const alt = "PRISM-K 패턴 카드";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateImageMetadata(): { id: string; alt: string; size: typeof size; contentType: string }[] {
  return patterns.map((p) => ({
    id: p.id,
    alt: `${p.name} (${p.id}) — PRISM-K`,
    size,
    contentType: "image/png",
  }));
}

export default function PatternOg({ params }: { params: { id: string } }): Response {
  const p = findPattern(params.id);
  if (!p) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0f172a",
            color: "white",
            fontSize: 56,
            fontFamily: "sans-serif",
          }}
        >
          PRISM-K
        </div>
      ),
      size,
    );
  }

  const accent = p.signature.color;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          color: "white",
          fontFamily: "sans-serif",
          background: `linear-gradient(135deg, ${accent}, ${accent}88)`,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 360,
            height: 360,
            borderRadius: 360,
            background: "radial-gradient(circle, rgba(255,255,255,0.35), transparent 65%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -120,
            left: -120,
            width: 320,
            height: 320,
            borderRadius: 320,
            background: "radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 480,
            fontWeight: 900,
            opacity: 0.08,
            letterSpacing: "-0.04em",
          }}
        >
          {p.signature.word}
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 60,
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.08em",
              opacity: 0.9,
            }}
          >
            <div style={{ display: "flex" }}>PRISM-K</div>
            <div
              style={{
                display: "flex",
                background: "rgba(255,255,255,0.18)",
                borderRadius: 999,
                padding: "6px 14px",
                fontSize: 18,
                letterSpacing: "0.16em",
              }}
            >
              {p.signature.word}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div
              style={{
                display: "flex",
                fontSize: 28,
                fontWeight: 600,
                opacity: 0.75,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              Pattern · {p.id}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 180,
                fontWeight: 900,
                letterSpacing: "-0.05em",
                lineHeight: 0.9,
              }}
            >
              {p.id}
            </div>
            <div style={{ display: "flex", fontSize: 56, fontWeight: 700 }}>{p.name}</div>
            <div style={{ display: "flex", fontSize: 32, fontWeight: 500, opacity: 0.9 }}>
              “{p.shortSlogan}”
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              fontSize: 18,
              opacity: 0.85,
            }}
          >
            <div style={{ display: "flex" }}>시그니처 동물 · {p.signature.animal}</div>
            <div style={{ display: "flex", opacity: 0.5 }}>·</div>
            <div style={{ display: "flex" }}>prism-k.kr/patterns/{p.id}</div>
          </div>
        </div>
      </div>
    ),
    size,
  ) as unknown as Response;
}

export function generateStaticParams(): { id: PatternId }[] {
  return patterns.map((p) => ({ id: p.id }));
}
