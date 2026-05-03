# PROJECT_SPEC.md — PRISM-K 비즈니스 로직 명세

이 문서는 코드를 작성할 때 마주치는 비즈니스 결정 사항을 모두 모아둔 단일 진실 원천(single source of truth)입니다. 막힐 때마다 이 문서를 참조하세요.

---

## 1. 두 검사 버전의 차이

| 항목 | 라이트판 | 풀 버전 |
|---|---|---|
| 문항 수 | 36 | 136 |
| 소요 시간 (목표) | 6분 | 20-25분 |
| 결과 산출 | 메인+서브 패턴, 코드 | 24 facet 점수 + 8 섹션 리포트 |
| 신뢰구간 표시 | 추정 (~±10) | 정밀 (SEM 기반) |
| 위험 신호 검사 | 간략 | 5종 모두 |
| 결과 카드 생성 | ✓ | ✓ |
| PDF 다운로드 | ✗ | ✓ |
| 영구 저장 | 365일 (토큰) | 365일 (토큰) + 가입 시 영구 |

**구현 시**: `version` 파라미터로 분기. 라이트판 결과 페이지에는 항상 "이 결과는 약식 추정이며, 정확한 결과는 풀 버전에서 가능합니다" 배너 표시.

---

## 2. 검사 진행 UI 명세

### 페이지 분할
- 라이트판: 한 페이지에 4문항 × 9페이지 = 36문항
- 풀 버전: 한 페이지에 5문항 × 28페이지 = 140 (마지막 페이지는 4문항)

### 각 페이지 구성
1. 상단: 진행률 바 + `n/총합` 카운터
2. 응답 척도 안내 (한 줄 요약)
3. 4-5개 문항 + 슬라이더형 6점 척도
4. 하단: "이전" / "다음" 버튼 (모두 응답해야 다음 활성화)

### 응답 척도 라벨
- 1: 전혀 그렇지 않다
- 2: 그렇지 않다
- 3: 약간 그렇지 않다
- 4: 약간 그렇다
- 5: 그렇다
- 6: 매우 그렇다

### 임시 저장
- localStorage 키: `prismk:draft:{version}:{sessionId}`
- 페이지마다 응답 후 자동 저장
- 7일 이후 자동 삭제 (만료 timestamp 검사)
- 검사 완료 시 즉시 삭제

### 이탈 방지
- 응답 1개 이상 + 미완료 상태에서 페이지 닫기 시 `beforeunload` confirm
- 메시지: "응답이 저장되었습니다. 7일 안에 다시 들어와 이어서 응답할 수 있어요."

---

## 3. 채점 알고리즘 상세

### 3.1 응답 → facet 점수
```typescript
function calculateFacetScore(facetItems: Item[], responses: Response[]): number | null {
  const validResponses = responses.filter(r => facetItems.find(i => i.id === r.itemId));
  const scoredValues = validResponses.map(r => {
    const item = facetItems.find(i => i.id === r.itemId);
    return item.reverse ? 7 - r.value : r.value;
  });
  // 결측 1개 허용. 풀 버전은 facet당 5문항이므로 최소 4개 필요.
  const requiredMin = facetItems.length - 1;
  if (scoredValues.length < requiredMin) return null;
  return mean(scoredValues);
}
```

### 3.2 facet → 차원 점수
```typescript
function calculateDimensionScore(facetScores: (number|null)[]): number | null {
  const valid = facetScores.filter(s => s !== null);
  // facet 4개 중 3개 이상 산출되어야 차원 점수 가능
  if (valid.length < 3) return null;
  return mean(valid);
}
```

### 3.3 표준화 + T-점수
```typescript
function standardize(raw: number): number {
  // 1-6 점수 가정 평균 3.5, SD 1.0 (실제 운영 시 norm 기반으로 갱신)
  return (raw - 3.5) / 1.0;
}
function toTScore(standardized: number): number {
  return Math.round(50 + standardized * 10);
}
function confidenceInterval(tScore: number, reliability: number = 0.80): [number, number] {
  const sem = 10 * Math.sqrt(1 - reliability); // SD 10 (T-score)
  return [Math.round(tScore - 1.96 * sem), Math.round(tScore + 1.96 * sem)];
}
```

### 3.4 패턴 매칭
```typescript
function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((s, ai, i) => s + ai * b[i], 0);
  const magA = Math.sqrt(a.reduce((s, ai) => s + ai*ai, 0));
  const magB = Math.sqrt(b.reduce((s, bi) => s + bi*bi, 0));
  return dot / (magA * magB);
}

function matchPatterns(dimensions: DimensionScores): PatternMatch[] {
  const userVec = [
    dimensions.O.standardized,
    dimensions.C.standardized,
    dimensions.E.standardized,
    dimensions.A.standardized,
    dimensions.ES.standardized,
    dimensions.HH.standardized
  ];
  return patterns.map(p => ({
    id: p.id,
    similarity: cosineSimilarity(userVec, [p.prototype.O, p.prototype.C, p.prototype.E, p.prototype.A, p.prototype.ES, p.prototype.HH])
  })).sort((a, b) => b.similarity - a.similarity);
}
```

