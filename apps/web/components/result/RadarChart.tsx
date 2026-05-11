"use client";

import { motion } from "framer-motion";

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
    const lowRadius =
      d.ci?.low !== undefined && d.ci.low !== null ? tScoreToRadius(d.ci.low, maxRadius) : radius;
    const highRadius =
      d.ci?.high !== undefined && d.ci.high !== null
        ? tScoreToRadius(d.ci.high, maxRadius)
        : radius;
    return {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
      xLow: cx + Math.cos(angle) * lowRadius,
      yLow: cy + Math.sin(angle) * lowRadius,
      xHigh: cx + Math.cos(angle) * highRadius,
      yHigh: cy + Math.sin(angle) * highRadius,
      angle,
      datum: d,
    };
  });

  const polygon = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const polygonHigh = points.map((p) => `${p.xHigh.toFixed(1)},${p.yHigh.toFixed(1)}`).join(" ");
  const polygonLow = points.map((p) => `${p.xLow.toFixed(1)},${p.yLow.toFixed(1)}`).join(" ");
  const hasCI = data.some((d) => d.ci);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto block"
      role="img"
      aria-label="6 차원 T-점수 레이더 차트 (신뢰구간 음영 포함)"
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
            stroke={t === 50 ? "#cbd5e1" : "#e5e7eb"}
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
      {hasCI ? (
        <motion.polygon
          points={polygonHigh}
          fill={color}
          fillOpacity={0.08}
          stroke="none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        />
      ) : null}
      {hasCI ? (
        <motion.polygon
          points={polygonLow}
          fill="white"
          fillOpacity={1}
          stroke="none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        />
      ) : null}
      <motion.polygon
        points={polygon}
        fill={color}
        fillOpacity={0.18}
        stroke={color}
        strokeWidth={2.5}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
      {points.map((p, i) => (
        <motion.circle
          key={`pt-${p.datum.dim}`}
          cx={p.x}
          cy={p.y}
          r={4.5}
          fill={color}
          stroke="white"
          strokeWidth={2}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.4 + i * 0.05 }}
        />
      ))}
      {points.map((p, i) => {
        const lx = cx + Math.cos(p.angle) * labelRadius;
        const ly = cy + Math.sin(p.angle) * labelRadius;
        return (
          <motion.text
            key={`lbl-${p.datum.dim}`}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-slate-700 text-[11px] font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 + i * 0.05 }}
          >
            {p.datum.label}
            {p.datum.tScore !== null ? ` ${p.datum.tScore}` : ""}
          </motion.text>
        );
      })}
    </svg>
  );
}
