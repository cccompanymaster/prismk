interface DimDatum {
  dim: string;
  label: string;
  tScore: number | null;
  ci?: { low: number; high: number } | null;
}

interface Props {
  data: DimDatum[];
  size?: number;
  color?: string;
}

const RING_T_SCORES = [30, 40, 50, 60, 70];
const MIN_T = 20;
const MAX_T = 80;

function tScoreToRadius(t: number, maxRadius: number): number {
  const clamped = Math.max(MIN_T, Math.min(MAX_T, t));
  return ((clamped - MIN_T) / (MAX_T - MIN_T)) * maxRadius;
}

export function RadarChart({ data, size = 320, color = "#7E57C2" }: Props): JSX.Element {
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size * 0.4;
  const labelRadius = maxRadius + 18;

  const points = data.map((d, i) => {
    const angle = (i / data.length) * 2 * Math.PI - Math.PI / 2;
    const radius = d.tScore === null ? 0 : tScoreToRadius(d.tScore, maxRadius);
    return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius, angle, datum: d };
  });

  const polygon = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto block"
      role="img"
      aria-label="6 차원 T-점수 레이더 차트"
    >
      {RING_T_SCORES.map((t) => {
        const r = tScoreToRadius(t, maxRadius);
        return (
          <circle
            key={t}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#e5e7eb"
            strokeDasharray={t === 50 ? "0" : "3 3"}
          />
        );
      })}
      {points.map((p) => (
        <line
          key={`spoke-${p.datum.dim}`}
          x1={cx}
          y1={cy}
          x2={cx + Math.cos(p.angle) * maxRadius}
          y2={cy + Math.sin(p.angle) * maxRadius}
          stroke="#e5e7eb"
        />
      ))}
      <polygon points={polygon} fill={color} fillOpacity={0.18} stroke={color} strokeWidth={2} />
      {points.map((p) => (
        <circle key={`pt-${p.datum.dim}`} cx={p.x} cy={p.y} r={4} fill={color} />
      ))}
      {points.map((p) => {
        const lx = cx + Math.cos(p.angle) * labelRadius;
        const ly = cy + Math.sin(p.angle) * labelRadius;
        return (
          <text
            key={`lbl-${p.datum.dim}`}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-slate-700 text-[11px]"
          >
            {p.datum.label}
            {p.datum.tScore !== null ? ` ${p.datum.tScore}` : ""}
          </text>
        );
      })}
    </svg>
  );
}
