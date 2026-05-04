interface RiskSignal {
  id: string;
  name: string;
  message: string;
  resources: string[];
}

export function RiskSignalBanner({ signals }: { signals: RiskSignal[] }): JSX.Element | null {
  if (signals.length === 0) return null;

  return (
    <aside
      role="note"
      className="mx-auto mt-8 max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"
    >
      <p className="text-base font-semibold">📌 추가 점검을 권하는 영역이 있어요</p>
      <p className="mt-2 leading-relaxed">
        결과에 따라 다음 영역의 추가 평가가 도움이 될 수 있는 패턴이 보였습니다. 절대적인 진단이
        아니며, 자기이해와 도움 자원 안내를 위한 알림입니다.
      </p>
      <ul className="mt-4 space-y-3">
        {signals.map((s) => (
          <li key={s.id} className="rounded-lg bg-white/70 p-3">
            <p className="font-medium">{s.name}</p>
            <p className="mt-1 text-amber-800/90">{s.message}</p>
            {s.resources.length > 0 ? (
              <p className="mt-2 text-xs text-amber-700">
                도움 자원: {s.resources.join(" · ")}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </aside>
  );
}
