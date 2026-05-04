"use client";

import { useState } from "react";

export interface SectionEntry {
  id: number;
  title: string;
  description: string;
  body: JSX.Element | string;
}

export function SectionAccordion({ sections }: { sections: SectionEntry[] }): JSX.Element {
  const [openId, setOpenId] = useState<number | null>(sections[0]?.id ?? null);

  return (
    <ol className="mx-auto mt-10 max-w-3xl space-y-3">
      {sections.map((section) => {
        const open = section.id === openId;
        return (
          <li
            key={section.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <button
              type="button"
              onClick={() => setOpenId(open ? null : section.id)}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
              aria-expanded={open}
            >
              <span>
                <span className="text-xs font-semibold text-slate-400">섹션 {section.id}</span>
                <h3 className="mt-0.5 text-base font-semibold text-slate-900">
                  {section.title}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">{section.description}</p>
              </span>
              <span className="text-slate-400" aria-hidden>
                {open ? "−" : "+"}
              </span>
            </button>
            {open ? (
              <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-5 text-sm leading-relaxed text-slate-700">
                {section.body}
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
