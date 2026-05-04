interface QA {
  q: string;
  a: string;
}

const FAQ: QA[] = [
  {
    q: "결과가 평생 라벨이 되나요?",
    a: "아니요. 본 결과는 ‘지금의 패턴’입니다. 결과 페이지에도 ‘이는 자라난다’는 안내가 함께 표시됩니다.",
  },
  {
    q: "회원가입이 필요한가요?",
    a: "아니요. 무로그인이 기본입니다. 가입 시에는 결과를 영구 보관할 수 있습니다.",
  },
  {
    q: "결과를 채용·결혼 결정에 사용해도 되나요?",
    a: "본 결과는 단독 결정 도구로 사용하지 않도록 설계되어 있습니다. 자기이해와 대화를 위한 자료로 활용해 주세요.",
  },
  {
    q: "어떤 데이터가 수집되나요?",
    a: "응답 내용 자체와 익명 메타데이터(접속 시간, 브라우저 정보 등)만 수집합니다. 실명·전화·주소는 수집하지 않습니다.",
  },
];

export function FaqSection(): JSX.Element {
  return (
    <section className="border-t border-slate-100 bg-white py-16">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-center text-2xl font-bold text-slate-900">자주 묻는 질문</h2>
        <dl className="mt-8 space-y-5">
          {FAQ.map((qa) => (
            <div key={qa.q} className="rounded-xl border border-slate-200 bg-white p-5">
              <dt className="text-sm font-semibold text-slate-900">{qa.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-slate-600">{qa.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
