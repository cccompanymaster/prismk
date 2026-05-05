# PRISM-K 배포 가이드

이 문서는 운영자가 처음 배포 환경을 구성할 때 따라가는 1회성 체크리스트입니다.

---

## 사전 준비 (사람이 해야 하는 작업)

| 항목 | 발급처 | 필요 환경변수 |
|---|---|---|
| 도메인 | 가비아·후이즈 등 | — |
| Vercel 프로젝트 | https://vercel.com/new | `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` |
| PostgreSQL (Supabase 등) | https://supabase.com/dashboard | `DATABASE_URL` |
| Redis (선택, Upstash 등) | https://console.upstash.com | `REDIS_URL` |
| Kakao JS SDK 키 | https://developers.kakao.com/console/app | `NEXT_PUBLIC_KAKAO_KEY` |
| Sentry 프로젝트 | https://sentry.io | `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN` |
| API 컨테이너 레지스트리 | AWS ECR / Docker Hub | `API_REGISTRY`, `REGISTRY_USERNAME`, `REGISTRY_PASSWORD` |

---

## Web (apps/web) — Vercel

1. Vercel 콘솔에서 새 프로젝트 생성, 본 모노레포 import.
2. **Root Directory** = `apps/web`. `vercel.json`이 자동 인식되어 워크스페이스 빌드를 처리합니다.
3. 환경변수 설정 (Vercel 콘솔):
   - `NEXT_PUBLIC_API_BASE` — 운영 API 도메인 (예: `https://api.prism-k.kr/api`)
   - `NEXT_PUBLIC_SITE_URL` — 운영 도메인 (예: `https://prism-k.kr`)
   - `NEXT_PUBLIC_KAKAO_KEY` — (선택)
   - `NEXT_PUBLIC_SENTRY_DSN` — (선택)
4. GitHub Actions 통합 시:
   - Settings → Secrets and variables → Actions
   - Secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`
   - Variables: `VERCEL_PROJECT_ID`
5. `Actions → Deploy → Run workflow` 로 수동 배포 가능.

`vercel.json` 적용 사항:
- `/result/*`, `/test/*` 페이지는 `X-Robots-Tag: noindex, nofollow` (응답자 결과 비공개).
- 리전 `icn1` (Seoul) 우선.

---

## API (apps/api) — Docker 호스팅

선택 가능한 호스팅: AWS ECS Fargate, Cloudflare Workers (지원되는 NestJS 어댑터 사용 시), Fly.io 등.

### 1. 컨테이너 이미지 빌드

```bash
docker build -t prism-k-api -f apps/api/Dockerfile .
docker run --rm -p 4000:4000 \
  -e DATABASE_URL=postgresql://... \
  -e CORS_ALLOWED_ORIGINS=https://prism-k.kr \
  prism-k-api
```

### 2. 마이그레이션

배포마다 한 번:

```bash
docker run --rm \
  -e DATABASE_URL=postgresql://... \
  prism-k-api \
  pnpm --filter @prism-k/api exec prisma migrate deploy
```

### 3. 운영 환경변수

| 변수 | 필수 | 설명 |
|---|---|---|
| `DATABASE_URL` | ✓ | PostgreSQL 연결 문자열 |
| `PORT` | | 기본 4000 |
| `CORS_ALLOWED_ORIGINS` | ✓ | `https://prism-k.kr` (콤마 구분) |
| `SENTRY_DSN` | | Sentry 프로젝트 DSN |
| `SENTRY_ENV` | | `production`/`staging` |

### 4. 헬스 체크

Load balancer 헬스 체크 경로: `GET /api/health` (200 + `{ status, timestamp }`).

---

## CI/CD

`.github/workflows/ci.yml`:
- main 푸시 또는 PR 생성 시 자동 실행
- install → typecheck → test → build 4개 잡

`.github/workflows/deploy.yml`:
- `workflow_dispatch` 수동 트리거만
- `target` 선택: `production` 또는 `preview`
- Vercel + 컨테이너 레지스트리 환경변수가 설정되어 있을 때만 동작 (gated)

---

## 첫 배포 체크리스트

- [ ] 도메인 등록 + DNS 설정 (web → Vercel, api → Docker 호스트)
- [ ] PostgreSQL 인스턴스 생성 + `DATABASE_URL` 발급
- [ ] Vercel 프로젝트 생성 + 환경변수 설정
- [ ] API 컨테이너 레지스트리 준비
- [ ] GitHub Secrets/Variables 입력
- [ ] 마이그레이션 1회 실행 (`prisma migrate deploy`)
- [ ] `/api/health` 응답 확인
- [ ] 웹에서 검사 → 결과 → 매칭 E2E 동작 확인
- [ ] OG 이미지 카카오톡·트위터 미리보기 정상 확인
