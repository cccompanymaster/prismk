import {
  findPattern,
  type DimensionCode,
  type Pattern,
  type PatternId,
} from "@prism-k/data";
import type {
  DimensionScore,
  FacetScore,
  StressPatternCode,
  StressPatternScore,
} from "@prism-k/types";

/**
 * Band labels are by T-score:
 *   ≥ 65 → highest
 *   55..65 → high
 *   45..55 → mid
 *   35..45 → low
 *   < 35 → lowest
 *
 * The texts honour CLAUDE.md / PROJECT_SPEC tone: no diagnosis, no
 * "you are X", every paragraph balances a strength reading and a
 * caution. Each is ~250-400 Korean characters per the spec.
 */
export type Band = "highest" | "high" | "mid" | "low" | "lowest";

export function tScoreBand(t: number | null): Band {
  if (t === null) return "mid";
  if (t >= 65) return "highest";
  if (t >= 55) return "high";
  if (t < 35) return "lowest";
  if (t < 45) return "low";
  return "mid";
}

type DimNarratives = Record<Band, string>;

const DIMENSION_NARRATIVES: Record<DimensionCode, DimNarratives> = {
  O: {
    highest:
      "새로운 아이디어와 관점에 대한 호기심이 매우 풍부합니다. 일상에서도 의미나 패턴을 찾고, 다른 사람이 지나치는 것들을 흥미롭게 바라보는 결이 있어요. 다만 가능성이 너무 많이 펼쳐질 때 한두 갈래에 깊이 머무는 시간을 의도적으로 두면, 발산이 결과로 정착하기 쉬워집니다.",
    high: "다양한 가능성을 떠올리고 새로운 시도에 열려 있는 편입니다. 익숙한 방식 외의 길도 자연스럽게 살펴보며, 이런 결은 학습과 창의적 일에서 강점이 됩니다. 너무 많은 갈래를 동시에 열어두지 않고, 한 시즌에 한두 주제를 정해두면 풍부함이 실제 자산으로 쌓이기 쉽습니다.",
    mid: "새로움과 익숙함 사이에서 균형 잡힌 관심을 보입니다. 충분한 근거가 모이면 새로운 시도를 받아들이고, 안정이 필요할 때는 검증된 방식을 선택할 수 있어요. 이 균형은 상황에 따라 어느 한쪽으로 더 기울 수 있다는 점만 의식하면, 결정의 폭이 넓어집니다.",
    low: "검증된 방식과 익숙한 영역에서 안정감을 느끼는 편입니다. 새로운 시도를 무조건 피한다기보다, 충분한 근거나 모범 사례가 있을 때 움직이는 결이에요. 한 번에 큰 변화를 시도하기보다 작은 단위에서 실험적인 시도를 정해두면, 안정감과 확장이 함께 자라는 리듬을 만들 수 있습니다. ‘이건 한 번만 해보는 거야’라고 자기에게 허락하는 작은 약속이 출발점이 됩니다.",
    lowest:
      "구체적이고 검증된 길을 선호하는 결이 두드러집니다. 이는 안정성과 일관성에서 강점이 되지만, 변화가 필요한 시점이 와도 적응이 느리게 시작될 수 있어요. ‘한 분기에 한 번, 작게라도 새로운 것을 만나보기’ 같은 의식적 약속이 가능성을 닫지 않게 도와줍니다.",
  },
  C: {
    highest:
      "계획·실행·점검을 끝까지 가져가는 힘이 매우 강합니다. 약속한 것을 지키고, 흐트러진 흐름을 다시 정돈하는 데 능숙해요. 다만 자기에게 적용되는 기준이 너무 높아 휴식·재충전이 ‘해야 할 일’ 목록에 들어가지 않으면, 장기적으로 소진의 위험이 따라옵니다.",
    high: "체계적으로 일을 끌고 가고 책임감 있게 마무리하는 편입니다. 주변에서 ‘이 사람에게 맡기면 된다’는 신뢰가 자연스럽게 쌓이는 결이에요. 완벽함보다 ‘충분히 좋음’의 기준을 의식적으로 둘 때, 같은 에너지로 더 많은 영역을 다룰 수 있습니다.",
    mid: "필요한 만큼 계획하고 끝까지 가지만, 과도한 통제까지는 가지 않는 균형 잡힌 결입니다. 흥미가 떨어지는 구간에서 외부 마감이나 동료와의 약속이 보조 동력이 되어줍니다. 작업의 ‘시작’과 ‘중반’ 중 어디가 약한지 한 번쯤 점검해 보면 도움이 됩니다.",
    low: "유연하고 즉흥적인 흐름을 선호하는 편입니다. 새로운 자극이 많은 환경에서 빛나지만, 긴 시간 이어가야 하는 일에서는 외부 구조 — 마감, 동료, 작은 단위 목표 — 가 함께 있으면 결과가 훨씬 단단해집니다.",
    lowest:
      "정해진 절차나 계획을 따르기보다 그때그때의 흐름을 따라가는 결이 두드러집니다. 자유로움은 큰 자산이지만, 결과를 누적하는 데서는 ‘아주 작은 시스템’이 필요해요. 일주일에 한 번, 진행 중인 일을 한 줄로 정리하는 습관만 두어도 큰 차이가 생깁니다.",
  },
  E: {
    highest:
      "사람과의 상호작용에서 에너지를 얻고, 분위기를 살리는 결이 매우 또렷합니다. 빠른 결정과 적극적인 표현이 강점이지만, 혼자 있는 시간을 일부러 비워두지 않으면 내면의 신호들을 놓치기 쉬워요. 한 주에 한두 시간이라도 ‘아무 약속 없는 시간’을 캘린더에 넣어 두는 걸 권합니다.",
    high: "사람들과의 어울림이 자연스러우며, 모임에서도 부담 없이 자기를 표현하는 편입니다. 사회적 에너지가 충분히 있어 협업이 활발한 환경에서 강점이 됩니다. 다만 모임 후 회복 시간을 의식적으로 두지 않으면, 정작 ‘깊은 대화’에 들어갈 여유가 줄어듭니다.",
    mid: "필요할 때는 적극적으로 어울리고, 회복이 필요할 때는 혼자만의 시간으로 자연스럽게 돌아오는 결입니다. 외부 자극과 내적 정리의 두 채널을 모두 사용하는 능력이 자산이에요. 어느 쪽이 평소 기본값인지 의식하면 에너지 관리가 더 쉬워집니다.",
    low: "혼자만의 시간을 통해 더 깊은 충전을 하는 편입니다. 사람과 함께 있는 자리도 가능하지만, 너무 잦은 사교 일정은 빠르게 피로감을 만듭니다. 가까운 한두 사람과의 깊은 대화로 사회적 욕구를 채우는 패턴이 가장 잘 맞아요.",
    lowest:
      "혼자 있을 때 가장 또렷한 자기 자신이 되는 결입니다. 큰 모임은 부담스럽지만, 깊고 진정성 있는 한 명과의 관계에서는 누구보다 풍부한 사람이에요. 자신의 회복 리듬을 존중해 주는 환경에서 사고와 표현이 가장 잘 펼쳐집니다.",
  },
  A: {
    highest:
      "다른 사람의 감정과 입장을 자연스럽게 헤아리는 능력이 매우 풍부합니다. 갈등 상황에서도 양쪽을 동시에 이해할 수 있는 균형감각이 강점이지만, 자기 욕구를 표현하기 전에 상대를 먼저 챙기는 패턴이 굳어지면 소진과 은근한 분노가 누적될 수 있어요.",
    high: "협동과 배려가 자연스러운 편입니다. 팀에서 신뢰의 기반을 만드는 결이며, 갈등을 조정하는 역할을 자주 맡게 됩니다. 자신의 한계를 존중하는 ‘부드러운 No’를 연습해 두면, 같은 따뜻함을 더 오래 지속할 수 있습니다.",
    mid: "타인과 자기 사이에서 균형 잡힌 시선을 가집니다. 공감하면서도 필요한 순간에는 자기 입장을 분명히 표현할 수 있는 결이에요. 두 모드가 모두 가능하다는 점이 강점이며, 어느 한쪽이 ‘기본값’으로 굳어지지 않게 의식하면 좋습니다.",
    low: "감정보다 사실·논리에 무게를 두는 결입니다. 공정한 판단과 객관성에서 강점이 있지만, 가까운 관계에서는 ‘이 결정이 사람에게 어떻게 느껴질까’를 한 단계 더 고려하면 신뢰의 깊이가 자라납니다.",
    lowest:
      "감정에 휘둘리지 않는 객관성이 가장 또렷한 강점입니다. 위기 상황에서 가장 신뢰받는 판단자가 되지만, 일상의 관계에서 ‘차갑다’는 인상을 줄 수 있어요. 사실 전달 뒤에 ‘이건 내 의견이고, 너는 어떻게 느꼈는지 궁금해’ 한 줄을 덧붙이는 작은 습관이 큰 차이를 만듭니다.",
  },
  ES: {
    highest:
      "정서적으로 매우 안정된 결을 보입니다. 압박이나 위기 상황에서도 평정을 유지하고, 어려움 뒤에 비교적 빠르게 회복하는 편이에요. 다만 자기 감정의 변화를 너무 무던하게 넘기다 보면 ‘조용한 위험 신호’를 놓칠 수 있으니, 정기적으로 자기 상태를 점검하는 시간이 도움이 됩니다.",
    high: "감정의 진폭이 크지 않고, 스트레스 상황에서도 비교적 차분히 대응하는 편입니다. 회복탄력성이 안정적인 자산이에요. 평소 사용하는 회복 방법(운동·휴식·관계)을 의식적으로 유지하면, 큰 변화 앞에서도 흔들림이 적습니다.",
    mid: "감정의 폭은 평균 범위이며, 회복도 일상적인 속도로 이뤄지는 편입니다. 특정 영역에서 더 예민할 수 있으니, 어떤 상황이 자기 마음을 가장 많이 흔드는지 알아두면 회복 전략을 더 정확히 세울 수 있어요.",
    low: "감정에 예민하고, 스트레스 상황에서 진폭이 큰 편입니다. 풍부한 감수성과 공감의 자원이기도 하지만, 회복까지 시간이 더 필요한 결이에요. 안전한 사람과의 정기적인 대화, 충분한 수면, 자기 친절의 언어를 연습하는 것이 큰 차이를 만듭니다.",
    lowest:
      "감정의 진폭이 매우 크고, 한 번 무너지면 회복까지 오래 걸리는 결이에요. 풍부한 정서적 감각이 자산이지만, 동시에 보호가 필요한 영역입니다. 정기적인 자기 점검과 신뢰할 만한 자원(가까운 사람·전문가·도움 채널)을 미리 갖춰두는 것이 의미 있는 안전망이 됩니다.",
  },
  HH: {
    highest:
      "정직함과 겸손함이 매우 또렷한 결입니다. 가식 없이 진심을 보여주는 자세는 장기적인 신뢰의 가장 큰 자산이에요. 다만 모두에게 같은 깊이의 정직을 다 보여주려 하면 정작 자기를 보호할 여유가 줄어들 수 있으니, ‘누구에게 얼마나’의 결을 의식하는 것이 평생의 과제가 됩니다.",
    high: "원칙을 지키고 진심으로 사람을 대하는 편입니다. 결과보다 과정의 정정당당함을 중시하는 결이며, 이는 장기적으로 강력한 신뢰 자산이 됩니다. 융통성 없이 보이는 순간이 있다면, ‘무엇을 지키고 어디서 흘려보낼지’의 우선순위를 한 번 정리해 두면 도움이 됩니다.",
    mid: "정직과 실용 사이에서 상황에 따라 균형을 잡는 결입니다. 필요할 때 분명한 원칙을 지키고, 필요할 때 융통성을 발휘할 수 있어요. 두 모드를 어떻게 구분하고 있는지 의식하면, 자기 일관성에 대한 확신이 더 단단해집니다.",
    low: "결과와 효율을 중심으로 움직이는 결이 비교적 또렷합니다. 빠른 의사결정이 강점이 되는 환경에서 잘 맞지만, 장기 신뢰가 핵심인 영역에서는 ‘하지 않을 일’ 목록을 자신에게 한 번 적어두는 작업이 의미 있는 자산을 만들어 줍니다.",
    lowest:
      "원하는 결과를 위해 다양한 수단을 활용하는 결입니다. 추진력과 영향력의 자산이지만, 가까운 관계에서 ‘이 사람을 도구로 보지 않는다’는 신호를 의도적으로 보내지 않으면 장기 관계가 얕아집니다. 자신만의 윤리적 경계선을 미리 정해두는 것이 평생의 보호 장치가 됩니다.",
  },
};

