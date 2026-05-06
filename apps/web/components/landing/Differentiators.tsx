"use client";

import { motion } from "framer-motion";
import { Layers, Sparkles, Sprout } from "lucide-react";
import { Container } from "@/components/ui/Container";

interface Diff {
  title: string;
  body: string;
  Icon: typeof Sparkles;
  accent: string;
  iconBg: string;
}

const ITEMS: Diff[] = [
  {
    title: "이분법이 아닌 연속선",
    body: "‘외향이거나 내향이거나’가 아니라 6개 차원의 연속선 위에서의 위치를 보여드립니다. 검사할 때마다 결과가 흔들리는 일이 줄어듭니다.",
    Icon: Layers,
    accent: "text-pattern-DI",
    iconBg: "bg-pattern-DI/10",
  },
  {
    title: "메인 × 서브 코드",
    body: "16개 패턴의 조합으로 256가지 코드를 제공합니다. ‘DI-SS’처럼 두 패턴이 어우러진 모습을 자기 정체성의 단서로 사용할 수 있습니다.",
    Icon: Sparkles,
    accent: "text-pattern-SS",
    iconBg: "bg-pattern-SS/10",
  },
  {
    title: "자라남을 전제하는 결과",
    body: "결과는 ‘지금의 패턴’이지 ‘평생 라벨’이 아닙니다. 모든 결과 페이지에 변화 가능성과 성장 영역이 함께 안내됩니다.",
    Icon: Sprout,
    accent: "text-pattern-GC",
    iconBg: "bg-pattern-GC/10",
  },
];

const stagger = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function Differentiators(): JSX.Element {
  return (
    <section className="border-t border-slate-100 bg-white py-20">
      <Container>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center text-3xl font-bold tracking-tight text-slate-900"
        >
          기존 성격 검사와 무엇이 다른가요?
        </motion.h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-slate-600">
          정직성과 매력 사이의 균형을 위해 설계된 세 가지 차이입니다.
        </p>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {ITEMS.map((item, i) => (
            <motion.article
              key={item.title}
              custom={i}
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 shadow-soft transition-shadow hover:shadow-soft-lg"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.iconBg}`}
              >
                <item.Icon className={`h-6 w-6 ${item.accent}`} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
              <div
                className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br from-current/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden
              />
            </motion.article>
          ))}
        </div>
      </Container>
    </section>
  );
}
