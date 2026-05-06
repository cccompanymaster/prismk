"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";

interface Version {
  href: string;
  badge: string;
  title: string;
  duration: string;
  description: string;
  bullets: string[];
  cta: string;
  variant: "accent" | "primary";
  border: string;
  bgGlow: string;
}

const VERSIONS: Version[] = [
  {
    href: "/test/lite",
    badge: "라이트판",
    title: "내 패턴 빠르게 보기",
    duration: "36문항 · 약 6분",
    description: "메인+서브 코드와 짧은 해석을 받아볼 수 있습니다.",
    bullets: [
      "16 패턴 중 가장 가까운 메인+서브 매칭",
      "주요 강점 3가지와 한 줄 슬로건",
      "결과 카드 다운로드 (인스타·카카오용)",
    ],
    cta: "라이트판 시작",
    variant: "accent",
    border: "border-pattern-DI/30",
    bgGlow: "from-pattern-DI/10 to-transparent",
  },
  {
    href: "/test/full",
    badge: "풀 버전",
    title: "더 깊은 자기 이해",
    duration: "136문항 · 약 20-25분",
    description: "24개 facet 점수와 8개 섹션 리포트가 함께 제공됩니다.",
    bullets: [
      "6 차원 + 24 facet 정밀 프로파일",
      "스트레스·성장 영역 맞춤 가이드",
      "신뢰구간 표시와 위험 신호 점검",
    ],
    cta: "풀 버전 시작",
    variant: "primary",
    border: "border-slate-900/20",
    bgGlow: "from-slate-900/5 to-transparent",
  },
];

export function VersionCards(): JSX.Element {
  return (
    <section className="bg-slate-50 py-20">
      <Container>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center text-3xl font-bold tracking-tight text-slate-900"
        >
          어느 검사를 해보시겠어요?
        </motion.h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          두 검사 모두 무료이며, 로그인은 선택입니다.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {VERSIONS.map((v, i) => (
            <motion.article
              key={v.href}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.1, duration: 0.55 }}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-3xl border-2 bg-white p-8 shadow-soft transition-shadow hover:shadow-soft-lg",
                v.border,
              )}
            >
              <div
                className={cn(
                  "pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br opacity-70",
                  v.bgGlow,
                )}
                aria-hidden
              />
              <Badge variant="outline" size="md" className="self-start">
                {v.badge}
              </Badge>
              <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                {v.title}
              </h3>
              <p className="mt-1 text-sm font-medium text-slate-500">{v.duration}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{v.description}</p>
              <ul className="mt-6 flex-1 space-y-2.5 text-sm text-slate-700">
                {v.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-pattern-DI/10 text-pattern-DI">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={v.href}
                className={cn(
                  buttonVariants({ variant: v.variant, size: "lg", block: true }),
                  "mt-8 group-hover:translate-y-[-1px]",
                )}
              >
                {v.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.article>
          ))}
        </div>
      </Container>
    </section>
  );
}
