# PRISM-K 온라인 서비스

MBTI를 보완하는 차세대 성격 검사 — **라이트판(36문항)** + **풀 버전(136문항)**.

> 16개 패턴 × 메인-서브 조합으로 256가지 정체성 코드(예: `DI-SS`)를 제공합니다.

---

## 패키지 구성

```
prism-k/
├── README.md              ← 시작 가이드 (이 파일)
├── CLAUDE.md              ← Claude Code 마스터 지침 (작업 시작 전 필독)
├── PROJECT_SPEC.md        ← 비즈니스 로직 명세 (단일 진실 원천)
├── TASKS.md               ← 8개 Phase × 30+ task 분해
├── data/
│   ├── items.json         ← 검사 문항 136개 (라이트판 36개 표시)
│   └── patterns.json      ← 16 패턴 + 시그니처 + 채점 규칙 + 관계 매트릭스
├── packages/
│   ├── data/              ← 위 JSON을 타입과 함께 export
│   ├── types/             ← 도메인 타입 정의
│   └── scoring/           ← 채점 알고리즘 (Phase 1)
└── apps/
    ├── web/               ← Next.js 프론트엔드 (Phase 3)
    └── api/               ← NestJS 백엔드 (Phase 2)
```

---

## 시작하기

### 사전 요구

- Node.js 20+ (`.nvmrc` 참고)
- pnpm 9+

### 설치

```bash
pnpm install
```

### 작업 진행 순서

`TASKS.md`의 Phase 0 → Phase 7 순서로 진행합니다. Phase 2와 Phase 3은 병렬 가능.

전체 약 **6-8주** (1인 풀타임 또는 2명 파트타임 기준).

---

## 데이터 파일 사용법

### `data/items.json`

136개 검사 문항. 각 아이템은:

```json
{
  "id": 1,
  "dim": "O",
  "facet": "O1_상상력",
  "text": "나는 종종 일어날 법한 상황을 머릿속으로 생생하게 그려본다.",
  "reverse": false,
  "lite": false
}
```

라이트판은 `lite: true`인 36개를 사용합니다.

### `data/patterns.json`

16 패턴 + 매칭에 필요한 모든 정보. 핵심 객체:

- `patterns[]` — 16 패턴 풀 데이터 (이름, 슬로건, 시그니처, prototype 벡터, 가상 인물 사례 등)
- `scoring` — 채점 단계 명세
- `auxiliaryRules` — V/S/G 보조 차원 해석 규칙
- `riskSignals` — 5종 위험 신호 자동 점검 규칙
- `relationships[]` — 12개 대표 페어의 매칭 텍스트
- `resultReportSections[]` — 8개 결과 섹션 명세

---

## 핵심 의사결정 (이미 적용됨)

| 항목 | 선택 |
|---|---|
| 백엔드 | NestJS (Node.js + TypeScript) |
| 호스팅 | Vercel (web) + Supabase/AWS (db/api) |
| 인증 | NextAuth.js — 무로그인 기본 + 선택적 가입 |
| 도메인 | (미정) |

변경하려면 `CLAUDE.md`의 "기술 스택 결정" 섹션도 함께 수정해주세요.

---

## 개발 원칙

`CLAUDE.md`의 **"절대 하지 말 것 6가지"** 를 항상 의식할 것:

1. 학술적 정직성 훼손 금지 ("당신은 X입니다" 단정 X)
2. 임상 진단 용어 사용 금지
3. 채용·결혼 결정용 포지셔닝 금지
4. 데이터 과다 수집 금지 (실명·전화·주소 X)
5. 라벨 고착화 유도 금지 ("자라납니다" 메시지 필수)
6. 16 패턴 균등 노출 깨기 금지

---

## 도움 자원

- **막혔을 때 우선 순위**: `CLAUDE.md` → `PROJECT_SPEC.md` → `TASKS.md` → 사람에게 질문
- 비즈니스 결정이 필요하면 작업을 멈추고 질문 (가정으로 진행 금지)
