# TASKS.md — PRISM-K 단계별 작업 분해

이 문서는 Claude Code가 PRISM-K 온라인 서비스를 구현하는 단계별 작업 명세입니다. 각 Phase는 명확한 시작·종료 조건을 가지며, **반드시 Phase 순서대로 진행**합니다(P2/P3 제외).

각 task의 형식:
- **목표**: 무엇을 만드는지
- **산출물**: 생성/수정될 파일 목록
- **검증**: 완료 확인 방법
- **의존**: 선행 완료 필요 task

---

## Phase 0: 프로젝트 초기화

### Task 0.1: 모노레포 설정
- **목표**: pnpm workspace 기반 모노레포 구조 생성
- **산출물**:
  - `package.json` (워크스페이스 루트)
  - `pnpm-workspace.yaml`
  - `turbo.json` (Turborepo 사용 시)
  - `.gitignore`, `.editorconfig`, `.nvmrc`
  - `apps/web/`, `apps/api/`, `packages/types/`, `packages/scoring/`, `packages/data/` 빈 디렉토리
- **검증**: `pnpm install` 정상 실행. `pnpm -r run lint` 빈 결과 정상.
- **의존**: 없음

### Task 0.2: 데이터 파일 임포트
- **목표**: 본 패키지의 `data/items.json`, `data/patterns.json`을 `packages/data/`에 복사하고 타입 정의
- **산출물**:
  - `packages/data/src/items.ts` (JSON import + Item, Dimension 타입 export)
  - `packages/data/src/patterns.ts` (JSON import + Pattern, Signature 등 타입)
  - `packages/data/package.json`, `tsconfig.json`
- **검증**: `import { items } from '@prism-k/data'`이 다른 패키지에서 동작
- **의존**: 0.1

### Task 0.3: 공유 타입 패키지
- **목표**: 응답·결과·점수 등 도메인 타입 정의
- **산출물**: `packages/types/src/index.ts` 안에:
  ```typescript
  export interface ResponseSession { id, version, responses, startedAt, completedAt }
  export interface FacetScore { facet, raw, standardized }
  export interface DimensionScore { dim, raw, standardized, tScore, ci }
  export interface PatternMatch { id, similarity }
  export interface Result { id, code, mainPattern, subPattern, dimensions, facets, ... }
  export type TestVersion = 'lite' | 'full'
  ```
- **검증**: 다른 패키지에서 타입 import 성공
- **의존**: 0.1

---

## Phase 1: 채점 알고리즘 (백엔드 핵심)

### Task 1.1: 채점 함수 구현
- **목표**: 응답 → facet 점수 → 차원 점수 → T-점수 산출
- **산출물**: `packages/scoring/src/calculate.ts`
  ```typescript
  function reverseScore(value: number): number  // 7 - value
  function calculateFacetScores(responses, items): FacetScore[]
  function calculateDimensionScores(facets): DimensionScore[]
  function toTScore(standardized: number): number  // mean 50, SD 10
  function calculateScores(responses, items): { facets, dimensions }
  ```
- **검증**: 단위 테스트 5종 이상. 임의 응답에 대해 의도된 점수 산출. 결측 1개 허용 동작 확인.
- **의존**: 0.2, 0.3

### Task 1.2: 패턴 매칭
- **목표**: 응답자의 6차원 벡터와 16 패턴 prototype 벡터의 코사인 유사도 산출 → 메인/서브 패턴 결정
- **산출물**: `packages/scoring/src/match.ts`
  ```typescript
  function cosineSimilarity(a: number[], b: number[]): number
  function matchPatterns(dimensionScores): PatternMatch[]  // 16개 정렬된 결과
  function getMainAndSub(matches): { main, sub, code }  // 'DI-SS' 형식
  ```
- **검증**: prototype과 동일한 입력 시 1.0 반환. 16개 패턴 모두에 대한 매칭 동작 확인.
- **의존**: 1.1

### Task 1.3: 응답 품질 검사
- **목표**: 결측률·응답분산·응답시간·극단치 비율 점검 → quality flags 생성
- **산출물**: `packages/scoring/src/quality.ts`
  ```typescript
  interface QualityFlags { missing, lowVariance, tooFast, tooSlow, extremeBias }
  function checkResponseQuality(responses, elapsedSeconds): QualityFlags
  ```
