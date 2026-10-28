import type { BlogPost } from '../types';
import { img } from './images';

export const blogs: BlogPost[] = [
  {
    slug: 'home-loan-emi-guide-for-first-time-buyers',
    title: 'Home Loan EMI Guide for First-Time Buyers',
    excerpt: 'How EMI is calculated, how tenure and interest rate change what you pay, and simple ways to reduce your total interest outgo.',
    category: 'Home Loans',
    date: '2026-10-24',
    readTime: '6 min read',
    cover: img.apartment[8],
    sections: [
      {
        heading: 'What exactly is an EMI?',
        body: [
          'An Equated Monthly Instalment (EMI) is the fixed amount you pay your lender every month until the loan is repaid. Each EMI has two parts — interest and principal. In the early years most of the EMI goes towards interest; as the loan ages, a larger share repays the principal.',
          'EMI is calculated with the formula EMI = P × r × (1 + r)^n / ((1 + r)^n − 1), where P is the loan amount, r is the monthly interest rate and n is the number of months. You do not need to do this by hand — our EMI calculator does it instantly.',
        ],
      },
      {
        heading: 'Tenure vs. EMI: the real trade-off',
        body: [
          'A longer tenure lowers your EMI but increases the total interest you pay. A shorter tenure raises the EMI but can save lakhs over the life of the loan. Choose a tenure where the EMI is comfortable — most lenders prefer it to stay within 40–50% of your monthly take-home income.',
        ],
      },
      {
        heading: 'Five ways to reduce your interest outgo',
        body: [
          'Make a larger down payment so you borrow less. Prepay part of the principal whenever you receive a bonus — even small prepayments early in the tenure have a big impact. Maintain a strong credit score to negotiate a better rate. Compare offers across banks and housing finance companies. Review your rate every few years and consider a balance transfer if the gap is significant.',
        ],
      },
      {
        heading: 'Use the calculator before you shortlist',
        body: [
          'Before shortlisting properties, calculate an EMI you are comfortable with and work backwards to a budget. It keeps your search focused and your negotiations confident.',
        ],
      },
    ],
  },
  {
    slug: 'rera-explained-what-every-homebuyer-should-check',
    title: 'RERA Explained: What Every Homebuyer Should Check',
    excerpt: 'A simple checklist to verify a project on your state RERA portal before you pay a booking amount.',
    category: 'Buying Guide',
    date: '2026-10-19',
    readTime: '5 min read',
    cover: img.apartment[0],
    sections: [
      {
        heading: 'Why RERA matters',
        body: [
          'The Real Estate (Regulation and Development) Act, 2016 requires most residential and commercial projects above a threshold size to be registered with the state RERA authority before they are marketed. Registration brings transparency on approvals, timelines and how buyer money is used.',
        ],
      },
      {
        heading: 'Your verification checklist',
        body: [
          'Search the project’s registration number on the state RERA website (for example MahaRERA, K-RERA, TS-RERA or GujRERA). Confirm the promoter name, project address and the proposed completion date. Check the approved plans and the number of units. Review quarterly progress updates and any complaints filed against the project.',
          'Make sure the carpet area mentioned in your agreement matches the RERA definition, and that the agreement for sale follows the format prescribed by your state.',
        ],
      },
      {
        heading: 'A note on this portal',
        body: [
          'RealtechX is a preview portal. Listings shown here are sample projects for demonstration and are not yet verified on any RERA portal. Always verify a project independently before making a decision.',
        ],
      },
    ],
  },
  {
    slug: 'plot-vs-apartment-which-is-better-investment',
    title: 'Plot vs Apartment: Which Is the Better Investment?',
    excerpt: 'Appreciation, rental income, maintenance and liquidity — a balanced comparison to help you decide.',
    category: 'Investment',
    date: '2026-10-12',
    readTime: '7 min read',
    cover: img.land[0],
    sections: [
      {
        heading: 'The case for plots',
        body: [
          'Land is the appreciating component of real estate. A plot gives you full control over what you build and when, has low maintenance costs and does not depreciate the way a building does. Plots in growth corridors near airports, highways and industrial zones have historically appreciated well over long holding periods.',
        ],
      },
      {
        heading: 'The case for apartments',
        body: [
          'Apartments offer immediate rental income, amenities, security and easier bank financing. In established city locations they are also easier to rent and resell. For end users who want to move in quickly, a ready or near-ready apartment is usually the practical choice.',
        ],
      },
      {
        heading: 'How to decide',
        body: [
          'If your goal is long-term capital growth and you can wait, a well-located plot with clear title is attractive. If you want rental yield or plan to live in the property soon, an apartment usually works better. Many investors hold both to balance growth and income.',
        ],
      },
    ],
  },
  {
    slug: 'checklist-before-buying-under-construction-property',
    title: '10-Point Checklist Before Buying an Under-Construction Property',
    excerpt: 'From developer track record to payment plans — what to verify before you book.',
    category: 'Buying Guide',
    date: '2026-10-05',
    readTime: '6 min read',
    cover: img.apartment[2],
    sections: [
      {
        heading: 'Due diligence on the developer',
        body: [
          'Look at the developer’s delivered projects, visit one if possible and speak to residents. Check how closely past projects met their promised possession dates and specifications.',
        ],
      },
      {
        heading: 'The 10-point checklist',
        body: [
          '1) RERA registration and completion date. 2) Title and land ownership documents. 3) Approved building plans. 4) Carpet area versus super built-up area. 5) Construction-linked payment plan. 6) Bank approvals for home loans. 7) Specification sheet in writing. 8) Penalty clauses for delay. 9) Maintenance charges and corpus. 10) Exit and cancellation terms.',
        ],
      },
      {
        heading: 'Visit the site',
        body: [
          'Visit at different times of day to judge traffic, noise and the neighbourhood. Check the actual progress against the developer’s published timeline.',
        ],
      },
    ],
  },
  {
    slug: 'commercial-real-estate-office-vs-retail',
    title: 'Commercial Real Estate: Office vs Retail for Investors',
    excerpt: 'Understand rental yields, lease tenures and tenant risk before you invest in commercial property.',
    category: 'Investment',
    date: '2026-09-28',
    readTime: '5 min read',
    cover: img.commercial[0],
    sections: [
      {
        heading: 'Why investors look at commercial property',
        body: [
          'Commercial property typically offers higher rental yields than residential, longer lease tenures and contractual rent escalations. The trade-off is a higher ticket size and longer vacancy periods between tenants.',
        ],
      },
      {
        heading: 'Office spaces',
        body: [
          'Offices in established business districts attract corporate tenants on multi-year leases. Grade-A buildings with good parking, power backup and transit access command better rents and lower vacancy.',
        ],
      },
      {
        heading: 'Retail',
        body: [
          'High-street retail depends on footfall and frontage. Ground-floor units on busy roads can command premium rents, but tenant quality and catchment are critical. Evaluate the surrounding residential density carefully.',
        ],
      },
    ],
  },
  {
    slug: 'why-north-bangalore-is-a-growth-corridor',
    city: 'bangalore',
    title: 'Why North Bangalore Is a Real Estate Growth Corridor',
    excerpt: 'The airport, aerospace SEZ and improving connectivity have made Devanahalli and Hebbal hot markets.',
    category: 'Market Insights',
    date: '2026-09-20',
    readTime: '4 min read',
    cover: img.villa[3],
    sections: [
      {
        heading: 'Infrastructure is the story',
        body: [
          'Kempegowda International Airport, the Aerospace SEZ and business parks along the airport road have shifted Bangalore’s growth northwards. Improved road links and planned rail connectivity continue to bring the region closer to the city core.',
        ],
      },
      {
        heading: 'What buyers are choosing',
        body: [
          'Plotted developments and villas are popular with end users seeking space, while investors are drawn to apartments near business parks for rental demand from airport and aerospace employees.',
        ],
      },
    ],
  },
];

export const getBlog = (slug: string) => blogs.find((b) => b.slug === slug);
