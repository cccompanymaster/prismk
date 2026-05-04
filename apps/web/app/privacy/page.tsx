import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "PRISM-K 개인정보처리방침",
};

export default function PrivacyPage(): JSX.Element {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <header className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold text-slate-900">개인정보처리방침</h1>
        <p className="mt-2 text-sm text-slate-500">
          본 문서는 법무 검토 전 1차 초안입니다. 정식 운영 전 한국 개인정보보호법(PIPA) 준수
          여부를 법무법인 검토를 통해 확정합니다.
        </p>
      </header>

      <div className="space-y-8 py-8 text-sm leading-relaxed text-slate-700">
        <section>
          <h2 className="text-lg font-semibold text-slate-900">1. 수집하는 개인정보 항목</h2>
          <p className="mt-2">
            PRISM-K는 자기이해 도구로서 개인 식별 정보를 최소한만 수집합니다.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>필수: 검사 응답 데이터, 익명 응답 토큰(UUID)</li>
            <li>자동 수집: 접속 일시, 브라우저 정보, IP 주소(마지막 옥텟 마스킹)</li>
            <li>선택: 이메일 주소(가입 시), 결과 영구 보관 여부</li>
          </ul>
          <p className="mt-3 font-medium text-slate-900">
            본 서비스는 실명·전화번호·주소·주민등록번호를 수집하지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">2. 개인정보 처리 목적</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>검사 결과 산출 및 익명 토큰을 통한 결과 조회</li>
            <li>서비스 품질 개선 및 익명 통계 분석</li>
            <li>가입자에게 결과 영구 보관 기능 제공</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">3. 보관 기간</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>무로그인 응답: 결과 토큰 발급 후 365일 후 자동 삭제</li>
            <li>가입자 응답·결과: 회원 탈퇴 시까지</li>
            <li>매칭 기록: 90일 후 자동 삭제</li>
            <li>익명 통계 메타데이터: 식별 불가 형태로 영구 보관</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">4. 14세 미만 보호자 동의</h2>
          <p className="mt-2">
            만 14세 미만 이용자는 보호자의 동의 절차를 거친 후에만 검사를 진행할 수 있도록
            구현됩니다(추후 적용). 동의 없이 수집된 정보는 즉시 파기됩니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">5. 정보주체의 권리</h2>
          <p className="mt-2">이용자는 언제든지 다음 권리를 행사할 수 있습니다.</p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>본인의 결과 토큰 삭제 요청</li>
            <li>가입자 계정 및 보관 데이터 일괄 삭제 요청</li>
            <li>처리정지·열람·정정 요청</li>
          </ul>
          <p className="mt-3">
            요청 채널은 정식 출시 시 본 페이지에 명시됩니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">6. 제3자 제공·위탁</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>개인정보를 제3자에게 판매하거나 광고 목적으로 제공하지 않습니다.</li>
            <li>인프라 제공자(Vercel, Supabase 등)에 한해 처리위탁이 이루어지며, 위탁 내용은 정식 출시 시 명시됩니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">7. 쿠키와 분석</h2>
          <p className="mt-2">
            서비스 품질 개선을 위해 익명 분석 도구(PostHog 등)를 사용할 수 있습니다. 이용자는 첫
            방문 시 표시되는 쿠키 동의 배너에서 거부할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">8. 안전성 확보 조치</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>전송 구간 TLS 1.2 이상 암호화</li>
            <li>관리자 접근 통제 및 접근 로그 기록</li>
            <li>데이터베이스 백업 및 복구 절차</li>
            <li>OWASP Top 10 기반 정기 보안 점검</li>
          </ul>
        </section>

        <p className="text-xs text-slate-500">
          본 정책은 법무 검토 후 최종 확정됩니다. 변경 시 공지 후 시행됩니다.
        </p>
      </div>
    </article>
  );
}
