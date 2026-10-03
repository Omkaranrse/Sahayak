# Sahayak — Government Scheme Eligibility Assistant

Frontend built with Next.js 14 (App Router) + TypeScript + Tailwind CSS.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. (First build needs internet access once, to fetch
Manrope / Inter / IBM Plex Mono from Google Fonts via `next/font`.)

## What's here

```
app/
  page.tsx                landing page (hero, trust strip, how-it-works, preview)
  intake/page.tsx          3-step profile form with validation + stepper
  results/page.tsx         skeleton loading state -> eligible / near-miss sections
  schemes/[id]/page.tsx     full scheme detail + document checklist
  layout.tsx, globals.css  fonts, design tokens, base styles
components/
  site-header.tsx, language-switcher.tsx, theme-toggle.tsx
  progress-stepper.tsx, scheme-card.tsx, eligibility-badge.tsx, document-checklist.tsx
  ui/button.tsx, ui/field.tsx   (TextField, SelectField, ToggleRow)
lib/
  types.ts                 shared TS types (Scheme, ProfileData, MatchResult)
  mock-data.ts              placeholder scheme data — swap for your FastAPI backend
  language-context.tsx      EN / HI / MR translation dictionary + provider
```

## Design system

- **Palette**: deep indigo/blue primary (`--primary-*`), emerald for eligible states,
  amber for near-miss states — all defined as RGB-triplet CSS variables in
  `globals.css` so light/dark mode is a single class toggle (`.dark` on `<html>`).
- **Type scale**: Manrope for display/headline, Inter for body/UI, IBM Plex Mono
  for stats and numbers — see `fontSize` in `tailwind.config.ts`.
- **Signature motif**: a stamp/seal shape (`rounded-seal`) used for the
  `EligibilityBadge`, and a dotted "perforation" divider (`.perforation` in
  `globals.css`) referencing the tear-off paper forms this product replaces.
- **Motion**: `animate-rise-in` (staggered card entrance), `animate-seal-stamp`
  (badge reveal), `.shimmer` (skeleton loaders) — all respect
  `prefers-reduced-motion`.

## Wiring up the real backend

Everything currently reads from `lib/mock-data.ts`. To connect the FastAPI
backend described earlier in this project:

1. Replace the `mockMatches` import in `app/results/page.tsx` with a fetch to
   `GET /api/match/{profile_id}`.
2. In `app/intake/page.tsx`, on final submit, `POST` the `ProfileData` object to
   `/api/profile`, then route to `/results?profileId=<id>` instead of `/results`.
3. `lib/types.ts` already mirrors the Postgres/Pydantic shape from the backend
   plan, so field names should line up directly.

## Notes

- No `localStorage`/browser storage is used for user profile data — only the
  theme preference (light/dark) is persisted locally.
- The language switcher currently translates hero/nav copy as a proof of
  concept; wire it to Bhashini/Google Translate for full scheme-content
  translation.