### 3.5 코드 결정
- **메인 패턴**: 가장 높은 유사도 패턴
- **서브 패턴**: 두 번째 높은 유사도 패턴
- **단일 표기 조건**: 메인-서브 유사도 차이 < 0.05면 단일 표기 (예: `DI`만)
- **코드 형식**: `${main}-${sub}` (예: `DI-SS`) 또는 `${main}` (단일 시)

---

## 4. 응답 품질 검사

`packages/scoring/src/quality.ts`에서 구현:

```typescript
interface QualityFlags {
  missing: 'normal' | 'warn' | 'fail';      // 결측률 < 5% / 5-15% / > 15%
  variance: 'normal' | 'warn' | 'fail';     // SD ≥ 1.0 / 0.6-1.0 / < 0.6
  speed: 'normal' | 'warn' | 'fail';        // 평균 응답시간 분류
  extreme: 'normal' | 'warn' | 'fail';      // 1점/6점 비율
}
```

### 응답 시간 임계
- 라이트판 (목표 6분=360초): 정상 240-720초 / 경고 120-240 또는 720-1200 / 치명 <120 또는 >1200
- 풀 버전 (목표 22분=1320초): 정상 720-2400초 / 경고 360-720 또는 2400-4000 / 치명 <360 또는 >4000

### 결과 페이지 처리
- 한 가지라도 fail → 결과 산출 보류, 재검사 권유 페이지 표시
- 한 가지 이상 warn → 결과 페이지 상단에 신뢰도 경고 배너

---

## 5. 결과 페이지 8개 섹션

각 섹션의 내용 생성 규칙:

### 섹션 1: 개요
- 라이트판: "이 결과는 약식 추정입니다" 배너
- 위험 신호 발견 시: 정중한 안내 박스 (진단 용어 없이)

### 섹션 2: 한눈에 보는 프로파일
- 6 차원 레이더 차트 (T-점수 50을 기준선으로)
- 신뢰구간을 음영 영역으로 표시
- 보조 차원 표시 (V, S 우세 패턴, G)

### 섹션 3: 차원별 깊이 해석
- 6 차원 각각에 대해 250-400자 텍스트
- 텍스트는 분기 규칙에 따라 동적 생성:
  - 점수 구간 (5구간) × facet 내 일관성 패턴 = 약 25-30 변형
- 라이트판은 차원당 100-150자 짧은 버전만

### 섹션 4: 핵심 패턴
- 메인 패턴의 가이드북 콘텐츠 발췌 (가상 인물 사례 포함)
- 서브 패턴 짧은 안내
- "당신은 X 패턴이다"가 아닌 "X와 가장 가까운 양상을 보입니다" 표현

### 섹션 5: 강점 영역
- 상위 3개 facet 추출 (T-점수 기준)
- 각 facet의 강점 활용 가이드

### 섹션 6: 성장 영역
- 하위 3개 facet 추출
- G 점수 결합:
  - G ≥ 4.0: 변화 가능성 강조 + 구체적 실행 제안
  - G < 4.0: 현 상태 적응 전략 + 부드러운 가능성 제시

### 섹션 7: 스트레스 시 모습
- S1~S5 중 4.0 이상의 우세 패턴 식별
- ES 차원과 결합한 해석
- 각 패턴별 회복 전략 (인지 재구조화, 마음챙김 등)

### 섹션 8: 관계와 진로 시사점
- 직무 환경 적합성 (5-7개 환경 특성 매핑)
- 메인 패턴과의 관계 매칭 안내 (`/match` 페이지로 유도)
- "단독 채용 결정 도구가 아님" 푸터 명시

---

## 6. 결과 카드 디자인 명세

### 인스타그램 정사각형 (1080×1080)
```
┌─────────────────────────────────────┐
│                          [PRISM-K]  │  ← 우상단 로고 (작게)
│                                     │
│     [한 단어 워터마크 — 연한 색]    │  ← 패턴의 한 단어 (예: "비상")
│                                     │
│         DI-SS                       │  ← 코드 (큰 굵은 글씨)
│  꿈꾸는 발명가 × 섬세한 감응자       │  ← 닉네임
│                                     │
│ "아이디어가 비처럼 쏟아져요"        │  ← 슬로건
│                                     │
│  [강점1] [강점2] [강점3]            │  ← 칩 (선택적)
│                                     │
│   #내PRISM #DISS · prism-k.kr       │  ← 하단 메타
│   이는 현재의 패턴이며 자라납니다.  │  ← 윤리 푸터 (10pt)
└─────────────────────────────────────┘
배경: 메인 패턴 시그니처 컬러의 그라데이션 (좌상단 80% → 우하단 30%)
텍스트: 모두 화이트 (충분한 명도 대비)
```

