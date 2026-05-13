import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  dimensions as DIMENSIONS_META,
  findPattern,
  getPatternExtras,
  relationships,
  resultReportSections,
} from "@prism-k/data";
import {
  interpretCareerFit,
  interpretDimension,
  interpretGrowth,
  interpretRelationshipHint,
  interpretStrengths,
  interpretStress,
  tToPercentile,
} from "@prism-k/scoring";
import { fetchResult, type ResultDto } from "@/lib/api";
import { AuxiliaryNotes } from "@/components/result/AuxiliaryNotes";
import { QualityBanner } from "@/components/result/QualityBanner";
import { RadarChart } from "@/components/result/RadarChart";
import { ResultHero } from "@/components/result/ResultHero";
import { RiskSignalBanner } from "@/components/result/RiskSignalBanner";
import { SectionAccordion, type SectionEntry } from "@/components/result/SectionAccordion";
import { ShareButtons } from "@/components/result/ShareButtons";
import { SpectrumBar } from "@/components/result/SpectrumBar";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { token: string } }): Promise<Metadata> {
  try {
    const result = await fetchResult(params.token);
    const main = result.patterns.main;
    return {
      title: `내 PRISM-K — ${main?.name ?? result.code.display}`,
      description: main?.slogan ?? "PRISM-K 검사 결과",
      robots: { index: false, follow: false },
    };
  } catch {
    return { title: "결과를 찾을 수 없습니다", robots: { index: false } };
  }
}

const DIM_CODES = ["O", "C", "E", "A", "ES", "HH"] as const;

interface DimensionScoreRow {
  dim: string;
  raw: number | null;
  standardized: number | null;
  tScore: number | null;
  ci: { low: number; high: number } | null;
}

interface FacetScoreRow {
  facet: string;
  dim: string;
  raw: number | null;
  standardized: number | null;
  tScore: number | null;
}

function dimensionLabel(code: string): string {
  return (DIMENSIONS_META as Record<string, { name: string }>)[code]?.name ?? code;
}