- **검증**: `data/patterns.json`의 `scoring.qualityChecks` 기준대로 동작
- **의존**: 1.1

### Task 1.4: 위험 신호 점검
- **목표**: 우울/불안/충동조절/완벽주의 소진/사회적 고립 5종 위험 패턴 자동 점검
- **산출물**: `packages/scoring/src/riskSignals.ts`
  ```typescript
  function detectRiskSignals(facets, dimensions, sScores): RiskSignal[]
  ```
- **검증**: `data/patterns.json`의 `riskSignals` 5종 모두 정확히 검출
- **의존**: 1.1

---

## Phase 2: 백엔드 API (Phase 3과 병렬 가능)

### Task 2.1: NestJS 프로젝트 셋업
- **목표**: NestJS 프로젝트 초기화, Prisma 연결, 기본 미들웨어
- **산출물**: `apps/api/` 안에 NestJS 표준 구조
- **검증**: `pnpm dev` 시 서버 기동, `/health` 엔드포인트 200
- **의존**: 0.1

### Task 2.2: 데이터베이스 스키마
- **목표**: Prisma 스키마 정의 (5 테이블)
- **산출물**: `apps/api/prisma/schema.prisma`
  - `User`, `ResponseSession`, `Result`, `SharedCard`, `MatchRecord`
- **검증**: `prisma migrate dev` 성공. PostgreSQL에 테이블 생성 확인.
- **의존**: 2.1

### Task 2.3: 검사 시작 API
- **목표**: `GET /api/items?version=lite|full` — 셔플된 문항 반환
- **산출물**: `apps/api/src/items/items.controller.ts`, `items.service.ts`
- **검증**: `curl /api/items?version=lite`가 36문항 반환, `version=full`이 136문항 반환. 같은 facet이 인접하지 않게 셔플.
- **의존**: 0.2, 2.2

### Task 2.4: 응답 제출 API
- **목표**: `POST /api/responses` — 응답 받아 채점하고 결과 토큰 반환
- **산출물**: `apps/api/src/responses/responses.controller.ts`
  - body: `{ version, responses: { itemId: number, value: number }[] }`
  - response: `{ token: string }`
- **검증**: 임의 응답 제출 시 200 응답, 결과 토큰 발급, DB에 저장됨
- **의존**: 1.1, 1.2, 1.3, 1.4, 2.2

### Task 2.5: 결과 조회 API
- **목표**: `GET /api/results/:token` — 익명 토큰으로 결과 조회
- **산출물**: `apps/api/src/results/results.controller.ts`
- **검증**: 발급된 토큰으로 조회 시 결과 객체 반환. 잘못된 토큰은 404.
- **의존**: 2.4

### Task 2.6: 매칭 API
- **목표**: `POST /api/match` — 두 토큰의 관계 분석 산출
- **산출물**: `apps/api/src/match/match.controller.ts`
  - body: `{ tokenA, tokenB, context: 'work'|'friend'|'love'|'family' }`
  - response: 갈등/보완/조언 텍스트
- **검증**: 2개 토큰 입력 시 `data/patterns.json`의 relationships 기반으로 결과 산출
- **의존**: 2.5

---

## Phase 3: 프론트엔드 (Phase 2와 병렬 가능)

### Task 3.1: Next.js 셋업 + 디자인 시스템
- **목표**: Next.js 14 App Router, Tailwind, shadcn/ui 초기화
- **산출물**:
  - `apps/web/app/layout.tsx`, `globals.css`
  - `apps/web/components/ui/*` (shadcn 기본 컴포넌트)
  - `tailwind.config.ts` (16 시그니처 컬러 등록)
- **검증**: `pnpm dev` 시 홈페이지 렌더링, Tailwind 동작
- **의존**: 0.1

### Task 3.2: 랜딩 페이지
- **목표**: `/` 페이지 — PRISM-K 소개, 두 버전 선택 진입
- **산출물**: `apps/web/app/page.tsx` + 관련 컴포넌트
- **포함 요소**: 히어로 섹션, MBTI와의 차이 3가지, 두 버전 카드, FAQ 짧은 버전, CTA 버튼
- **검증**: 모바일·데스크톱 반응형. Lighthouse 성능 90+.
- **의존**: 3.1

