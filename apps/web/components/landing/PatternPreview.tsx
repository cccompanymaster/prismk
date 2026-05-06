"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { patterns } from "@prism-k/data";
import { Container } from "@/components/ui/Container";

export function PatternPreview(): JSX.Element {
  return (
    <section className="bg-slate-900 py-20 text-white">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/60">16 Patterns</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              16개 패턴, 256가지 코드
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/70">
              어떤 패턴도 다른 패턴보다 더 좋거나 나쁘지 않습니다. 각 패턴은 강점과 도전 영역의
              균형으로 구성되어 있어요.
            </p>
          </div>
          <Link
            href="/patterns"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white"
          >
            전체 사전 보기 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-8">
          {patterns.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: (i % 8) * 0.04, duration: 0.4 }}
            >
              <Link
                href={`/patterns/${p.id}`}
                className="group block aspect-square overflow-hidden rounded-2xl"
                style={{
                  background: `linear-gradient(135deg, ${p.signature.color}, ${p.signature.color}aa)`,
                }}
              >
                <div className="flex h-full w-full flex-col justify-between p-3 text-white transition-transform group-hover:scale-105">
                  <span className="text-[10px] uppercase tracking-widest opacity-80">
                    {p.signature.word}
                  </span>
                  <div>
                    <p className="text-2xl font-extrabold leading-none">{p.id}</p>
                    <p className="mt-1 text-[11px] leading-tight opacity-90">{p.name}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
