'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';

const docs: Record<string, string[]> = {
  Salaried: ['PAN card & Aadhaar', 'Last 3 months’ salary slips', '6 months’ bank statements', 'Form 16 / ITR for 2 years', 'Employment / offer letter', 'Property agreement & papers'],
  'Self-employed': ['PAN card & Aadhaar', 'ITR with computation for 3 years', 'Audited P&L and balance sheet', '12 months’ bank statements', 'Business registration proof', 'Property agreement & papers'],
  NRI: ['Passport & visa', 'Overseas address proof', 'Salary slips & employment contract', 'NRE/NRO bank statements', 'Power of attorney (if applicable)', 'Property agreement & papers'],
};

export default function DocTabs() {
  const [tab, setTab] = useState('Salaried');
  return (
    <div className="overflow-hidden rounded-[22px] border border-ink/[0.07] bg-white">
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto border-b border-ink/[0.06] p-3" role="tablist">
        {Object.keys(docs).map((k) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`shrink-0 rounded-full px-4 py-2 text-[13.5px] font-medium transition ${tab === k ? 'bg-ink text-ivory' : 'bg-ivory text-ink/75'}`}>
            {k}
          </button>
        ))}
      </div>
      <ul key={tab} className="animate-fadeIn divide-y divide-ink/[0.06]">
        {docs[tab].map((d) => (
          <li key={d} className="flex items-center gap-3 px-5 py-3.5 text-[14px]">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold-50"><FileText className="h-4 w-4 text-gold-dark" /></span>
            {d}
          </li>
        ))}
      </ul>
    </div>
  );
}
