import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { MatchForm } from "@/components/match/MatchForm";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "두 사람의 매칭 분석",
  description:
    "두 사람의 PRISM-K 결과 토큰으로 갈등이 두드러지는 영역과 서로 채워주는 영역을 함께 살펴봅니다.",
  robots: { index: true, follow: true },
};

function MatchFallback(): JSX.Element {
  return (
    <Container size="sm" className="flex flex-col items-center py-24 text-sm text-slate-500">
      <Loader2 className="h-6 w-6 animate-spin text-pattern-DI" />
      <p className="mt-3">매칭 분석을 준비하고 있어요…</p>
    </Container>
  );
}

export default function MatchPage(): JSX.Element {
  return (
    <Suspense fallback={<MatchFallback />}>
      <MatchForm />
    </Suspense>
  );
}
