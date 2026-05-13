"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";

export interface SectionEntry {
  id: number;
  title: string;
  description: string;
  body: JSX.Element | string;
}

export function SectionAccordion({ sections }: { sections: SectionEntry[] }): JSX.Element {
  const [openId, setOpenId] = useState<number | null>(sections[0]?.id ?? null);

  return (
    <ol className="mx-auto mt-10 max-w-3xl space-y-3 px-4">
      {sections.map((section) => {
        const open = section.id === openId;
        return (
          <li
            key={section.id}
            className={cn(
              "overflow-hidden rounded-2xl border bg-white shadow-soft transition-shadow",
              open ? "border-pattern-DI/40 shadow-soft-lg" : "border-slate-200",
            )}
          >
            <button
              type="button"
              onClick={() => setOpenId(open ? null : section.id)}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
              aria-expanded={open}
            >
              <span className="flex-1">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-pattern-DI/10 text-[11px] font-semibold text-pattern-DI">
                  {section.id}
                </span>
                <h3 className="mt-2 text-base font-semibold text-slate-900">{section.title}</h3>
                <p className="mt-0.5 text-xs text-slate-500">{section.description}</p>
              </span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 flex-shrink-0 text-slate-400 transition-transform",
                  open && "rotate-180 text-pattern-DI",
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
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-slate-100 bg-slate-50/40 px-5 py-5 text-sm leading-relaxed text-slate-700">
                    {section.body}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
            {/* Print-only mirror: expanded content always visible on paper. */}
            <div
              className="hidden print:block border-t border-slate-100 bg-white px-5 py-5 text-sm leading-relaxed text-slate-700"
              data-print="expand"
            >
              {section.body}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