export function interpretDimension(
  code: DimensionCode,
  score: DimensionScore,
): string {
  return DIMENSION_NARRATIVES[code][tScoreBand(score.tScore)];
}

const STRESS_LABEL: Record<StressPatternCode, string> = {
  S1: "예민함",
  S2: "회피",
  S3: "자기비난",
  S4: "통제·완벽주의 강화",
  S5: "신체화",
};

const STRESS_RECOVERY: Record<StressPatternCode, string> = {
  S1: "감각이 곤두서면 정보 입력을 잠시 줄이는 것이 도움이 됩니다. 알림을 꺼두고 짧은 산책이나 10분의 호흡 가다듬기로 자율신경계를 진정시키는 패턴을 만들어 두세요. ‘자극을 끄는 시간’이 회복의 시작점입니다.",
  S2: "잠시 거리를 두는 회피는 회복의 일부일 수 있지만, 길어지면 고립을 만듭니다. 신뢰하는 한 사람에게 ‘지금은 혼자 있고 싶지만 사라지는 건 아냐’의 한 줄을 전하는 작은 신호가 다리가 되어줍니다.",
  S3: "‘오늘 잘하지 못한 일’ 대신 ‘오늘 시도한 일 한 가지’를 적어보는 작업이 자기 비난의 톤을 부드럽게 합니다. 자기에게 친구의 목소리를 입혀보는 인지 재구조화가 가장 효과적인 회복 방법입니다.",
  S4: "더 강하게 쥐는 대신, 의도적으로 손에서 놓는 영역을 정해보세요. 한 가지를 60%만 해도 되는 것으로 두면, 통제 욕구가 다른 영역에서 더 정확히 작동합니다. 충분히 잘하고 있다는 자각이 회복의 핵심이에요.",
  S5: "몸의 긴장을 알아차리는 것이 출발점입니다. 어깨·턱·복부 중 어디가 가장 굳어 있는지 30초만 확인하는 습관, 그리고 ‘몸을 위한 휴식’을 정기 일정으로 두는 것이 누적되면 큰 차이를 만듭니다.",
};

