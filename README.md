# estima-sk

Standalone Estima web for the Slovak market. Next.js 14 (App Router) +
TypeScript + Tailwind, Slovak-first with an EN toggle, prices in EUR.

## Pages

- `/` — landing (hero, features, regional price levels)
- `/odhad` — indicative price estimate by kraj / type / condition / area
- `/kupa-alebo-prenajom` — buy-vs-rent calculator (30-year wealth simulation)
- `/cennik` — plans (Basic / Pro / Invest) + Estima API tiers

## Commands

```bash
npm install
npm run dev      # dev server on :3000
npm run build    # production build (includes type checking)
npm run lint
```

## Status & honest limitations

- The `/odhad` estimate is **indicative only**: it multiplies 2024 per-kraj
  average €/m² (NBS-derived, see `lib/market.ts`) by coarse type/condition
  factors. It is not a valuation model. The real Estima Engine for SK needs
  accumulated Slovak listing data first.
- No backend, no accounts, no billing — pricing CTAs route to e-mail.
- `data/` is reserved for Slovak scraper datasets (see `data/README.md`).

## Relationship to sibling repos

Deliberately standalone from `estima-frontend` (byteval, CZ market). Shared
code (`lib/buyVsRent.ts`, `components/ui/*`) was copied, not linked — if a bug
is fixed in one repo, port it to the other manually.