### 인스타그램 스토리 (1080×1920)
- 정사각형 카드를 중앙에 배치
- 상하단 여백에 "내 PRISM 결과" 텍스트와 prism-k.kr 링크 강조

### 카카오톡 (720×900)
- 카카오 인앱 미리보기 최적화
- 폰트 크기 약간 키움 (모바일에서 잘 보이도록)

---

## 7. 매칭 페이지 (`/match`) 명세

### 입력
- 토큰 A 입력 필드
- 토큰 B 입력 필드 (또는 "내 토큰 사용" 버튼으로 자동 채움)
- 맥락 선택: 동료 / 친구 / 연인 / 가족 (라디오)

### 처리
1. 두 토큰의 결과 조회
2. 메인 패턴 조합 (예: DI×SS)으로 `data/patterns.json`의 relationships 검색
3. 정확히 매칭되는 페어가 있으면 해당 텍스트 사용
4. 없으면 알고리즘 기반 fallback (가장 가까운 페어의 텍스트 + 차이점 강조)

### 출력
- 두 사람의 코드와 닉네임 표시
- 3개 항목: 자주 부딪히는 영역 / 서로 채워주는 영역 / 함께 잘 살기 위한 한 가지
- 푸터: "이 분석은 자기이해의 도구이며, 관계 결정의 근거가 아닙니다"

---

## 8. 위험 신호 처리

`data/patterns.json`의 `riskSignals` 5종을 자동 점검. 발견 시:

1. 결과 페이지 상단에 정중한 박스 표시:
   ```
   📌 추가 점검을 권하는 영역이 있어요
   이 패턴은 [영역]에 대한 추가 평가에서 도움이 될 수 있는 영역을 시사합니다.
   필요하다면 다음 자원이 도움이 될 수 있어요.
   ```
2. 한국 정신건강 자원 링크 표시
3. **절대로 진단 용어 사용 금지** ("우울증 의심" 등)
4. 메타데이터에 위험 신호 ID 저장 (분석용, 사용자 식별 불가)

---

## 9. 윤리 푸터 (영구 노출)

다음 문구는 모든 결과 페이지·결과 카드·매칭 페이지에 항상 표시:

> "본 결과는 채용·인사·결혼 결정에 단독 사용되지 않습니다. 이는 현재의 패턴이며 자라납니다."

폰트는 본문 대비 70% 크기, 회색조.

---

## 10. 데이터 보관 규칙

| 데이터 | 무로그인 사용자 | 가입자 |
|---|---|---|
| 응답 원본 | 365일 후 삭제 | 회원 탈퇴까지 |
| 결과 (산출 점수) | 365일 후 토큰 무효화 | 회원 탈퇴까지 |
| 메타데이터 (익명) | 영구 (분석용) | 영구 |
| 위험 신호 식별 | 결과와 함께 365일 | 회원 탈퇴까지 |
| 매칭 기록 | 90일 후 삭제 | 90일 후 삭제 |

자동 삭제 cron job은 매일 새벽 3시 실행.

---

## 11. SEO와 OG

### 사이트 전체
- 메타 description, keywords 한국어 최적화
- Sitemap XML 자동 생성
- robots.txt: 결과 페이지(`/result/*`) 크롤링 차단

### 결과 페이지 OG
- title: "내 PRISM-K — {닉네임}"
- description: 슬로건
- image: `/result/{token}/opengraph-image.png` (자동 생성)

### 패턴 페이지 OG
- 16개 패턴 각각 자체 OG 이미지 (시그니처 컬러 + 닉네임 + 슬로건)

---

## 12. 분석 이벤트

PostHog로 다음 이벤트 추적 (모두 익명):

- `test_started` (version)
- `test_page_completed` (version, page_number)
- `test_completed` (version, elapsed_seconds, quality_flags)
- `result_viewed` (token, version)
- `result_section_expanded` (section_id)
- `card_generated` (format)
- `card_shared` (channel: kakao/twitter/instagram/copy)
- `match_attempted`
- `pattern_dictionary_viewed` (pattern_id)
- `lite_to_full_clicked` (라이트판 결과지에서 풀 업그레이드 CTA 클릭)

---

## 13. 다국어 (향후)

- 1차: 한국어만
- 2차: 영어판 (별도 도메인 또는 `/en/*` 경로)
- 영어판 패턴 닉네임은 별도 콘텐츠 작업 필요 (단순 번역 X)

---

이 명세에서 다루지 않은 비즈니스 결정이 필요하면 작업을 중단하고 사람에게 질문하세요. **가정으로 진행하지 말 것.**
