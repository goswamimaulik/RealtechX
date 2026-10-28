'use client';

import { useMemo, useState } from 'react';
import { Layers, Lock, Maximize2, PhoneCall } from 'lucide-react';
import type { Configuration } from '@/lib/types';
import { openLead } from '../LeadModal';

/** Group configurations into tabs: "3 BHK Grande" → "3 BHK", "Office Floor (Half)" → "Office Floor". */
function groupOf(label: string) {
  const bhk = label.match(/^(\d+)\s*BHK/i);
  if (bhk) return `${bhk[1]} BHK`;
  return label.replace(/\s*\(.*\)\s*/, '').replace(/^(Plot|Corner Plot).*/i, 'Plots');
}

export default function FloorPlans({ configs, property, noun = '' }: { configs: Configuration[]; property: string; noun?: string }) {
  const groups = useMemo(() => {
    const m = new Map<string, Configuration[]>();
    configs.forEach((c) => {
      const g = groupOf(c.label);
      m.set(g, [...(m.get(g) ?? []), c]);
    });
    return Array.from(m, ([name, items]) => ({ name, items }));
  }, [configs]);
  const [tab, setTab] = useState(groups[0]?.name);
  const current = groups.find((g) => g.name === tab) ?? groups[0];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="no-scrollbar -mx-4 flex max-w-[calc(100%+2rem)] gap-2 overflow-x-auto px-4 sm:mx-0 sm:max-w-full sm:px-0" role="tablist">
          {groups.map((g) => (
            <button
              key={g.name}
              role="tab"
              aria-selected={tab === g.name}
              onClick={() => setTab(g.name)}
              className={`shrink-0 rounded-full border px-4 py-2 text-[13.5px] font-medium transition ${tab === g.name ? 'border-ink bg-ink text-ivory' : 'border-ink/10 bg-white text-ink/75 hover:border-gold'}`}
            >
              {g.name}{noun && /BHK/.test(g.name) ? ` ${noun}` : ''}
            </button>
          ))}
        </div>
        <p className="text-[12.5px] text-muted">{configs.length} {configs.length === 1 ? 'plan' : 'plans'} available</p>
      </div>

      <div key={current?.name} className="mt-5 grid animate-fadeIn gap-4 sm:grid-cols-2">
        {current?.items.map((c, i) => (
          <div key={c.label + i} className="overflow-hidden rounded-[20px] border border-ink/[0.07] bg-white shadow-[0_6px_24px_-14px_rgba(11,16,32,.25)]">
            <div className="relative grid aspect-[16/10] place-items-center overflow-hidden bg-[repeating-linear-gradient(45deg,#FAF7F1,#FAF7F1_10px,#F3EDE2_10px,#F3EDE2_20px)]">
              <svg viewBox="0 0 200 120" className="absolute inset-6 h-[calc(100%-48px)] w-[calc(100%-48px)] opacity-25 blur-[1.5px]" aria-hidden="true">
                <g fill="none" stroke="#0B1020" strokeWidth="2">
                  <rect x="4" y="4" width="192" height="112" />
                  <path d="M80 4v60H4M80 64h50v52M130 4v40h66M130 44v20M160 64v52" />
                </g>
              </svg>
              <button
                type="button"
                onClick={() => openLead({ property, intent: `Unlock ${c.label} Floor Plan`, source: 'Floor Plan' })}
                className="btn-ink shine relative !px-4 !py-2.5 text-[13px]"
              >
                <Lock className="h-3.5 w-3.5" /> Unlock floor plan
              </button>
            </div>
            <div className="flex items-end justify-between gap-3 p-4 md:p-5">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[15px] font-semibold"><Layers className="h-4 w-4 text-gold-dark" />{c.label}</p>
                <p className="mt-1 flex items-center gap-1.5 text-[13px] text-muted"><Maximize2 className="h-3.5 w-3.5" />{c.area}</p>
              </div>
              <p className="shrink-0 text-right font-display text-[19px] font-semibold">{c.price}</p>
            </div>
            <div className="border-t border-ink/[0.06] p-3">
              <button
                type="button"
                onClick={() => openLead({ property, intent: `Price breakup: ${c.label}`, source: 'Floor Plan Callback' })}
                className="btn-outline w-full !py-2.5 text-[13px]"
              >
                <PhoneCall className="h-4 w-4" /> Request callback
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
