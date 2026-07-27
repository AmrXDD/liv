# GRAPH_REPORT — liv-functional (`liv-main`)

> **Mode: structural-fallback.** Native Graphify (`graphifyy`, Python 3.10+) is
> unavailable in this environment (no Python/pip), so this graph was built from
> the real filesystem layout and actual `import` edges rather than the native
> semantic extractor. Edges below are counted from source, not hand-drawn.
>
> Scope: `src/` (113 `.ts`/`.tsx` files) + the Supabase backend surface.
> Generated for architecture orientation of the Vite + React + TS wellness site.

---

## 1. Shape at a glance

- **113** source modules, **40** of them page/route components.
- **43** modules depend on the Supabase data layer (`lib/supabase` or `lib/queries`) — that's the spine of the app.
- Clear layered flow: **`main` → `App` (router) → pages → feature components → `ui` primitives → hooks → `lib` core → data / i18n / Supabase backend.**
- One shared utility hub (`lib/utils`) is imported by ~half the codebase.
- A self-contained **admin subsystem** (`/admin/*`, 6 admin components + ~19 admin pages) sits alongside the public site, sharing the same `lib` core.

## 2. Clusters (nodes)

| Cluster | Files | Role |
|---|---:|---|
| `pages` | 40 | Route components (public + admin) |
| `lib` | 15 | Core: data access, i18n, gsap, seo, cart, mappers, storage |
| `components/ui` | 13 | Design-system primitives (Container, Section, Button, Reveal…) |
| `components/home` | 13 | Landing-page sections |
| `components/layout` | 6 | Header/HeaderDock/Footer/MobileMenu/Layout |
| `components/admin` | 6 | Block editor, rich-text editor, admin UI |
| `hooks` | 4 | `useLenis`, `useScrollReveal`, `useDirection`, `useMagnetic` |
| `data` | 3 | Static fallbacks (posts, testimonials, nutritionIssues) |
| `components/cart` | 3 | Cart drawer/button/add |
| `components/product` | 2 | ProductCard, CollectionHero |
| `components/booking` | 2 | Booking widget, Cal embed |
| `components/seo` · `components/blocks` · `types` | 1 each | SEO head, block renderer, shared types |
| `(root)` | 3 | `main.tsx`, `App.tsx`, `vite-env` |
| `supabase` (backend) | 5 edge fns + 14 SQL | Serverless + schema/RLS/seeds |

## 3. Cluster dependency edges (weighted, real counts)

Top structural edges (`A -> B` = A imports from B):

```
App.tsx           -> pages              40    (router mounts every page)
pages             -> lib                78    (data/i18n/seo everywhere)
pages             -> components/ui      50
components/home    -> components/ui      28
pages             -> components/admin   22
pages             -> components/home    20
pages             -> components/seo     19
components/ui      -> lib               18
components/home    -> lib               18
pages             -> hooks              11
pages             -> components/product 11
components/layout  -> components/ui     10
components/home    -> hooks             10
components/admin   -> lib                9
hooks             -> lib                 7
components/layout  -> lib                7
components/cart    -> lib                6
lib               -> content            4    (i18n en/ar json)
components/booking -> lib                4
data              -> types              3
```

Directionality is clean and acyclic at the cluster level: UI/feature layers depend on `lib`; `lib` depends on `content`/`data`/`types` and the external Supabase SDK. No page→page or ui→pages back-edges.

## 4. Hotspots (hub modules by fan-in)

These are the modules the most files import — the highest-blast-radius files:

| Module | Imported by | Note |
|---|---:|---|
| `lib/utils` | 52 | `cn`, formatting — touch with care |
| `components/ui/Container` | 32 | Layout primitive |
| `lib/supabase` | 29 | DB client — data spine |
| `components/ui/Section` | 28 | Layout primitive |
| `lib/queries` | 22 | React-Query data hooks |
| `components/admin/ui` | 21 | Admin form kit |
| `components/seo/SEO` | 19 | Per-page head |
| `components/ui/Button` | 18 | |
| `types` | 17 | Shared domain types |
| `lib/gsap` · `hooks/useDirection` · `hooks/useScrollReveal` | 14 / 13 / 12 | Motion + RTL layer |
| `lib/mappers` · `lib/cart` | 10 / 10 | Row↔model mapping, cart state |

## 5. External stack (top imports)

`react` (62) · `lucide-react` (48) · `react-i18next` (47) · `react-router-dom` (43) · `@tanstack/react-query` (22) · `gsap` (4) · `@dnd-kit/*` (7) · `zod` + `react-hook-form` + `@hookform/resolvers` (forms) · `react-helmet-async` (SEO) · `@supabase/supabase-js` (data).

## 6. Backend surface

- **Edge functions:** `book-consultation`, `create-checkout-session`, `stripe-webhook`, `submit-contact`, `subscribe-newsletter` (+ `_shared`).
- **SQL:** 14 files — `schema.sql` (tables/enums/RLS), product/collection/blog seeds, refreshes, storage policies, stripe.
- Frontend reaches the backend almost entirely through `lib/queries` + `lib/supabase` + `lib/mappers`; edge functions are called from cart/checkout/contact/newsletter flows.

## 7. Route map

**Public:** `/`, `/diy-plans[/:slug]`, `/coaching[/:slug]`, `/apply/:slug`, `/consultations`, `/blog[/:slug]`, `/about`, `/my-story`, `/why-us`, `/contact`, `/how-it-works`, `/faq`, `/partners`, `/b2b`, `/recommended`, `/collections/:slug`, `/checkout[/success|/cancel]`, `/privacy`, `/terms`, `/coaching-agreement`, `/p/:slug` (dynamic CMS pages), `*` (404).

**Admin (`/admin`):** login, dashboard, products[/:id], collections[/:id], pages[/:id | /text/:slug], coaching, consultations, payments, import, inquiries, emails, newsletter, blog[/:id], accreditations, nutrition-issues, recommended, b2b-pillars.

## 8. Observations

- **`lib` is the true core** — every layer funnels through it; changes to `lib/utils`, `lib/supabase`, or `lib/queries` ripple widest.
- **`pages` is a thick orchestration layer** (40 files) that composes home/product/ui components; most business wiring lives here, not in components.
- **Admin is cohesive and isolated** — it shares `lib` but has its own `components/admin` kit and its own route subtree; safe to evolve independently.
- **Motion + i18n are cross-cutting** via `hooks/*` and `lib/gsap` + `react-i18next`; the recent scroll-reveal fix lives at `hooks/useScrollReveal`, a 12-importer hub.
- No cluster-level cycles detected; the dependency direction is layered and clean.

## 9. Suggested next queries

- *Blast radius:* "what imports `lib/utils` / `lib/queries`?" before refactoring either.
- *Data flow:* trace `pages/CoachingPage → lib/queries → lib/supabase → schema.sql` (the coaching-visibility path we debugged).
- *Admin isolation:* confirm nothing under `pages/admin` is imported by public pages.
- *Dead-weight:* `data/*` static fallbacks vs live Supabase — candidates for pruning once DB content is guaranteed.

---
*Artifacts: `graphify-out/GRAPH_REPORT.md` (this) · `graph.html` (visual) · `graph.json` (nodes/edges). Structural-fallback — not native Graphify extraction.*
