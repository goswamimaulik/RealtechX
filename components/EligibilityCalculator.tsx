'use client';

import { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { formatINR } from '@/lib/format';
import { calcEmi } from './EmiCalculator';
import { openLead } from './LeadModal';

/** Indicative eligibility: lenders typically allow total EMIs up to ~50% of net monthly income (FOIR). */
export default function EligibilityCalculator() {
  const [income, setIncome] = useState(150000);
  const [existing, setExisting] = useState(0);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);
  const FOIR = 0.5;

  const { maxEmi, eligible } = useMemo(() => {
    const maxEmi = Math.max(0, income * FOIR - existing);
    const perLakh = calcEmi(100000, rate, years);
    return { maxEmi, eligible: perLakh > 0 ? Math.floor((maxEmi / perLakh) * 100000) : 0 };
  }, [income, existing, rate, years]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:gap-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Num label="Net monthly income" prefix="₹" value={income} onChange={setIncome} step={5000} />
        <Num label="Existing EMIs / month" prefix="₹" value={existing} onChange={setExisting} step={1000} />
        <Num label="Interest rate (% p.a.)" value={rate} onChange={setRate} step={0.05} decimals />
        <Num label="Tenure (years)" value={years} onChange={(v) => setYears(Math.min(30, Math.max(1, Math.round(v))))} step={1} />
      </div>
      <div className="flex flex-col justify-between rounded-[22px] border border-gold/30 bg-gold-50 p-6 md:p-7">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-dark">You may be eligible for</p>
          <p className="mt-2 font-display text-[38px] font-semibold leading-none md:text-[44px]">{formatINR(eligible)}</p>
          <p className="mt-3 text-[13.5px] text-ink/70">Affordable EMI up to <span className="font-semibold text-ink">₹{Math.round(maxEmi).toLocaleString('en-IN')}</span> / month for {years} years at {rate.toFixed(2)}%.</p>
        </div>
        <button
          type="button"
          onClick={() => openLead({ intent: 'Check Loan Eligibility', source: 'Eligibility Calculator', title: 'Get your exact eligibility', subtitle: `Indicative eligibility ${formatINR(eligible)} — an advisor will confirm with lenders.` })}
          className="btn-ink shine mt-6 w-full"
        >
          Get exact eligibility <ArrowRight className="h-4 w-4" />
        </button>
        <p className="mt-3 text-[11.5px] text-muted">Indicative only — based on ~50% of income towards EMIs. Lender policies vary.</p>
      </div>
    </div>
  );
}

function Num({ label, value, onChange, step, prefix, decimals }: { label: string; value: number; onChange: (v: number) => void; step: number; prefix?: string; decimals?: boolean }) {
  return (
    <label className="block rounded-2xl border border-ink/[0.08] bg-white p-4 transition focus-within:border-gold">
      <span className="block text-[11.5px] font-medium uppercase tracking-wider text-muted">{label}</span>
      <span className="mt-1 flex items-center gap-1">
        {prefix && <span className="font-display text-[20px] font-semibold text-ink/50">{prefix}</span>}
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={step}
          value={decimals ? value : Math.round(value)}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          className="w-full min-w-0 bg-transparent font-display text-[22px] font-semibold text-ink outline-none"
        />
      </span>
    </label>
  );
}
