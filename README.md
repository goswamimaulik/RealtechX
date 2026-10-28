# RealtechX — Premium Real Estate Portal (Next.js)

Phase 1: complete public website (frontend) with sample data, search & filters, all archive pages, 3-second auto popup on every property page, lead forms everywhere and email notification for every new lead.

## Tech
- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS (luxury ink + champagne-gold theme) · fonts: Cormorant Garamond (headings) + Inter (body) via `next/font` (self-hosted, fast)
- Nodemailer (Gmail SMTP) for lead emails
- Static generation for all property, city, locality, type, status, developer and blog pages → very fast + SEO friendly

## Pages
| URL | Page |
|---|---|
| `/` | Home (hero search, categories, featured, cities, status tabs, developers, EMI, blog, FAQ) |
| `/properties` | Search results with filters (city, locality, type, buy/rent, budget, BHK, status, developer) + **Sort by** (newest, featured, price ↑/↓, area) + grid/list |
| `/buy`, `/rent`, `/sell` | Buy & rent archives, Sell / Post Property form |
| `/property-type/[type]` | residential, commercial, plot, land, villa |
| `/city/[city]` and `/city/[city]/[locality]` | City & locality archives |
| `/status/[status]` | new-launch, under-construction, ready-to-move |
| `/developers`, `/developers/[slug]` | Developer listing & detail (with all their projects) |
| `/property/[slug]` | Property detail: gallery + lightbox, auto popup (3 sec), key facts, floor plans (tabs by BHK), amenities (view all), locality report (tabs + map), developer, RERA, EMI, FAQ, similar (carousel), sticky mobile CTA |
| `/home-loan` | EMI calculator + repayment schedule, eligibility calculator, process, documents (Salaried/Self-employed/NRI), FAQ (`/emi-calculator` redirects here) |
| `/localities` | All localities grouped by city |
| `/about` (stats + FAQ), `/contact` (FAQ), `/blog`, `/blog/[slug]` | Company pages & blog (`/services` redirects to `/about`) |
| `/privacy-policy`, `/terms-and-conditions`, `/disclaimer`, `/rera-disclaimer`, `/cookie-policy` | Legal |
| `/shortlist`, `/thank-you`, `/sitemap.xml`, `/robots.txt` | Utility |

## Where to edit content
- Contact details, top-bar notice: `lib/site.ts`
- Properties (250 listings — 10 cities × 5 types × 5):
  - `lib/data/real-projects.ts` — real projects by top developers, **only details published by the developer / portals** (anything else shows "On request"). Images are representative.
  - `lib/data/handpicked.ts` — hand-written sample listings
  - `lib/data/generated.ts` — sample listings that fill every city × type to 5 (only fictional developers)
  - Per-listing contact: add `contactPhone: '+91XXXXXXXXXX'` and/or `whatsapp: '91XXXXXXXXXX'` to any listing — cards, detail page, sticky bar and WhatsApp links use it automatically (falls back to the site number).
- Developers: `lib/data/developers.ts` · Cities: `lib/data/cities.ts` · Blogs: `lib/data/blogs.ts` · Legal: `lib/data/legal.ts`
- Reviews (marked as sample on the site): `lib/data/reviews.ts` — replace with real client reviews
- In Phase 2 all of this moves to the admin panel + MongoDB.

## Run locally
```bash
npm install
cp .env.example .env.local   # then fill SMTP_PASS
npm run dev                  # http://localhost:3000
```

## Go live on Vercel (step by step)
1. Create a new **GitHub** repo (e.g. `realtechx`) and upload all files of this folder (not `node_modules`, not `.next`).
2. Go to **vercel.com → Add New → Project → Import** the repo. Framework is auto-detected as Next.js. Click **Deploy**.
3. In Vercel → Project → **Settings → Environment Variables** add:
   - `NEXT_PUBLIC_SITE_URL` = your Vercel URL (or custom domain later)
   - `SMTP_USER` = maulikgoswami202@gmail.com
   - `SMTP_PASS` = Gmail **App Password** (Google Account → Security → 2-Step Verification → App passwords → create "RealtechX")
   - `LEAD_NOTIFY_EMAIL` = maulikgoswami202@gmail.com
4. **Deployments → Redeploy** so the variables take effect.
5. Test: open any property page → popup appears in 3 seconds → submit → you receive an email.
6. Custom domain (optional): Settings → Domains → add `realtechx.in` (or your domain) and set the DNS records Vercel shows.
7. SEO: add the site in **Google Search Console**, submit `https://your-domain/sitemap.xml`.

## Updating the live site
Upload the changed files to GitHub (drag & drop the folders `app`, `components`, `lib`, `public` and the root files onto **Add file → Upload files**, then **Commit changes**). Vercel redeploys automatically within 1–2 minutes.