function buildSections(result: ResultDto): SectionEntry[] {
  const dims = (result.dimensions as DimensionScoreRow[]) ?? [];
  const facets = (result.facets as FacetScoreRow[]) ?? [];
  const main = result.patterns.main;
  const sub = result.patterns.sub;

  const validFacets = facets.filter((f) => f.tScore !== null) as Required<FacetScoreRow>[];
  const sortedHigh = [...validFacets].sort((a, b) => (b.tScore ?? 0) - (a.tScore ?? 0));
  const sortedLow = [...validFacets].sort((a, b) => (a.tScore ?? 0) - (b.tScore ?? 0));

  const liteOverview =
    result.version === "lite" ? (
      <p>
        라이트판은 36문항 기반의 약식 추정입니다. 정확한 결과는 풀 버전(136문항)에서 확인할 수
        있습니다.
      </p>
    ) : (
      <p>풀 버전 기반 결과입니다. 6 차원 + 24 facet 정밀 프로파일이 산출되었습니다.</p>
    );

  return [
    {
      ...(resultReportSections[0] ?? { id: 1, title: "검사 개요", description: "" }),
      body: liteOverview,
    },
    {
      ...(resultReportSections[1] ?? { id: 2, title: "한눈에 보는 프로파일", description: "" }),
      body: (
        <div className="space-y-6">
          <RadarChart
            data={DIM_CODES.map((code) => {
              const row = dims.find((d) => d.dim === code);
              return {
                dim: code,
                label: dimensionLabel(code),
                tScore: row?.tScore ?? null,
                ci: row?.ci ?? null,
              };
            })}
            color={main?.signature.color ?? "#7E57C2"}
          />
          <div className="space-y-4 rounded-xl border border-slate-100 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              차원별 위치 (백분위)
            </p>
            {DIM_CODES.map((code) => {
              const row = dims.find((d) => d.dim === code);
              return (
                <SpectrumBar
                  key={code}
                  label={dimensionLabel(code)}
                  tScore={row?.tScore ?? null}
                  percentile={tToPercentile(row?.tScore ?? null)}
                  ci={row?.ci ?? null}
                  color={main?.signature.color ?? "#7E57C2"}
                />
              );
            })}
          </div>
          <p className="text-xs text-slate-500">
            T-점수 평균 50, SD 10 기준. 옅은 음영은 신뢰구간(±SEM)을, 점은 추정 위치를 의미합니다.
            백분위는 동일 연령 일반 분포 가정 기준으로 환산된 값이에요.
          </p>
          <AuxiliaryNotes
            auxiliary={(result.auxiliary as { code: "V" | "G"; raw: number | null }[]) ?? []}
            stressPatterns={
              (result.stressPatterns as { code: string; raw: number | null; dominant: boolean }[]) ?? []
            }
          />
        </div>
      ),
    },
    {
      ...(resultReportSections[2] ?? { id: 3, title: "차원별 깊이 해석", description: "" }),
      body: (
        <ul className="space-y-5">
          {DIM_CODES.map((code) => {
            const row = dims.find((d) => d.dim === code);
            const narrative = row
              ? interpretDimension(code, {
                  dim: code,
                  raw: row.raw,
                  standardized: row.standardized,
                  tScore: row.tScore,
                  ci: row.ci,
                })
              : null;
            const pct = tToPercentile(row?.tScore ?? null);
            return (
              <li key={code} className="rounded-xl border border-slate-100 bg-white p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-semibold text-slate-900">{dimensionLabel(code)}</span>
                  <span className="text-xs text-slate-500">
                    T = {row?.tScore ?? "—"}
                    {row?.ci ? ` (${row.ci.low}~${row.ci.high})` : ""}
                    {pct !== null ? (
                      <span className="ml-1.5 font-medium text-slate-700">
                        · {pct >= 50 ? `상위 ${100 - pct}%` : `하위 ${pct}%`}
                      </span>
                    ) : null}
                  </span>
                </div>
                {narrative ? (
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">{narrative}</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      ),
    },
    {
      ...(resultReportSections[3] ?? { id: 4, title: "핵심 패턴", description: "" }),
      body: (
        <div className="space-y-4">
          {main ? (
            <div className="rounded-xl border border-slate-100 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">메인</p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                {main.name} <span className="text-slate-400">· {main.id}</span>
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                {findPattern(main.id)?.description?.[0] ?? main.slogan}
              </p>
              {findPattern(main.id)?.description?.[1] ? (
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  {findPattern(main.id)!.description[1]}
                </p>
              ) : null}
            </div>
          ) : null}
          {sub ? (
            <div className="rounded-xl border border-slate-100 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">서브</p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                {sub.name} <span className="text-slate-400">· {sub.id}</span>
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                {findPattern(sub.id)?.description?.[0] ?? sub.slogan}
              </p>
            </div>
          ) : null}
          <p className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600">
            본 결과는 ‘{result.code.display}와 가장 가까운 양상’이며 단정이 아닙니다.
          </p>
        </div>
      ),
    },
    {
      ...(resultReportSections[4] ?? { id: 5, title: "강점 영역", description: "" }),
      body: (() => {
        const items = interpretStrengths(facets as never);
        if (items.length === 0) {
          return <p className="text-slate-500">표시할 두드러진 강점 영역이 없습니다.</p>;
        }
        return (
          <ul className="space-y-3">
            {items.map((c) => (
              <li key={c.facet} className="rounded-xl border border-slate-100 bg-white p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-semibold text-slate-900">{c.facet}</span>
                  <span className="text-xs text-slate-500">T = {c.tScore}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{c.body}</p>
              </li>
            ))}
          </ul>
        );
      })(),
    },
    {
      ...(resultReportSections[5] ?? { id: 6, title: "성장 영역", description: "" }),
      body: (() => {
        const auxG = (result.auxiliary as { code: "V" | "G"; raw: number | null }[]).find(
          (a) => a.code === "G",
        );
        const items = interpretGrowth(facets as never, auxG?.raw ?? null);
        if (items.length === 0) {
          return <p className="text-slate-500">두드러진 발달 영역이 관찰되지 않습니다.</p>;
        }
        return (
          <ul className="space-y-3">
            {items.map((c) => (
              <li key={c.facet} className="rounded-xl border border-slate-100 bg-white p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-semibold text-slate-900">{c.facet}</span>
                  <span className="text-xs text-slate-500">T = {c.tScore}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{c.body}</p>
              </li>
            ))}
          </ul>
        );
      })(),
    },
    {
      ...(resultReportSections[6] ?? { id: 7, title: "스트레스 시 모습", description: "" }),
      body: (() => {
        const items = interpretStress(
          (result.stressPatterns as {
            code: "S1" | "S2" | "S3" | "S4" | "S5";
            raw: number | null;
            dominant: boolean;
          }[]) ?? [],
        );
        if (items.length === 0) {
          return (
            <p className="text-slate-500">
              두드러진 스트레스 반응 패턴이 관찰되지 않습니다. 평소의 회복 방식이 큰 변동 없이 잘
              작동하고 있다는 신호일 수 있어요.
            </p>
          );
        }
        return (
          <ul className="space-y-3">
            {items.map((c) => (
              <li key={c.code} className="rounded-xl border border-slate-100 bg-white p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-semibold text-slate-900">
                    {c.code} · {c.label}
                  </span>
                  <span className="text-xs text-slate-500">우세</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{c.recovery}</p>
              </li>
            ))}
          </ul>
        );
      })(),
    },
    {
      ...(resultReportSections[7] ?? { id: 8, title: "관계와 진로 시사점", description: "" }),
      body: (() => {
        const mainPattern = main ? findPattern(main.id) : undefined;
        const subPattern = sub ? findPattern(sub.id) : null;
        if (!mainPattern) return <p>메인 패턴을 확인할 수 없습니다.</p>;
        const careerText = interpretCareerFit(mainPattern, subPattern ?? null);
        const hint = interpretRelationshipHint(mainPattern, relationships);
        const extras = getPatternExtras(mainPattern.id);
        return (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-100 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">진로 적합성</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{careerText}</p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {extras.careers.map((c) => (
                  <li
                    key={c}
                    className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700"
                  >
                    {c}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] text-slate-500">
                예시이며, 다른 영역의 가능성을 제한하지 않습니다.
              </p>
            </div>
            {hint.pairs.length > 0 ? (
              <div className="rounded-xl border border-slate-100 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">관계 양상 힌트</p>
                <ul className="mt-2 space-y-2 text-sm leading-relaxed text-slate-700">
                  {hint.pairs.map((p) => (
                    <li key={p.id}>
                      <span className="font-semibold text-slate-900">
                        {mainPattern.id} × {p.id} ({p.name})
                      </span>
                      <span className="block mt-0.5 text-slate-600">{p.advice}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-slate-500">
                  자세한 매칭 분석은 <a href="/match" className="underline">매칭 페이지</a>에서 두
                  사람의 토큰으로 함께 확인할 수 있어요.
                </p>
              </div>
            ) : null}
            <p className="text-xs text-slate-500">
              본 결과는 채용·인사·결혼 결정에 단독 사용되지 않습니다.
            </p>
          </div>
        );
      })(),
    },
  ];
}

export default async function ResultPage({ params }: { params: { token: string } }): Promise<JSX.Element> {
  let result: ResultDto;
  try {
    result = await fetchResult(params.token);
  } catch {
    notFound();
  }

  const sections = buildSections(result);

  const daysRemaining = result.expiresAt
    ? Math.max(
        0,
        Math.ceil((new Date(result.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      )
    : null;

  return (
    <>
      <ResultHero result={result} />
      <QualityBanner
        quality={
          (result.quality as {
            missing: "normal" | "warn" | "fail";
            variance: "normal" | "warn" | "fail";
            speed: "normal" | "warn" | "fail";
            extreme: "normal" | "warn" | "fail";
          }) ?? {
            missing: "normal",
            variance: "normal",
            speed: "normal",
            extreme: "normal",
          }
        }
      />
      <RiskSignalBanner signals={result.riskSignals ?? []} />
      <SectionAccordion sections={sections} />
      <ShareButtons token={result.token} displayCode={result.code.display} />
      <p className="mx-auto mt-10 max-w-3xl px-4 pb-8 text-center text-xs text-slate-500">
        이는 현재의 패턴이며 자라납니다.
        {daysRemaining !== null ? (
          <span className="ml-1">
            결과는 약 {daysRemaining}일 후 자동 만료됩니다.
          </span>
        ) : null}
      </p>
    </>
  );
}