export interface StressInterpretation {
  code: StressPatternCode;
  label: string;
  recovery: string;
}

export function interpretStress(
  stressPatterns: StressPatternScore[],
): StressInterpretation[] {
  return stressPatterns
    .filter((s) => s.dominant)
    .map((s) => ({
      code: s.code,
      label: STRESS_LABEL[s.code],
      recovery: STRESS_RECOVERY[s.code],
    }));
}

export interface FacetCommentary {
  facet: string;
  tScore: number;
  body: string;
}

function facetShortName(facet: string): string {
  const parts = facet.split("_");
  return parts[1] ?? facet;
}

export function interpretStrengths(facets: FacetScore[]): FacetCommentary[] {
  const valid = facets
    .filter((f): f is FacetScore & { tScore: number } => f.tScore !== null)
    .filter((f) => f.tScore >= 55)
    .sort((a, b) => b.tScore - a.tScore)
    .slice(0, 3);
  return valid.map((f) => ({
    facet: f.facet,
    tScore: f.tScore,
    body: `‘${facetShortName(f.facet)}’ 영역이 또렷한 강점으로 나타납니다. 이 결은 자신이 가장 자연스럽게 사용하는 능력이기 때문에 일상에서 의식하지 못한 채 발휘되곤 합니다. 의도적으로 활용하는 자리(역할·프로젝트·관계)를 만들어 두면, 동일한 에너지로 더 큰 영향을 줄 수 있어요.`,
  }));
}

