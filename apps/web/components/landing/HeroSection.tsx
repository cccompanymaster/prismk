"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function HeroSection(): JSX.Element {
  return (
    <section className="relative overflow-hidden bg-mesh">
      <div className="absolute inset-0 bg-grid-faint opacity-50" aria-hidden />
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-pattern-DI/30 blur-3xl"
        aria-hidden
      />

      <Container size="md" className="relative py-20 sm:py-28 text-center">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          <Badge variant="accent" size="md" className="mx-auto inline-flex">
            <Sparkles className="h-3.5 w-3.5" />
            Personality Reflection · Korean
          </Badge>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          className="mt-6 text-4xl font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-6xl"
        >
          나를 한 글자로
          <br />
          <span className="bg-gradient-to-r from-pattern-DI via-pattern-SS to-pattern-CA bg-clip-text text-transparent">
            가두지 않는 검사
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
          className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg"
        >
          16가지 성격 패턴 중 메인과 서브를 함께 보여드립니다.
          <br className="hidden sm:block" />
          256가지 정체성 코드(예: <code className="font-mono font-semibold text-pattern-DI">DI-SS</code>)로
          ‘지금의 나’를 표현하되, 결과는 자라난다는 전제를 잊지 않습니다.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            href="/test/lite"
            className={cn(buttonVariants({ variant: "accent", size: "lg" }), "w-full sm:w-auto")}
          >
            라이트판 시작 · 6분
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/test/full"
            className={cn(buttonVariants({ variant: "primary", size: "lg" }), "w-full sm:w-auto")}
          >
            풀 버전 시작 · 20-25분
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={4}
          className="mt-5 text-xs text-slate-500"
        >
          로그인 없이 익명으로 시작합니다. 결과는 365일간 토큰으로 보관됩니다.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={5}
          className="mt-14 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500"
        >
          <Badge variant="outline">256가지 코드</Badge>
          <Badge variant="outline">6 차원 × 24 facet</Badge>
          <Badge variant="outline">위험 신호 자동 점검</Badge>
        </motion.div>
      </Container>
    </section>
  );
}
