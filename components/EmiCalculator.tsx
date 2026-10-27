'use client';

import { useMemo, useState } from 'react';
import { formatINR } from '@/lib/format';
import { openLead } from './LeadModal';

export function calcEmi(principal: number, annualRate: number, years: number) {
  const r = annualRate / 12 / 100;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export default function EmiCalculator({ defaultAmount = 7500000, compact = false }: { defaultAmount?: number; compact?: boolean }) {
  const [amount, setAmount] = useState(Math.min(Math.max(defaultAmount, 500000), 100000000));
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);
  const [showTable, setShowTable] = useState(false);

  const { emi, total, interest, schedule } = useMemo(() => {
    const emi = calcEmi(amount, rate, years);
    const total = emi * years * 12;
    let bal = amount;
    const schedule: { year: number; principal: number; interest: number; balance: number }[] = [];
    for (let y = 1; y <= years; y++) {
      let pY = 0, iY = 0;
      for (let m = 0; m < 12; m++) {
        const i = (bal * rate) / 1200;
        const p = emi - i;
        bal = Math.max(0, bal - p);
        pY += p; iY += i;
      }
      schedule.push({ year: y, principal: pY, interest: iY, balance: bal });
    }
    return { emi, total, interest: total - amount, schedule };
  }, [amount, rate, years]);

  const pPct = (amount / total) * 100;

  return (
    <div className={`grid gap-8 ${compact ? '' : 'lg:grid-cols-[1.2fr_1fr]'}`}>
      <div className="space-y-7">
        <Slider label="Loan Amount" value={amount} display={formatINR(amount)} min={500000} max={100000000} step={100000} onChange={setAmount} />
        <Slider label="Interest Rate (p.a.)" value={rate} display={`${rate.toFixed(2)} %`} min={6} max={15} step={0.05} onChange={setRate} />
        <Slider label="Loan Tenure" value={years} display={`${years} Years`} min={1} max={30} step={1} onChange={setYears} />
      </div>

      <div className="rounded-2xl bg-ink-grad p-7 text-ivory">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-light">Monthly EMI</p>
        <p className="mt-2 font-display text-5xl font-semibold">₹{Math.round(emi).toLocaleString('en-IN')}</p>
        <div className="mt-6 flex items-center gap-5">
          <div
            className="h-28 w-28 shrink-0 rounded-full"
            style={{ background: `conic-gradient(#C9A45C 0 ${pPct}%, rgba(255,255,255,.15) ${pPct}% 100%)` }}
            role="img"
            aria-label={`Principal ${Math.round(pPct)}%, interest ${Math.round(100 - pPct)}%`}
          >
            <div className="m-[14px] grid h-[84px] w-[84px] place-items-center rounded-full bg-ink text-xs font-bold">{Math.round(pPct)}%</div>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-gold" /><dt className="text-ivory/60">Principal</dt><dd className="ml-auto pl-3 font-semibold">{formatINR(amount)}</dd></div>
            <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-white/30" /><dt className="text-ivory/60">Interest</dt><dd className="ml-auto pl-3 font-semibold">{formatINR(Math.round(interest))}</dd></div>
            <div className="flex items-center gap-2 border-t border-white/10 pt-2"><dt className="text-ivory/60">Total Payable</dt><dd className="ml-auto pl-3 font-semibold">{formatINR(Math.round(total))}</dd></div>
          </dl>
        </div>
        <button onClick={() => openLead({ intent: 'Get Home Loan Offer', source: 'EMI Calculator', title: 'Get the best home loan offer', subtitle: `Loan of ${formatINR(amount)} for ${years} years — compare offers from leading banks.` })} className="btn-gold mt-7 w-full">
          Check Loan Eligibility
        </button>
      </div>

      {!compact && (
        <div className="lg:col-span-2">
          <button onClick={() => setShowTable((s) => !s)} className="btn-outline">{showTable ? 'Hide' : 'View'} year-wise repayment schedule</button>
          {showTable && (
            <div className="card mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead className="bg-ivory-200 text-left text-xs uppercase tracking-wider text-muted">
                  <tr><th className="px-4 py-3">Year</th><th className="px-4 py-3">Principal Paid</th><th className="px-4 py-3">Interest Paid</th><th className="px-4 py-3">Balance</th></tr>
                </thead>
                <tbody>
                  {schedule.map((s) => (
                    <tr key={s.year} className="border-t border-ink/5">
                      <td className="px-4 py-2.5 font-semibold">{s.year}</td>
                      <td className="px-4 py-2.5">{formatINR(Math.round(s.principal))}</td>
                      <td className="px-4 py-2.5">{formatINR(Math.round(s.interest))}</td>
                      <td className="px-4 py-2.5">{formatINR(Math.round(s.balance))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Slider({ label, value, display, min, max, step, onChange }: { label: string; value: number; display: string; min: number; max: number; step: number; onChange: (v: number) => void }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-ink/80">{label}</p>
        <p className="rounded-lg bg-gold-50 px-3 py-1 font-display text-xl font-semibold text-ink">{display}</p>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full accent-[#C9A45C]"
        style={{ background: `linear-gradient(to right, #C9A45C ${pct}%, #E9E0D0 ${pct}%)` }}
        aria-label={label}
      />
    </div>
  );
}