export function interpretGrowth(
  facets: FacetScore[],
  growthOrientation: number | null,
): FacetCommentary[] {
  const valid = facets
    .filter((f): f is FacetScore & { tScore: number } => f.tScore !== null)
    .filter((f) => f.tScore < 50)
    .sort((a, b) => a.tScore - b.tScore)
    .slice(0, 3);
  const wantsChange = growthOrientation !== null && growthOrientation >= 4;
  return valid.map((f) => ({
    facet: f.facet,
    tScore: f.tScore,
    body: wantsChange
      ? `‘${facetShortName(f.facet)}’ 영역에서 발달의 여지가 보입니다. 변화에 대한 의지가 높은 결이므로, 한 분기에 작은 실험 한 가지를 정해 꾸준히 해보는 것이 의미 있는 변화를 만들어 줍니다.`
      : `‘${facetShortName(f.facet)}’ 영역은 현재로서는 약한 편이지만, 무리하게 바꾸기보다 현재의 강점과 어울리는 방향으로 가져가는 것을 권합니다. 자기에게 자연스러운 결을 받아들이는 것이 회복과 성취 모두의 출발점이에요.`,
  }));
}

export function interpretCareerFit(
  mainPattern: Pattern,
  subPattern: Pattern | null,
): string {
  const baseline = mainPattern.fitsWith;
  if (!subPattern) return baseline;
  return `${baseline} 서브 패턴인 ‘${subPattern.name}’(${subPattern.id})의 결까지 함께 활용할 수 있는 환경에서는, 자기 표현의 폭이 더 넓어집니다.`;
}

