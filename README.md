# RealtechX — Premium Real Estate Portal (Next.js)

Phase 1: complete public website (frontend) with sample data, search & filters, all archive pages, 3-second auto popup on every property page, lead forms everywhere and email notification for every new lead.

## Tech
- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS (luxury ink + champagne-gold theme, Cormorant Garamond + Manrope fonts)
- Nodemailer (Gmail SMTP) for lead emails
- Static generation for all property, city, locality, type, status, developer and blog pages → very fast + SEO friendly

## Pages
| URL | Page |
|---|---|
| `/` | Home (hero search, categories, featured, cities, status tabs, developers, EMI, blog, FAQ) |
| `/properties` | Search results with filters (city, locality, type, buy/rent, budget, BHK, status, developer, sort, grid/list) |
| `/buy`, `/rent`, `/sell` | Buy & rent archives, Sell / Post Property form |
| `/property-type/[type]` | residential, commercial, plot, land, villa |
| `/city/[city]` and `/city/[city]/[locality]` | City & locality archives |
| `/status/[status]` | new-launch, under-construction, ready-to-move |
| `/developers`, `/developers/[slug]` | Developer listing & detail (with all their projects) |
| `/property/[slug]` | Property detail: gallery + lightbox, auto popup (3 sec), price table, floor plan unlock, amenities, map, developer, EMI, FAQ, similar, sticky mobile CTA |
| `/home-loan` | EMI calculator + amortisation schedule + loan guide (`/emi-calculator` redirects here) |
| `/about`, `/services`, `/contact`, `/blog`, `/blog/[slug]` | Company pages & blog |
| `/privacy-policy`, `/terms-and-conditions`, `/disclaimer`, `/rera-disclaimer`, `/cookie-policy` | Legal |
| `/shortlist`, `/thank-you`, `/sitemap.xml`, `/robots.txt` | Utility |

## Where to edit content
- Contact details, top-bar notice: `lib/site.ts`
- Properties: `lib/data/properties.ts` (25 sample listings — 5 cities × 5 types)
- Developers: `lib/data/developers.ts` · Cities: `lib/data/cities.ts` · Blogs: `lib/data/blogs.ts` · Legal: `lib/data/legal.ts`
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
