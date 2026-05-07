# Liv Functional

Premium bilingual (English / Arabic) wellness studio — DIY plans, 1:1 coaching, free consultations, blog, and brand site. Built as a single-page React app with Supabase as the headless backend.

```
Brand colors  forest #006c45  ·  coral #ff5757  ·  bone (cream)  ·  ink (charcoal)
Type          Cairo (UI, EN + AR)  ·  Fraunces (display serif)
```

---

## Tech stack

| Layer | Choice |
|---|---|
| Build | Vite 5 + React 18 + TypeScript (strict) |
| Styling | Tailwind CSS 3 (custom theme + design tokens) |
| Animation | GSAP 3 + ScrollTrigger + ScrollToPlugin · Framer Motion · Lenis (smooth scroll) |
| Routing | React Router 6 |
| Forms | React Hook Form + Zod |
| Data | Supabase (Postgres + RLS + Auth-ready) · TanStack Query |
| i18n | i18next + react-i18next (EN/AR with auto `dir="rtl"`) |
| SEO | react-helmet-async (Open Graph, Twitter, JSON-LD) |
| Icons | lucide-react |

---

## Getting started

```bash
# 1. Install
npm install

# 2. Configure env
cp .env.example .env
# fill in VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (optional in dev — site falls back to seed data)

# 3. Run
npm run dev          # http://localhost:5173
npm run build        # type-check + production build
npm run preview      # preview production build
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
```

---

## Environment variables

| Name | Required | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | optional in dev | Project URL from Supabase dashboard |
| `VITE_SUPABASE_ANON_KEY` | optional in dev | Public anon key (RLS-protected) |
| `VITE_SITE_URL` | recommended | Used for canonical URLs and Open Graph (e.g. `https://livfunctional.com`) |
| `VITE_DEFAULT_LOCALE` | optional | `en` or `ar` (default `en`) |

If Supabase env vars are missing, `getSupabase()` returns `null` and the site renders entirely from local seed data in `src/data/*` — useful for design iteration without a database.

---

## Supabase setup

