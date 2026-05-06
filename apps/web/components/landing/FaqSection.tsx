"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";

interface QA {
  q: string;
  a: string;
}

const FAQ: QA[] = [
  {
    q: "결과가 평생 라벨이 되나요?",
    a: "아니요. 본 결과는 ‘지금의 패턴’입니다. 결과 페이지에도 ‘이는 자라난다’는 안내가 함께 표시됩니다.",
  },
  {
    q: "회원가입이 필요한가요?",
    a: "아니요. 무로그인이 기본입니다. 가입 시에는 결과를 영구 보관할 수 있습니다.",
  },
  {
    q: "결과를 채용·결혼 결정에 사용해도 되나요?",
    a: "본 결과는 단독 결정 도구로 사용하지 않도록 설계되어 있습니다. 자기이해와 대화를 위한 자료로 활용해 주세요.",
  },
  {
    q: "어떤 데이터가 수집되나요?",
    a: "응답 내용 자체와 익명 메타데이터(접속 시간, 브라우저 정보 등)만 수집합니다. 실명·전화·주소는 수집하지 않습니다.",
  },
];

export function FaqSection(): JSX.Element {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="border-t border-slate-100 bg-white py-20">
      <Container size="md">
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
          자주 묻는 질문
        </h2>
        <ul className="mt-10 space-y-3">
          {FAQ.map((qa, idx) => {
            const open = idx === openIdx;
            return (
              <li
                key={qa.q}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(open ? null : idx)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={open}
                >
                  <span className="text-sm font-semibold text-slate-900">{qa.q}</span>
                  <Plus
                    className={cn(
                      "h-4 w-4 flex-shrink-0 text-slate-400 transition-transform",
                      open && "rotate-45 text-pattern-DI",
                    )}
                    strokeWidth={2.5}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {open ? (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] as const }}
                      className="overflow-hidden"
                    >
                      <p className="border-t border-slate-100 px-5 pb-5 pt-4 text-sm leading-relaxed text-slate-600">
                        {qa.a}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