export interface RelationshipHint {
  mainId: PatternId;
  pairs: { id: PatternId; name: string; advice: string }[];
}

export function interpretRelationshipHint(
  mainPattern: Pattern,
  pairs: { pair: string; advice: string; pairKor: string }[],
): RelationshipHint {
  const matches = pairs.filter((r) => r.pair.includes(mainPattern.id));
  return {
    mainId: mainPattern.id,
    pairs: matches
      .map((r) => {
        const sides = r.pair.split(" × ");
        const otherId = sides.find((s) => s !== mainPattern.id) ?? sides[0]!;
        const other = findPattern(otherId);
        return other
          ? { id: other.id, name: other.name, advice: r.advice }
          : null;
      })
      .filter((x): x is { id: PatternId; name: string; advice: string } => x !== null)
      .slice(0, 3),
  };
}

/**
 * Abramowitz & Stegun 7.1.26 approximation of erf — accurate to ~1.5e-7 for
 * |x| < 3.5, which is the entire range we ever hit (T-scores capped at 80
 * give |Z| ≤ 3.0).
 */
function erf(x: number): number {
  const sign = Math.sign(x);
  const ax = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * ax);
  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return sign * y;
}

/**
 * Convert a T-score (mean 50, SD 10) to a 0-100 percentile rank against the
 * assumed normal reference distribution.
 *   T=50 → 50th, T=60 → 84th, T=65 → 93rd, T=70 → 98th, T=40 → 16th.
 */
export function tToPercentile(tScore: number | null): number | null {
  if (tScore === null || Number.isNaN(tScore)) return null;
  const z = (tScore - 50) / 10;
  const cdf = 0.5 * (1 + erf(z / Math.SQRT2));
  return Math.max(0, Math.min(100, Math.round(cdf * 100)));
}

export function percentileLabel(percentile: number | null): string | null {
  if (percentile === null) return null;
  if (percentile >= 50) return `상위 ${100 - percentile}%`;
  return `하위 ${percentile}%`;
}
