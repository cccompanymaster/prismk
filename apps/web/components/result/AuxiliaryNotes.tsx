import { auxiliaryRules } from "@prism-k/data";

interface AuxiliaryRow {
  code: "V" | "G";
  raw: number | null;
}

interface StressRow {
  code: string;
  raw: number | null;
  dominant: boolean;
}

interface Props {
  auxiliary: AuxiliaryRow[];
  stressPatterns: StressRow[];
}

function pickAuxMessage(code: "V" | "G", raw: number | null): string | null {
  if (raw === null) return null;
  const rule = auxiliaryRules[code];
  if (raw >= rule.high.threshold) return rule.high.message;
  if (raw < rule.low.threshold) return rule.low.message;
  return null;
}

export function AuxiliaryNotes({ auxiliary, stressPatterns }: Props): JSX.Element | null {
  const messages: { label: string; body: string }[] = [];

  for (const aux of auxiliary) {
    const msg = pickAuxMessage(aux.code, aux.raw);
    if (msg) {
      messages.push({
        label: aux.code === "V" ? "맥락적 변동성" : "성장 지향성",
        body: msg,
      });
    }
  }

  const dominant = stressPatterns.filter((s) => s.dominant).map((s) => s.code);
  if (dominant.length > 0) {
    messages.push({
      label: "스트레스 반응 우세 패턴",
      body: `다음 패턴이 우세합니다: ${dominant.join(", ")}. ‘스트레스 시 모습’ 섹션에서 회복 전략을 함께 살펴보세요.`,
    });
  }

  if (messages.length === 0) return null;

  return (
    <ul className="space-y-2">
      {messages.map((m) => (
        <li
          key={m.label}
          className="rounded-lg border border-slate-100 bg-slate-50/60 p-3 text-sm leading-relaxed text-slate-700"
        >
          <span className="font-semibold text-slate-900">{m.label}</span>
          <span className="block mt-1">{m.body}</span>
        </li>
      ))}
    </ul>
  );
}
