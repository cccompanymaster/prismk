# PRISM-K 성능 가이드

본 문서는 운영 환경에서 Lighthouse 모바일 90+ 목표를 유지하기 위한 점검 항목을 모아둡니다.

## 목표

| 페이지 | LCP | TBT | CLS | Lighthouse Mobile |
|---|---|---|---|---|
| `/` (랜딩) | < 2.5s | < 200ms | < 0.05 | ≥ 90 |
| `/test/[version]` | < 2.5s | < 200ms | < 0.05 | ≥ 90 |
| `/result/[token]` | < 2.5s (API 응답 후) | < 300ms | < 0.05 | ≥ 90 |

## 적용된 최적화

- **폰트**: `next/font/google`로 `Noto Sans KR`을 self-host. `display: swap` + variable CSS 변수로 FOIT 방지.
- **API preconnect**: `<link rel="preconnect">`를 layout에서 빌드 타임에 주입. 결과 페이지 fetch 첫 RTT 감소.
- **레이더 차트**: 외부 라이브러리 없이 순수 SVG 서버 컴포넌트. 클라이언트 JS 번들 0 KB.
- **카드 이미지**: `@vercel/og` 기반 동적 PNG. 결과 페이지 자체에는 포함되지 않으므로 LCP 영향 없음.
- **셔플 결과 캐시**: 검사 페이지는 SSG. 클라이언트에서 API 한 번만 호출 후 localStorage 드래프트.
- **신뢰성 메시지**: 결과 페이지 8 섹션은 Accordion으로 첫 화면 LCP 감소.
- **이미지 정책**: 현재 비트맵 이미지 미사용. 추후 추가 시 `next/image` 필수.

## 빌드 결과 베이스라인

```
Route (app)                              Size     First Load JS
┌ ○ /                                    180 B          94.1 kB
├ ○ /match                               3.04 kB        90.2 kB
├ ○ /patterns                            179 B          94.2 kB
├ ● /patterns/[id]                       179 B          94.2 kB
├ ○ /privacy                             142 B          87.3 kB
├ ƒ /result/[token]                      1.9 kB         89.1 kB
├ ○ /terms                               142 B          87.3 kB
└ ● /test/[version]                      3.51 kB        90.7 kB
+ First Load JS shared by all            87.2 kB
```

전 페이지 First Load JS < 100 KB.

## CI 점검 (선택)

`@lhci/cli`(Lighthouse CI)를 추가하여 PR마다 Lighthouse 자동 점검을 권장합니다.

```yaml
# .github/workflows/lighthouse.yml (예시)
- name: Run Lighthouse CI
  run: npx @lhci/cli@0.13.x autorun \
    --collect.url=http://localhost:3100/ \
    --collect.url=http://localhost:3100/patterns \
    --assert.preset=lighthouse:no-pwa
```

(베이스라인이 잡힌 후 운영자가 도입하는 것을 권장)

## 모니터링

- **Sentry**: tracesSampleRate 기본 0.1 (운영에서 조정).
- **PostHog**: `card_generated`, `result_viewed`, `test_completed` 등 13종 이벤트는 PROJECT_SPEC §12 참고.
- **Vercel Analytics** (선택): Web Vitals 자동 수집을 원할 경우 `@vercel/analytics`를 layout에 추가.

## 점검 항목 (출시 전)

- [ ] 모바일 Lighthouse 4개 페이지 모두 90+
- [ ] 모바일 Slow 4G 시뮬레이션에서 LCP < 3s
- [ ] 결과 페이지 OG 이미지 응답시간 < 1s (Vercel Edge 권장)
- [ ] 카카오톡·트위터·페이스북 미리보기 정상 (OG)
- [ ] 카드 다운로드 응답 < 500ms
- [ ] WCAG 2.1 AA 통과 (Playwright + axe로 CI 게이트됨)
