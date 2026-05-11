import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";

export default function NotFound(): JSX.Element {
  return (
    <Container size="sm" className="py-20 text-center">
      <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-pattern-DI/10 text-pattern-DI">
        <Compass className="h-7 w-7" />
      </div>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
        길을 잃은 페이지예요
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        주소가 정확한지 확인해 주세요. 결과 토큰은 발급 후 365일 동안 유효합니다.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "primary", size: "md" }))}
        >
          <ArrowLeft className="h-4 w-4" /> 홈으로
        </Link>
        <Link
          href="/patterns"
          className={cn(buttonVariants({ variant: "outline", size: "md" }))}
        >
          16 패턴 사전
        </Link>
      </div>
    </Container>
  );
}
