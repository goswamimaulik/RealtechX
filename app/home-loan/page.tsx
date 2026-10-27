import type { Metadata } from 'next';
import { CheckCircle2, FileCheck2, Landmark, Percent, Timer, Wallet } from 'lucide-react';
import { PageHero, SectionHeading } from '@/components/ui';
import EmiCalculator from '@/components/EmiCalculator';
import LeadForm from '@/components/LeadForm';
import { img } from '@/lib/data/images';

export const metadata: Metadata = {
  title: 'Home Loan & EMI Calculator — Check Eligibility & Compare Offers',
  description: 'Calculate your home loan EMI, view the full repayment schedule, check eligibility and get the best home loan offers from leading banks.',
  alternates: { canonical: '/home-loan' },
};

const steps = [
  { Icon: Wallet, t: 'Check eligibility', d: 'Lenders usually look at income, existing EMIs, age and credit score.' },
  { Icon: FileCheck2, t: 'Submit documents', d: 'KYC, income proof, bank statements and property papers.' },
  { Icon: Landmark, t: 'Sanction & valuation', d: 'The lender verifies the property and issues a sanction letter.' },
  { Icon: Timer, t: 'Disbursement', d: 'Funds are released to the seller or as per construction stages.' },
];

const docs = {
  Salaried: ['PAN & Aadhaar', 'Last 3 months salary slips', '6 months bank statements', 'Form 16 / ITR for 2 years', 'Property documents & agreement'],
  'Self-employed': ['PAN & Aadhaar', 'ITR with computation for 3 years', 'Audited P&L and balance sheet', '12 months bank statements', 'Business proof & property documents'],
};

export default function HomeLoanPage() {
  return (
    <>
      <PageHero
        eyebrow="EMI & Home Loan"
        title="Plan your home loan with confidence"
        text="Calculate EMI, understand your repayment schedule and get assistance comparing offers from leading banks and housing finance companies."
        image={img.apartment[8]}
        crumbs={[{ href: '/', label: 'Home' }, { label: 'Home Loan' }]}
      />

      <section id="emi-calculator" className="section scroll-mt-24">
        <div className="container">
          <SectionHeading eyebrow="Calculator" title="Home loan EMI calculator" text="Move the sliders to see your monthly EMI, total interest and a year-by-year repayment schedule." />
          <div className="card p-6 md:p-10"><EmiCalculator /></div>
          <p className="mt-4 text-xs text-muted">Results are indicative. Actual EMI depends on the lender’s rate, fees and your credit profile.</p>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container">
          <SectionHeading eyebrow="Process" title="How a home loan works" center />
          <div className="grid gap-6 md:grid-cols-4">
            {steps.map(({ Icon, t, d }, i) => (
              <div key={t} className="card relative p-6">
                <span className="absolute right-5 top-4 font-display text-5xl font-semibold text-ink/5">0{i + 1}</span>
                <Icon className="h-8 w-8 text-gold-dark" />
                <p className="mt-4 font-bold">{t}</p>
                <p className="mt-1 text-sm text-muted">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <SectionHeading eyebrow="Checklist" title="Documents you will need" />
            <div className="grid gap-6 sm:grid-cols-2">
              {Object.entries(docs).map(([k, list]) => (
                <div key={k} className="card p-6">
                  <p className="font-display text-2xl font-semibold">{k}</p>
                  <ul className="mt-4 space-y-2.5 text-sm">
                    {list.map((d) => <li key={d} className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-gold-dark" />{d}</li>)}
                  </ul>
                </div>
              ))}
            </div>
            <div className="card mt-6 p-6">
              <p className="flex items-center gap-2 font-display text-2xl font-semibold"><Percent className="h-5 w-5 text-gold-dark" /> Tips to get a lower rate</p>
              <ul className="mt-4 grid gap-2.5 text-sm sm:grid-cols-2">
                {['Keep your credit score above 750', 'Choose a higher down payment', 'Add a co-applicant with income', 'Compare at least 3 lenders', 'Clear small existing loans first', 'Opt for a property with bank approvals'].map((t) => (
                  <li key={t} className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-gold-dark" />{t}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="card self-start p-7 md:p-9 lg:sticky lg:top-24">
            <p className="eyebrow">Free assistance</p>
            <h3 className="mb-5 mt-2 font-display text-3xl font-semibold">Get the best home loan offer</h3>
            <LeadForm source="Home Loan Page" intent="Home Loan Assistance" cta="Check My Eligibility" showMessage />
          </div>
        </div>
      </section>
    </>
  );
}
