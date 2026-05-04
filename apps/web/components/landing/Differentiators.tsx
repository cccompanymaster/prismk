interface Diff {
  title: string;
  body: string;
  accent: string;
}

const ITEMS: Diff[] = [
  {
    title: "이분법이 아닌 연속선",
    body: "‘외향이거나 내향이거나’가 아니라 6개 차원에서의 위치를 보여드립니다. 검사할 때마다 결과가 흔들리는 일이 줄어듭니다.",
    accent: "bg-pattern-DI",
  },
  {
    title: "메인 × 서브 코드",
    body: "16개 패턴의 조합으로 256가지 코드를 제공합니다. ‘DI-SS’처럼 두 패턴이 어우러진 모습을 자기 정체성의 단서로 사용할 수 있습니다.",
    accent: "bg-pattern-SS",
  },
  {
    title: "자라남을 전제하는 결과",
    body: "결과는 ‘지금의 패턴’이지 ‘평생 라벨’이 아닙니다. 모든 결과 페이지에 변화 가능성과 성장 영역이 함께 안내됩니다.",
    accent: "bg-pattern-GC",
  },
];

export function Differentiators(): JSX.Element {
  return (
    <section className="border-t border-slate-100 bg-white py-16">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="text-center text-2xl font-bold text-slate-900">
          기존 성격 검사와 무엇이 다른가요?
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {ITEMS.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <span className={`inline-block h-2 w-10 rounded-full ${item.accent}`} />
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
