import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관",
  description: "PRISM-K 이용약관",
};

export default function TermsPage(): JSX.Element {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <header className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold text-slate-900">이용약관</h1>
        <p className="mt-2 text-sm text-slate-500">
          본 문서는 법무 검토 전 1차 초안입니다. 정식 운영 전 법무법인 검토를 통해 확정합니다.
        </p>
      </header>

      <div className="space-y-8 py-8 text-sm leading-relaxed text-slate-700">
        <section>
          <h2 className="text-lg font-semibold text-slate-900">제1조 (목적)</h2>
          <p className="mt-2">
            본 약관은 PRISM-K 온라인 성격 검사 서비스(이하 “서비스”)의 이용 조건과 절차, 이용자와
            운영자의 권리·의무·책임 사항을 규정하는 것을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">제2조 (서비스의 성격과 한계)</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>
              서비스는 자기이해와 대화의 도구를 제공하기 위한 것이며, 임상 진단·의학적 판단·법적
              판단을 대체하지 않습니다.
            </li>
            <li>
              <strong>본 결과는 채용·인사·결혼 결정에 단독 사용되지 않습니다.</strong> 운영자는
              결과 페이지·결과 카드·매칭 페이지에 동일 안내를 영구 노출합니다.
            </li>
            <li>
              결과는 “지금의 패턴”이며 시간·맥락에 따라 변화할 수 있습니다. 단정적 라벨이 아님을
              이해한 후 이용해 주시기 바랍니다.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">제3조 (이용자의 의무)</h2>
          <ol className="mt-3 list-decimal space-y-1 pl-5">
            <li>이용자는 본인의 응답을 진실하게 입력해야 합니다.</li>
            <li>타인의 결과 토큰을 무단으로 수집·게시·재배포할 수 없습니다.</li>
            <li>서비스의 정상 운영을 방해하는 행위(자동화 어뷰징, 부하 공격 등)를 할 수 없습니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">제4조 (금지 행위)</h2>
          <p className="mt-2">다음과 같은 용도로 본 서비스의 결과를 사용할 수 없습니다.</p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>채용 면접·인사 평가·승진 심사 등 인사 결정의 단독 근거</li>
            <li>결혼 적합성 평가의 단독 근거</li>
            <li>법적·의료적 진단의 대체 또는 보조 자료로의 공식 인용</li>
            <li>기업 내부 인사 시스템 또는 채용 페이지에 응답자 동의 없이 결과를 노출</li>
          </ul>
          <p className="mt-3">
            운영자는 위 행위가 확인될 경우 해당 접근을 차단하고 필요한 법적 조치를 취할 수
            있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">제5조 (지식재산권)</h2>
          <ol className="mt-3 list-decimal space-y-1 pl-5">
            <li>16개 패턴, 시그니처(컬러·동물·단어), 검사 문항, 결과 리포트 텍스트의 저작권은
              운영자에게 있습니다.
            </li>
            <li>이용자의 응답은 본인의 자기 표현으로서 이용자의 권리이며, 운영자는 익명 통계 목적
              외에는 이를 분석·게시하지 않습니다.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">제6조 (서비스의 변경·중단)</h2>
          <p className="mt-2">
            운영자는 서비스 품질 개선·정책 변경·기술적 사유로 서비스 내용을 변경하거나 일시적으로
            중단할 수 있으며, 중요한 변경은 사전 공지합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">제7조 (책임의 제한)</h2>
          <p className="mt-2">
            본 서비스는 자기이해의 도구이며, 운영자는 이용자가 결과를 어떻게 해석·활용했는지에
            기인한 결정·관계·인사 등의 결과에 대하여 책임지지 않습니다. 다만 운영자의 고의 또는
            중과실로 인한 손해는 본 약관에도 불구하고 관계 법령에 따라 책임집니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">제8조 (분쟁의 해결)</h2>
          <p className="mt-2">
            본 약관과 관련된 분쟁은 한국 법령을 준거법으로 하며, 운영자 본점 소재지 관할 법원을
            전속적 합의 관할 법원으로 합니다.
          </p>
        </section>

        <p className="text-xs text-slate-500">본 약관은 법무 검토 후 최종 확정됩니다.</p>
      </div>
    </article>
  );
}
