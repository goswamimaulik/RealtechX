import type { Metadata } from 'next';
import { BadgeCheck, CheckCircle2, Clock, FileCheck2, Landmark, Percent, ShieldCheck, Timer, Wallet } from 'lucide-react';
import { Breadcrumbs, Faq, SectionHeading } from '@/components/ui';
import Image from '@/components/SmartImage';
import EmiCalculator from '@/components/EmiCalculator';
import EligibilityCalculator from '@/components/EligibilityCalculator';
import LeadForm from '@/components/LeadForm';
import DocTabs from '@/components/DocTabs';
import { img } from '@/lib/data/images';

export const metadata: Metadata = {
  title: 'Home Loan & EMI Calculator — Check Eligibility & Compare Offers',
  description: 'Calculate your home loan EMI with a year-wise repayment schedule, check your loan eligibility, see the documents you need and get help comparing offers from leading lenders.',
  alternates: { canonical: '/home-loan' },
};

const steps = [
  { Icon: Wallet, t: 'Check eligibility', d: 'Lenders look at income, existing EMIs, age and credit score to decide how much you can borrow.' },
  { Icon: FileCheck2, t: 'Apply with documents', d: 'Submit KYC, income proof, bank statements and the property papers.' },
  { Icon: Landmark, t: 'Sanction & valuation', d: 'The lender verifies the property’s legal and technical details and issues a sanction letter.' },
  { Icon: Timer, t: 'Disbursement', d: 'Funds are released to the seller — in one go for ready homes or in stages for under-construction projects.' },
];

const faqs = [
  { q: 'How much home loan can I get?', a: 'Most lenders allow your total EMIs (including the new loan) to be roughly 40–55% of your net monthly income, depending on income level and credit profile. Use the eligibility calculator above for an indicative figure.' },
  { q: 'How much down payment do I need?', a: 'Lenders typically finance 75–90% of the property value depending on the loan amount, so plan for a down payment of 10–25% plus stamp duty, registration and other charges.' },
  { q: 'Fixed or floating interest rate — which is better?', a: 'Most home loans in India are floating-rate and linked to an external benchmark, so your EMI or tenure can change when rates move. Fixed-rate options exist but are usually priced higher and may convert to floating after a period.' },
  { q: 'Can I prepay my home loan?', a: 'For individual borrowers on floating-rate home loans, banks generally do not charge prepayment penalties. Even small prepayments early in the tenure can save a large amount of interest.' },
  { q: 'Are there tax benefits on a home loan?', a: 'Depending on the tax regime you choose, principal and interest repayments on a home loan may be eligible for deductions. Please check the current rules with a tax advisor.' },
];

export default function HomeLoanPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-ink text-ivory">
        <Image src={img.loan} alt="" fill priority sizes="100vw" className="-z-20 object-cover opacity-30" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/90 to-ink/60" />
        <div className="pointer-events-none absolute -right-24 top-10 -z-10 h-80 w-80 rounded-full bg-gold/20 blur-3xl" />
        <div className="container grid gap-10 py-12 md:py-20 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <Breadcrumbs items={[{ href: '/', label: 'Home' }, { label: 'Home Loan' }]} />
            <p className="eyebrow mt-6 !text-gold-light">EMI & home loan</p>
            <h1 className="mt-3 text-balance font-display text-[32px] font-semibold leading-[1.1] md:text-[54px]">Plan your home loan with <span className="gold-text italic">complete clarity</span></h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ivory/70 md:text-[17px]">Calculate your EMI, see exactly how much interest you’ll pay, check how much you can borrow and get free help comparing offers from leading lenders.</p>
            <div className="mt-7 grid max-w-lg grid-cols-3 gap-3">
              {[
                { Icon: Percent, t: 'Compare offers' },
                { Icon: Clock, t: 'Quick approvals' },
                { Icon: ShieldCheck, t: 'Free assistance' },
              ].map(({ Icon, t }) => (
                <div key={t} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-center backdrop-blur md:p-4">
                  <Icon className="mx-auto h-5 w-5 text-gold" />
                  <p className="mt-2 text-[12px] font-medium leading-tight md:text-[13px]">{t}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[26px] bg-white p-5 text-ink shadow-2xl md:p-7">
            <p className="font-display text-[22px] font-semibold">Talk to a loan advisor</p>
            <p className="mb-5 mt-1 text-[13.5px] text-muted">Share your details — we’ll compare offers and call you back.</p>
            <LeadForm source="Home Loan Hero" intent="Home Loan Assistance" cta="Get free loan assistance" />
          </div>
        </div>
      </section>

      {/* EMI */}
      <section id="emi-calculator" className="section scroll-mt-24">
        <div className="container">
          <SectionHeading eyebrow="Calculator" title="Home loan EMI calculator" text="Move the sliders to see your monthly EMI, total interest and a year-by-year repayment schedule." />
          <div className="rounded-[26px] border border-ink/[0.07] bg-white p-5 shadow-[0_6px_24px_-14px_rgba(11,16,32,.25)] md:p-10"><EmiCalculator /></div>
          <p className="mt-4 text-[12px] text-muted">Results are indicative. Actual EMI depends on the lender’s rate, fees and your credit profile.</p>
        </div>
      </section>

      {/* Eligibility */}
      <section className="section bg-white">
        <div className="container">
          <SectionHeading eyebrow="Eligibility" title="How much can you borrow?" text="Enter your income and existing EMIs to get an indicative loan amount." />
          <EligibilityCalculator />
        </div>
      </section>

      {/* Process */}
      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Process" title="How a home loan works" center />
          <ol className="relative grid gap-4 md:grid-cols-4 md:gap-5">
            <span className="pointer-events-none absolute left-0 right-0 top-[44px] hidden h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent md:block" />
            {steps.map(({ Icon, t, d }, i) => (
              <li key={t} className="relative rounded-[22px] border border-ink/[0.07] bg-white p-5 md:p-6">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink"><Icon className="h-5 w-5 text-gold-light" /></span>
                  <span className="font-display text-[34px] font-semibold text-ink/10">0{i + 1}</span>
                </div>
                <p className="mt-4 text-[16px] font-semibold">{t}</p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Documents + tips */}
      <section className="section bg-white">
        <div className="container grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Checklist" title="Documents you will need" />
            <DocTabs />
          </div>
          <div>
            <SectionHeading eyebrow="Save more" title="Tips for a lower rate" />
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {[
                'Keep your credit score above 750',
                'Make a larger down payment',
                'Add an earning co-applicant',
                'Compare at least 3 lenders',
                'Close small existing loans first',
                'Choose bank-approved projects',
                'Prepay whenever you get a bonus',
                'Review your rate every few years',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 rounded-2xl border border-ink/[0.07] bg-ivory/50 p-3.5 text-[14px]">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-gold-dark" />{t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ + CTA */}
      <section className="section">
        <div className="container grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <SectionHeading eyebrow="FAQ" title="Home loan questions, answered" />
            <Faq items={faqs} />
          </div>
          <div className="self-start rounded-[26px] bg-ink p-6 text-ivory md:p-8 lg:sticky lg:top-24">
            <BadgeCheck className="h-8 w-8 text-gold" />
            <p className="mt-3 font-display text-[26px] font-semibold leading-tight">Get the best home loan offer</p>
            <p className="mb-6 mt-2 text-[14px] text-ivory/65">Free, no-obligation assistance from application to disbursement.</p>
            <LeadForm source="Home Loan Bottom" intent="Home Loan Assistance" cta="Check my eligibility" dark showEmail={false} />
          </div>
        </div>
      </section>
    </>
  );
}
