'use client';

import { useState } from 'react';

const monthLabel = (m: string) => new Date(`${m}-01T00:00:00`).toLocaleDateString('en-IN', { month: 'short' });

/** Monthly bar chart (SVG, responsive, with hover values). */
export function MonthlyBars({ data, color = '#C9A45C', label }: { data: { month: string; value: number }[]; color?: string; label: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640;
  const H = 220;
  const pad = { l: 34, r: 8, t: 16, b: 26 };
  const max = Math.max(4, ...data.map((d) => d.value));
  const nice = Math.ceil(max / 4) * 4;
  const bw = (W - pad.l - pad.r) / data.length;
  const y = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - v / nice);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={label}>
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <g key={f}>
          <line x1={pad.l} x2={W - pad.r} y1={y(nice * f)} y2={y(nice * f)} stroke="#0B1020" strokeOpacity={f === 0 ? 0.15 : 0.06} />
          <text x={pad.l - 8} y={y(nice * f) + 4} textAnchor="end" fontSize="10.5" fill="#0B1020" fillOpacity="0.45">{Math.round(nice * f)}</text>
        </g>
      ))}
      {data.map((d, i) => {
        const x = pad.l + i * bw + bw * 0.2;
        const w = bw * 0.6;
        const top = y(d.value);
        const on = hover === i;
        return (
          <g key={d.month} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <rect x={pad.l + i * bw} y={pad.t} width={bw} height={H - pad.t - pad.b} fill="transparent" />
            <rect x={x} y={top} width={w} height={Math.max(0, H - pad.b - top)} rx={Math.min(5, w / 3)} fill={color} fillOpacity={hover === null || on ? 1 : 0.45} />
            <text x={x + w / 2} y={H - 8} textAnchor="middle" fontSize="10.5" fill="#0B1020" fillOpacity={on ? 0.9 : 0.5} fontWeight={on ? 700 : 400}>{monthLabel(d.month)}</text>
            {on && (
              <g>
                <rect x={Math.min(Math.max(x + w / 2 - 34, 2), W - 70)} y={Math.max(top - 30, 0)} width={68} height={22} rx={6} fill="#0B1020" />
                <text x={Math.min(Math.max(x + w / 2, 36), W - 36)} y={Math.max(top - 15, 15)} textAnchor="middle" fontSize="11" fill="#E7D3A4" fontWeight="700">{d.value.toLocaleString('en-IN')}</text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** Monthly area/line chart. */
export function MonthlyLine({ data, color = '#0B1020', label }: { data: { month: string; value: number }[]; color?: string; label: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640;
  const H = 220;
  const pad = { l: 40, r: 12, t: 16, b: 26 };
  const max = Math.max(4, ...data.map((d) => d.value));
  const mag = 10 ** Math.max(0, Math.floor(Math.log10(max)) - 1);
  const nice = Math.ceil(max / (4 * mag)) * 4 * mag;
  const step = (W - pad.l - pad.r) / Math.max(1, data.length - 1);
  const x = (i: number) => pad.l + i * step;
  const y = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - v / nice);
  const pts = data.map((d, i) => `${x(i)},${y(d.value)}`).join(' ');
  const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(Math.round(n)));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={label} onMouseLeave={() => setHover(null)}>
      <defs>
        <linearGradient id="rtx-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#C9A45C" stopOpacity="0.35" />
          <stop offset="1" stopColor="#C9A45C" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <g key={f}>
          <line x1={pad.l} x2={W - pad.r} y1={y(nice * f)} y2={y(nice * f)} stroke="#0B1020" strokeOpacity={f === 0 ? 0.15 : 0.06} />
          <text x={pad.l - 8} y={y(nice * f) + 4} textAnchor="end" fontSize="10.5" fill="#0B1020" fillOpacity="0.45">{fmt(nice * f)}</text>
        </g>
      ))}
      <polygon points={`${x(0)},${y(0)} ${pts} ${x(data.length - 1)},${y(0)}`} fill="url(#rtx-area)" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (
        <g key={d.month} onMouseEnter={() => setHover(i)}>
          <rect x={x(i) - step / 2} y={pad.t} width={step} height={H - pad.t - pad.b} fill="transparent" />
          <circle cx={x(i)} cy={y(d.value)} r={hover === i ? 5 : 3} fill="#fff" stroke={color} strokeWidth="2" />
          <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="10.5" fill="#0B1020" fillOpacity={hover === i ? 0.9 : 0.5} fontWeight={hover === i ? 700 : 400}>{monthLabel(d.month)}</text>
          {hover === i && (
            <g>
              <rect x={Math.min(Math.max(x(i) - 38, 2), W - 78)} y={Math.max(y(d.value) - 32, 0)} width={76} height={22} rx={6} fill="#0B1020" />
              <text x={Math.min(Math.max(x(i), 40), W - 40)} y={Math.max(y(d.value) - 17, 15)} textAnchor="middle" fontSize="11" fill="#E7D3A4" fontWeight="700">{d.value.toLocaleString('en-IN')}</text>
            </g>
          )}
        </g>
      ))}
    </svg>
  );
}

/** Horizontal proportion bars (lead status, sources). */
export function SplitBars({ rows }: { rows: { label: string; value: number; color: string }[] }) {
  const total = rows.reduce((n, r) => n + r.value, 0) || 1;
  return (
    <div className="space-y-3">
      <div className="flex h-2.5 overflow-hidden rounded-full bg-ink/[0.06]">
        {rows.map((r) => r.value > 0 && <span key={r.label} style={{ width: `${(r.value / total) * 100}%`, background: r.color }} className="h-full first:rounded-l-full last:rounded-r-full" />)}
      </div>
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center justify-between gap-3 text-[13px]">
            <span className="flex min-w-0 items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: r.color }} /><span className="truncate capitalize">{r.label}</span></span>
            <span className="shrink-0 tabular-nums text-ink/60"><b className="text-ink">{r.value}</b> · {Math.round((r.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