### Task 3.3: 검사 페이지 (라이트판/풀)
- **목표**: `/test/lite`, `/test/full` — 검사 진행 UI
- **산출물**: `apps/web/app/test/[version]/page.tsx`
- **요구사항**:
  - 4-5문항 단위 페이지 분할
  - 진행률 바 (`14/36`, `52/136` 형식)
  - 슬라이더형 6점 척도 응답
  - 응답 임시 저장 (localStorage, 7일 유효)
  - 이탈 방지 confirm
  - 모바일 한 손 사용 최적화
- **검증**: 처음부터 끝까지 모바일에서 응답 가능. 중간 이탈 후 재진입 시 응답 복원.
- **의존**: 2.3, 3.1

### Task 3.4: 결과 페이지
- **목표**: `/result/[token]` — 결과 조회 + 8개 섹션 표시
- **산출물**: `apps/web/app/result/[token]/page.tsx`
- **요구사항**:
  - 메인 패턴 코드 + 슬로건 (드라마틱 등장)
  - 6 차원 레이더 차트 (recharts 또는 d3)
  - 8개 섹션을 카드 형태로 펼침 (Accordion)
  - 라이트판은 8개 섹션 중 일부만 표시 + 풀 업그레이드 CTA
  - 위험 신호 발견 시 정중한 안내 박스
  - SNS 공유 버튼 (카드 다운로드 + URL 공유)
- **검증**: 임의 토큰으로 접근 시 결과 정상 렌더링. 모바일 1초 내 첫 화면.
- **의존**: 2.5, 3.1

### Task 3.5: 패턴 사전
- **목표**: `/patterns`, `/patterns/[id]` — 16 패턴 카드 목록과 상세
- **산출물**:
  - `apps/web/app/patterns/page.tsx` (그리드 목록)
  - `apps/web/app/patterns/[id]/page.tsx` (상세)
- **요구사항**: 시그니처 컬러 그라데이션 카드, 호버 시 슬로건 표시, 상세 페이지는 가이드북 콘텐츠 그대로
- **검증**: 16개 모두 표시, 상세 페이지 SEO 메타 자동 생성
- **의존**: 0.2, 3.1

### Task 3.6: 매칭 페이지
- **목표**: `/match` — 두 사람의 토큰 입력 → 관계 분석 표시
- **산출물**: `apps/web/app/match/page.tsx`
- **요구사항**: 두 토큰 입력 폼, 맥락 선택(동료/친구/연인/가족), 결과 표시
- **검증**: 2개 유효 토큰으로 매칭 결과 출력
- **의존**: 2.6, 3.1

---

## Phase 4: 결과 카드 생성

### Task 4.1: OG 이미지 동적 생성
- **목표**: `/result/[token]` 페이지의 OG 이미지를 결과 카드로 자동 생성
- **산출물**: `apps/web/app/result/[token]/opengraph-image.tsx` (@vercel/og)
- **요구사항**: 시그니처 컬러 그라데이션 배경, 코드(DI-SS), 닉네임, 슬로건, 푸터 윤리 안내
- **검증**: 카카오톡·트위터·페이스북에서 OG 미리보기 정상 표시
- **의존**: 2.5, 3.4

### Task 4.2: 다운로드용 결과 카드 API
- **목표**: 사용자가 클릭하면 PNG 카드 다운로드
- **산출물**:
  - `apps/web/app/api/cards/[token]/route.ts` (인스타 정사각형 1080x1080)
  - `apps/web/app/api/cards/[token]/story/route.ts` (스토리 1080x1920)
  - `apps/web/app/api/cards/[token]/talk/route.ts` (카톡용 720x900)
- **검증**: 각 형식 카드 다운로드 정상. 응답 시간 500ms 이내.
- **의존**: 4.1

### Task 4.3: 공유 메커니즘
- **목표**: 결과 페이지에서 SNS·메신저로 직접 공유
- **산출물**: `apps/web/components/ShareButtons.tsx`
- **요구사항**: 카카오톡·트위터·인스타·복사 4개 버튼. 인스타는 카드 다운로드 후 안내. 카카오는 Kakao SDK.
- **검증**: 각 채널로 정상 공유 동작
- **의존**: 4.2

---

## Phase 5: 통합·보안·법무