1. Create a new project at [supabase.com](https://supabase.com).
2. Open the SQL editor and paste the contents of [`supabase/schema.sql`](supabase/schema.sql). Run it. The script is **idempotent** — safe to re-run. It creates tables, RLS, and three public storage buckets (`product-images`, `collection-images`, `page-images`).
3. Copy the project's `URL` and `anon public` key into `.env`.
4. Create the admin user: **Authentication → Users → Add user** (email + password). Any signed-in user is treated as an admin.
5. Visit `/admin/login` to sign in and start creating products, collections, and pages.

### What the schema contains

- **Enums** — `lf_locale (en|ar)`, `lf_product_category (diy|coaching)`, `lf_booking_status`.
- **Public-read tables** — `products`, `posts`, `testimonials`. RLS policies expose only rows where `is_published = true` / `is_visible = true` to the anon key.
- **Insert-only tables** — `bookings`, `contacts`, `newsletter`, `digital_orders`. Anon clients can write but **never read or update**. Read these from a server function with the **service-role key** only.
- **Triggers** — `lf_set_updated_at()` on `products` and `posts`.
- **Indexes** — category/published filters, lower-cased email lookups, booking date/time.

### Server-side reads

Any admin dashboard, fulfillment script, or scheduled task that needs to read bookings/contacts/orders must use the **service-role key** (never expose it client-side). Drop these into a Supabase Edge Function or your own server:

```ts
import { createClient } from "@supabase/supabase-js";
const admin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
```

### Digital downloads

`digital_orders.download_url` is intended to hold a **short-lived signed URL** generated server-side from a private Supabase Storage bucket. The client never sees the storage path — only the signed URL it receives by email or in the post-checkout response.

---

## Folder architecture

```
liv-functional-1/
├─ public/                       static assets (favicon, og image)
├─ src/
│  ├─ components/
│  │  ├─ booking/                BookingWidget (calendar + time slots + form)
│  │  ├─ blog/                   PostCard, related posts
│  │  ├─ home/                   Hero, TransformationStories (pinned scroll),
│  │  │                          HowItWorks, TestimonialsSlider, NewsletterCTA, …
│  │  ├─ layout/                 Header (with About dropdown), MobileMenu,
│  │  │                          Footer, Layout (mounts Lenis/Loader/Cursor)
│  │  ├─ product/                CollectionHero, ProductCard, PricingTable
│  │  ├─ seo/                    SEO component (helmet + JSON-LD)
│  │  └─ ui/                     Button, Container, Section, Reveal, MaskLines,
│  │                             Cursor, Loader, PageTransition
│  ├─ content/                   en.json / ar.json (full translation set)
│  ├─ data/                      products-diy, products-coaching, posts, testimonials
│  ├─ hooks/                     useScrollReveal, useMagnetic, useLenis, useDirection
│  ├─ lib/                       i18n, supabase, gsap, utils (cn)
│  ├─ pages/                     Home, DIYCollection, DIYProduct, CoachingCollection,
│  │                             CoachingProduct, Consultations, Blog, BlogPost,
│  │                             About, MyStory, WhyUs, Contact, HowItWorks, FAQs,
│  │                             B2B, RecommendedProducts, Privacy, Terms, NotFound
│  ├─ types/                     Shared TS types (LocalizedString, Product, …)
│  ├─ App.tsx                    Routes
│  ├─ main.tsx                   Root + providers (Helmet, Query, Router, i18n)
│  ├─ index.css                  Tailwind layers + design tokens + utilities
│  └─ vite-env.d.ts
├─ supabase/
│  └─ schema.sql                 Full Postgres schema + RLS policies
├─ tailwind.config.ts
├─ vite.config.ts
├─ tsconfig.json
└─ package.json
```

### Routes

| Path | Page |
|---|---|
| `/` | Home |
| `/diy` · `/diy/:slug` | DIY collection · product detail |
| `/coaching` · `/coaching/:slug` | Coaching collection · product detail |
| `/consultations` | Free 15-min booking |
| `/blog` · `/blog/:slug` | Blog index · post |
| `/about` · `/about/my-story` · `/about/why-us` · `/about/contact` | About cluster |
| `/how-it-works` · `/faq` · `/b2b` · `/recommended` | Static |
| `/privacy` · `/terms` · `*` | Legal · 404 |
| `/p/:slug` | Dynamic page rendered from admin-built blocks |
| `/admin/login` · `/admin/products` · `/admin/collections` · `/admin/pages` | Admin portal (Supabase-Auth gated) |

---

## Animation architecture

- **GSAP** is the primary driver. ScrollTrigger pins the transformation horizontal scroll, scrubs the "How it works" vertical line, and stage-reveals every section.
- **Lenis** provides smooth scroll, wired into `gsap.ticker` so ScrollTrigger calculations stay in sync.
- **Custom hooks** — `useScrollReveal` finds `[data-reveal]` children and fades them on enter; `useMagnetic` produces the cursor-following CTA buttons.
- **Reduced motion** — every animation hook short-circuits when `prefers-reduced-motion: reduce` is set, and `index.css` disables all CSS transitions/animations under the same query. Always test with that flag enabled.
- **Page transition** — a coral cover slides up over the outgoing page, scroll resets to top, then slides back down.

---

## Bilingual + RTL

- Translations live in `src/content/{en,ar}.json`. Both files share the exact same key tree.
- All product/post/testimonial data is shaped as `{ en: string, ar: string }` (`LocalizedString`). Components pick the active language with `i18n.language?.startsWith('ar') ? 'ar' : 'en'`.
- The language switcher writes to `localStorage` (`liv-lang`) and `document.documentElement.dir = 'rtl'` is set automatically.
- Tailwind's `rtl:` variant + a `.flip-rtl` utility flip arrows, sliders, and the horizontal pinned scroll direction.
- **Cairo** is used for both languages so the visual rhythm stays consistent — the Arabic glyph set in Cairo is native and editorial.

---

## Forms & data flows

| Form | Table | Notes |
|---|---|---|
| Newsletter (footer + home CTA) | `newsletter` | Unique by email; insert-only via anon |
| Contact (`/about/contact`) | `contacts` | Insert-only via anon |
| Booking (`/consultations`) | `bookings` | Insert-only via anon. `google_event_id` column reserved for Google Calendar sync (server-side) |
| DIY purchase email gate | `digital_orders` | Insert-only. Server populates `download_url` + `download_expires_at` |

All forms gracefully no-op when Supabase env is missing, so design + QA work doesn't require a connected database.

---

## Deployment

The build is a static SPA — deploy `dist/` to any static host. Recommended:

- **Vercel / Netlify** — drop in, set env vars, done. Add a SPA fallback rewrite (`/* → /index.html`).
- **Cloudflare Pages** — same.

Set the four env vars listed above in the host's dashboard. Ensure `VITE_SITE_URL` matches the production origin so canonical URLs and Open Graph tags resolve correctly.

---

## Customization quick map

| Change… | Where |
|---|---|
| Brand colors / fonts | `tailwind.config.ts` + `src/index.css` (`:root` tokens) |
| Copy (any language) | `src/content/{en,ar}.json` |
| Products | `src/data/products-{diy,coaching}.ts` (or `products` table once seeded) |
| Blog posts | `src/data/posts.ts` (or `posts` table) |
| Testimonials | `src/data/testimonials.ts` (or `testimonials` table) |
| Booking time slots | `src/components/booking/BookingWidget.tsx` |
| Hero animation tuning | `src/components/home/Hero.tsx` |
| Routes / nav | `src/App.tsx` + `src/components/layout/Header.tsx` |

---

## Notes for handoff

- The site is intentionally renderable **without** Supabase configured — recommended for design review and offline work.
- Service-role operations (admin reads, Stripe/Calendar webhooks, signed-URL minting) belong in Supabase Edge Functions or a separate server. Do not ship the service-role key to the client.
- Reduced-motion compliance is wired in everywhere; new animation work should follow the same pattern (`if (prefersReducedMotion()) return;` early-return inside GSAP hooks).
#   l i v  
 #   l i v f u n c t i o n a l  
 