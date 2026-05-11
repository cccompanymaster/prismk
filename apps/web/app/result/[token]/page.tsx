import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dimensions as DIMENSIONS_META, findPattern, resultReportSections } from "@prism-k/data";
import { fetchResult, type ResultDto } from "@/lib/api";
import { AuxiliaryNotes } from "@/components/result/AuxiliaryNotes";
import { QualityBanner } from "@/components/result/QualityBanner";
import { RadarChart } from "@/components/result/RadarChart";
import { ResultHero } from "@/components/result/ResultHero";
import { RiskSignalBanner } from "@/components/result/RiskSignalBanner";
import { SectionAccordion, type SectionEntry } from "@/components/result/SectionAccordion";
import { ShareButtons } from "@/components/result/ShareButtons";

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
        <div className="space-y-5">
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
          <p className="text-xs text-slate-500">
            T-점수 평균 50, SD 10 기준. 옅은 음영은 신뢰구간을, 진한 도형은 추정 위치를 의미합니다.
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
        <ul className="space-y-3">
          {DIM_CODES.map((code) => {
            const row = dims.find((d) => d.dim === code);
            const t = row?.tScore;
            return (
              <li key={code} className="flex items-baseline justify-between gap-3">
                <span className="font-medium text-slate-900">{dimensionLabel(code)}</span>
                <span className="text-slate-500">
                  T = {t ?? "—"}
                  {row?.ci ? ` (${row.ci.low}~${row.ci.high})` : ""}
                </span>
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
            <div>
              <p className="text-sm font-semibold text-slate-900">메인: {main.name}</p>
              <p className="mt-1 text-sm">
                {findPattern(main.id)?.description?.[0] ?? main.slogan}
              </p>
            </div>
          ) : null}
          {sub ? (
            <div>
              <p className="text-sm font-semibold text-slate-900">서브: {sub.name}</p>
              <p className="mt-1 text-sm">
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
      body: (
        <ul className="space-y-2">
          {sortedHigh.slice(0, 3).map((f) => (
            <li key={f.facet} className="flex items-baseline justify-between">
              <span className="font-medium text-slate-900">{f.facet}</span>
              <span className="text-slate-500">T = {f.tScore}</span>
            </li>
          ))}
          {sortedHigh.length === 0 ? (
            <li className="text-slate-500">표시할 강점 영역이 없습니다.</li>
          ) : null}
        </ul>
      ),
    },
    {
      ...(resultReportSections[5] ?? { id: 6, title: "성장 영역", description: "" }),
      body: (
        <ul className="space-y-2">
          {sortedLow.slice(0, 3).map((f) => (
            <li key={f.facet} className="flex items-baseline justify-between">
              <span className="font-medium text-slate-900">{f.facet}</span>
              <span className="text-slate-500">T = {f.tScore}</span>
            </li>
          ))}
          {sortedLow.length === 0 ? (
            <li className="text-slate-500">표시할 성장 영역이 없습니다.</li>
          ) : null}
        </ul>
      ),
    },
    {
      ...(resultReportSections[6] ?? { id: 7, title: "스트레스 시 모습", description: "" }),
      body: (
        <ul className="space-y-2">
          {(result.stressPatterns as { code: string; raw: number | null; dominant: boolean }[])
            .filter((s) => s.dominant)
            .map((s) => (
              <li key={s.code} className="flex items-baseline justify-between">
                <span className="font-medium text-slate-900">{s.code}</span>
                <span className="text-slate-500">우세 (raw {s.raw?.toFixed(2)})</span>
              </li>
            ))}
          {(result.stressPatterns as { dominant: boolean }[]).every((s) => !s.dominant) ? (
            <li className="text-slate-500">두드러진 스트레스 반응 패턴이 관찰되지 않습니다.</li>
          ) : null}
        </ul>
      ),
    },
    {
      ...(resultReportSections[7] ?? { id: 8, title: "관계와 진로 시사점", description: "" }),
      body: (
        <div className="space-y-3">
          {main ? <p>{findPattern(main.id)?.fitsWith}</p> : null}
          <p className="text-xs text-slate-500">
            관계 분석은 매칭 페이지(/match)에서 두 사람의 결과 토큰으로 함께 확인할 수 있습니다.
          </p>
          <p className="text-xs text-slate-500">
            본 결과는 채용·인사·결혼 결정에 단독 사용되지 않습니다.
          </p>
        </div>
      ),
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
