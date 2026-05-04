import { ImageResponse } from "next/og";
import { fetchResult } from "@/lib/api";
import { CARD_SIZES, renderCard } from "@/lib/card";

export const runtime = "nodejs";
export const alt = "내 PRISM-K 결과 카드";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SQUARE = CARD_SIZES.square;

export default async function OpenGraphImage({
  params,
}: {
  params: { token: string };
}): Promise<ImageResponse> {
  try {
    const result = await fetchResult(params.token);
    return new ImageResponse(
      (
        <div style={{ display: "flex", width: "100%", height: "100%", background: "#0f172a" }}>
          <div
            style={{
              width: size.height,
              height: size.height,
              transform: `scale(${size.height / SQUARE.height})`,
              transformOrigin: "top left",
              display: "flex",
            }}
          >
            <div style={{ width: SQUARE.width, height: SQUARE.height, display: "flex" }}>
              {renderCard({ result, format: "square" })}
            </div>
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: 60,
              color: "white",
              fontFamily: "sans-serif",
            }}
          >
            <div style={{ display: "flex", fontSize: 28, opacity: 0.7 }}>PRISM-K</div>
            <div style={{ display: "flex", marginTop: 16, fontSize: 56, fontWeight: 800 }}>
              내 코드
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 16,
                fontSize: 80,
                fontWeight: 900,
                color: result.patterns.main?.signature.color ?? "#a78bfa",
              }}
            >
              {result.code.display}
            </div>
            <div style={{ display: "flex", marginTop: 16, fontSize: 32, opacity: 0.85 }}>
              “{result.patterns.main?.slogan ?? ""}”
            </div>
          </div>
        </div>
      ),
      size,
    );
  } catch {
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
            fontSize: 48,
            fontFamily: "sans-serif",
          }}
        >
          PRISM-K
        </div>
      ),
      size,
    );
  }
}
