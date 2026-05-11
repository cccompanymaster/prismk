import { Info } from "lucide-react";

type Flag = "normal" | "warn" | "fail";

interface QualityFlags {
  missing: Flag;
  variance: Flag;
  speed: Flag;
  extreme: Flag;
}

const AXIS_LABEL: Record<keyof QualityFlags, string> = {
  missing: "결측률",
  variance: "응답 분산",
  speed: "응답 시간",
  extreme: "극단치 비율",
};

const NOTES: Record<keyof QualityFlags, string> = {
  missing: "응답하지 못한 문항이 있었어요.",
  variance: "응답이 한쪽으로 치우쳐, 일부 점수의 신뢰도가 낮을 수 있어요.",
  speed: "응답에 소요된 시간이 일반적인 범위와 달랐어요.",
  extreme: "극단 응답(1점/6점)의 비율이 높아 일부 점수의 신뢰도가 낮을 수 있어요.",
};

function flaggedAxes(quality: QualityFlags): {
  axis: keyof QualityFlags;
  flag: Flag;
}[] {
  return (Object.entries(quality) as [keyof QualityFlags, Flag][])
    .filter(([, flag]) => flag !== "normal")
    .map(([axis, flag]) => ({ axis, flag }));
}

export function QualityBanner({ quality }: { quality: QualityFlags }): JSX.Element | null {
  const flagged = flaggedAxes(quality);
  if (flagged.length === 0) return null;

  const hasFail = flagged.some((f) => f.flag === "fail");

  return (
    <aside
      role="note"
      aria-label="응답 품질 안내"
      className={
        hasFail
          ? "mx-auto mt-8 max-w-3xl rounded-2xl border border-amber-300 bg-amber-50 p-5"
          : "mx-auto mt-8 max-w-3xl rounded-2xl border border-sky-200 bg-sky-50/70 p-5"
      }
    >
      <div className="flex items-start gap-3">
        <div
          className={
            hasFail
              ? "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-amber-200 text-amber-800"
              : "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700"
          }
        >
          <Info className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className={hasFail ? "text-sm font-semibold text-amber-900" : "text-sm font-semibold text-sky-900"}>
            {hasFail ? "신뢰도 점검이 필요한 응답 패턴이에요" : "결과 해석 시 참고해 주세요"}
          </p>
          <ul className={hasFail ? "mt-2 space-y-1 text-sm text-amber-800" : "mt-2 space-y-1 text-sm text-sky-800"}>
            {flagged.map(({ axis, flag }) => (
              <li key={axis}>
                <span className="font-medium">· {AXIS_LABEL[axis]}</span> — {NOTES[axis]}
                {flag === "fail" ? <span className="ml-1 text-xs">(주의)</span> : null}
              </li>
            ))}
          </ul>
          {hasFail ? (
            <p className="mt-3 text-xs text-amber-800/80">
              결과는 그대로 확인하실 수 있지만, 더 정확한 자기이해를 위해서는 시간을 두고 다시
              응답해 보시는 것을 권합니다.
            </p>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
