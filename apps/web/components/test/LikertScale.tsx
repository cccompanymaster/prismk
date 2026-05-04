"use client";

const LABELS: { value: 1 | 2 | 3 | 4 | 5 | 6; label: string }[] = [
  { value: 1, label: "전혀\n그렇지 않다" },
  { value: 2, label: "그렇지\n않다" },
  { value: 3, label: "약간\n그렇지 않다" },
  { value: 4, label: "약간\n그렇다" },
  { value: 5, label: "그렇다" },
  { value: 6, label: "매우\n그렇다" },
];

interface Props {
  itemId: number;
  value: 1 | 2 | 3 | 4 | 5 | 6 | null;
  onChange: (value: 1 | 2 | 3 | 4 | 5 | 6) => void;
}

export function LikertScale({ itemId, value, onChange }: Props): JSX.Element {
  return (
    <div role="radiogroup" aria-label={`item-${itemId}`} className="grid grid-cols-6 gap-1.5">
      {LABELS.map(({ value: v, label }) => {
        const selected = value === v;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(v)}
            className={`flex h-16 flex-col items-center justify-center rounded-lg border-2 px-1 text-[11px] leading-tight transition ${
              selected
                ? "border-pattern-DI bg-pattern-DI text-white shadow"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
            }`}
          >
            <span className="text-base font-bold">{v}</span>
            <span className="mt-0.5 whitespace-pre-line text-center">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
