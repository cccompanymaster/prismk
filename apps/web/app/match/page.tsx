import type { Metadata } from "next";
import { MatchForm } from "@/components/match/MatchForm";

export const metadata: Metadata = {
  title: "두 사람의 매칭 분석",
  description:
    "두 사람의 PRISM-K 결과 토큰으로 갈등이 두드러지는 영역과 서로 채워주는 영역을 함께 살펴봅니다.",
  robots: { index: true, follow: true },
};

export default function MatchPage(): JSX.Element {
  return <MatchForm />;
}