### Task 5.1: 개인정보처리방침·이용약관
- **목표**: PIPA 준수 정책 페이지 작성
- **산출물**: `apps/web/app/privacy/page.tsx`, `apps/web/app/terms/page.tsx`
- **요구사항**: 수집 항목, 보관 기간, 권리 행사 채널, 14세 미만 보호자 동의 명시
- **검증**: 법무 검토 후 승인
- **의존**: 3.1

### Task 5.2: 쿠키 동의 배너
- **목표**: 첫 방문 시 쿠키 동의 배너, 거부 시 분석 도구 비활성화
- **산출물**: `apps/web/components/CookieBanner.tsx`
- **검증**: 거부 시 PostHog 비활성. 동의는 12개월 유효.
- **의존**: 3.1

### Task 5.3: Rate Limiting과 보안
- **목표**: API 남용 방지, OWASP Top 10 점검
- **산출물**: `apps/api/src/middleware/rateLimit.ts`, helmet 설정, CORS
- **요구사항**: IP당 분당 30회 제한, 익스프레스 보안 헤더 설정
- **검증**: 부하 테스트로 rate limit 동작 확인
- **의존**: 2.1

### Task 5.4: 에러 모니터링
- **목표**: Sentry 연동, 프론트·백엔드 에러 추적
- **산출물**: 양 앱에 Sentry SDK 설정
- **검증**: 의도적 에러 발생 시 Sentry 대시보드에 표시
- **의존**: 2.1, 3.1

---

## Phase 6: 배포

### Task 6.1: CI/CD 파이프라인
- **목표**: GitHub Actions로 lint/test/build/deploy 자동화
- **산출물**: `.github/workflows/ci.yml`, `deploy.yml`
- **검증**: PR 생성 시 자동 검사, main 머지 시 자동 배포
- **의존**: 0.1

### Task 6.2: Vercel 배포 (web)
- **목표**: 프로덕션 환경 배포
- **산출물**: `vercel.json`, 환경 변수 설정
- **검증**: 프로덕션 URL 접근 가능, OG 이미지 동작
- **의존**: 모든 Phase 3, 4, 5

### Task 6.3: API 배포
- **목표**: AWS ECS 또는 Cloudflare Workers 배포
- **산출물**: Dockerfile, 배포 스크립트
- **검증**: 프로덕션 API 동작, DB 연결, 보안 헤더 정상
- **의존**: 모든 Phase 2, 5

---

## Phase 7: QA 및 베타

### Task 7.1: 통합 테스트
- **목표**: 전체 사용자 여정 자동 테스트 (Playwright)
- **산출물**: `apps/web/e2e/*.spec.ts` (검사 → 결과 → 공유 → 매칭 전 흐름)
- **검증**: 모든 시나리오 통과
- **의존**: Phase 6 완료

### Task 7.2: 접근성 점검
- **목표**: WCAG 2.1 AA 준수 확인
- **산출물**: 접근성 보고서, 수정 사항 반영
- **검증**: Axe-core 자동 점검 + 수동 점검 통과
- **의존**: 3.1, 3.2, 3.3, 3.4

### Task 7.3: 성능 최적화
- **목표**: Lighthouse 90+ 목표 (모바일 기준)
- **산출물**: 성능 보고서, 이미지 최적화, 번들 크기 축소
- **검증**: 모든 핵심 페이지 Lighthouse 90+
- **의존**: 6.2

---

## 진행 흐름 요약

```
Phase 0 (셋업)
  ↓
Phase 1 (채점) ─┐
                ├─→ Phase 2 (백엔드) ─┐
Phase 3 (프론트) ─────────────────────┴─→ Phase 4 (카드) ─→ Phase 5 (보안) ─→ Phase 6 (배포) ─→ Phase 7 (QA)
```

Phase 1과 Phase 3는 일부 병렬 가능 (Phase 3가 Phase 1의 결과를 직접 사용하지 않으면).

---

## 진행 시 체크리스트

각 Phase 완료 시 다음을 확인:

- [ ] 모든 task의 acceptance criteria 통과
- [ ] 단위 테스트 작성 및 통과
- [ ] 타입 에러 0건
- [ ] Lint 경고 0건 (혹은 명시적 ignore)
- [ ] CLAUDE.md의 "절대 하지 말 것" 6가지 준수
- [ ] 새 종속성 추가 시 이유를 PR 설명에 명시

---

**시작하려면**: Task 0.1부터 순서대로. 막히면 `CLAUDE.md`와 `PROJECT_SPEC.md`를 다시 확인.
