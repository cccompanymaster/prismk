import { Heart, Sparkles, TrendingUp } from "lucide-react";

interface StrengthEntry {
  facet: string;
  tScore: number;
}

interface Props {
  displayCode: string;
  mainName: string;
  subName: string | null;
  shortSlogan: string;
  accent: string;
  topStrengths: StrengthEntry[];
  dominantStress: string | null;
}

function facetShort(facet: string): string {
  const parts = facet.split("_");
  return parts[1] ?? facet;
}

export function SummaryCard({
  displayCode,
  mainName,
  subName,
  shortSlogan,
  accent,
  topStrengths,
  dominantStress,
}: Props): JSX.Element {
  return (
    <section
      className="mx-auto -mt-12 max-w-3xl px-4"
      aria-label="결과 요약"
    >
      <div className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-soft-lg sm:p-7">
        <div
          className="absolute -top-3 left-7 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white"
          style={{ background: accent }}
        >
          <Sparkles className="h-3 w-3" /> 한눈에 보는 결과
        </div>

        <div className="flex items-baseline justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
              내 코드
            </p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {displayCode}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-700">
              {mainName}
              {subName ? <span className="text-slate-400"> × {subName}</span> : null}
            </p>
          </div>
        </div>

        <p className="mt-4 rounded-xl border-l-4 bg-slate-50/60 px-4 py-3 text-sm italic leading-relaxed text-slate-700" style={{ borderColor: accent }}>
          “{shortSlogan}”
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-white p-3.5">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <TrendingUp className="h-3 w-3" style={{ color: accent }} />
              두드러진 강점
            </p>
            {topStrengths.length > 0 ? (
              <ul className="mt-2 space-y-1 text-sm text-slate-800">
                {topStrengths.slice(0, 3).map((s) => (
                  <li key={s.facet} className="flex items-baseline justify-between gap-2">
                    <span className="font-medium">{facetShort(s.facet)}</span>
                    <span className="text-xs text-slate-500">T = {s.tScore}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-slate-500">두드러진 facet이 없습니다.</p>
            )}
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-3.5">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Heart className="h-3 w-3" style={{ color: accent }} />
              스트레스 시 모습
            </p>
            <p className="mt-2 text-sm text-slate-800">
              {dominantStress ?? "두드러진 스트레스 반응이 관찰되지 않음"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {dominantStress ? "§7에서 회복 전략을 안내합니다." : "현재의 회복 방식이 잘 작동하고 있을 수 있어요."}
            </p>
          </div>
        </div>

        <p className="mt-5 text-center text-[11px] text-slate-400">
          이는 ‘지금의 패턴’이며 자라납니다 · 단정적 라벨이 아닙니다
        </p>
      </div>
    </section>
  );
}
