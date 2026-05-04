import { ImageResponse } from "next/og";
import { fetchResult } from "@/lib/api";
import { CARD_SIZES, renderCard } from "@/lib/card";

export const runtime = "nodejs";

const SIZE = CARD_SIZES.story;

export async function GET(
  _req: Request,
  { params }: { params: { token: string } },
): Promise<Response> {
  try {
    const result = await fetchResult(params.token);
    return new ImageResponse(renderCard({ result, format: "story" }), {
      width: SIZE.width,
      height: SIZE.height,
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
