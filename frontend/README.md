# Sahayak — Frontend (Next.js 14)

Production frontend client for Sahayak built with Next.js 14 (App Router), TypeScript, and Tailwind CSS.

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Configure environment (optional, defaults to http://localhost:8000)
cp .env.local.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. (The first build will download Google Fonts: Manrope, Inter, and IBM Plex Mono).

---

## 📂 Architecture & Directory Layout

```
frontend/
├── app/
│   ├── page.tsx                       # Landing page (hero, trust strip, feature preview)
│   ├── intake/page.tsx                # 3-step intake form with Web Speech API voice input & household members
│   ├── results/page.tsx               # Results dashboard, skeleton states, Passbook modal, CSC locator
│   ├── schemes/[id]/page.tsx          # Full scheme detail, YouTube video guide & document readiness checker
│   ├── layout.tsx, globals.css        # Fonts, theme variables, base styles, animations
├── components/
│   ├── csc-passbook-modal.tsx         # Printable A4 Passbook slip modal with QR code & checklist
│   ├── document-checklist.tsx         # Interactive required document checklist
│   ├── document-readiness-checker.tsx # Pre-flight document check + Aadhaar DBT bank linking
│   ├── eligibility-badge.tsx          # Seal badge for eligible / near-miss states
│   ├── language-switcher.tsx          # Dynamic language switcher (English, Hindi, Marathi)
│   ├── progress-stepper.tsx           # Stepper for 3-step demographic intake
│   ├── scheme-application-guide.tsx   # Step-by-step form filling guides + embedded YouTube player
│   ├── scheme-card.tsx                # Scheme card with benefit tag, gap explanation & action buttons
│   ├── seva-kendra-locator.tsx        # Seva Kendra & CSC finder with Google Maps routing
│   ├── site-header.tsx, theme-toggle.tsx
│   ├── voice-input-button.tsx         # Voice recording button with Web Speech API & sample prompts
│   └── ui/                            # Button, TextField, SelectField, ToggleRow primitives
└── lib/
    ├── api.ts                         # Typed API client connecting to FastAPI backend
    ├── language-context.tsx           # Multi-language dictionary and context (EN / HI / MR)
    ├── types.ts                       # TypeScript interfaces for schemes, profiles, matches, CSCs
    └── mock-data.ts                   # Fallback preview dataset
```

---

## 🎨 Design System

- **Palette**: Deep civic indigo/blue primary (`--primary-*`), emerald for eligible status, and amber for near-miss states. All defined as RGB-triplet CSS variables in `globals.css` for instant light/dark mode toggling.
- **Typography**: Manrope for display headings, Inter for body/UI, and IBM Plex Mono for benefit numbers and statistics.
- **Visual Accents**: Official citizen seal motif (`rounded-seal`), tear-off perforation divider (`.perforation`), and fluid entrance micro-animations (`animate-rise-in`, `animate-seal-stamp`, `shimmer`).
- **Accessibility**: Native `prefers-reduced-motion` support across all CSS keyframes and high-contrast color pairings.

---

## 🔗 Backend Connection

The frontend seamlessly connects to the FastAPI backend via `lib/api.ts`:

- Reads `process.env.NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000`).
- Calls `POST /api/profile` on intake form completion and routes to `/results?profileId=<uuid>`.
- Calls `GET /api/match/{profileId}?language=<lang>` on the results dashboard.
- Calls `POST /api/voice/parse-transcript` for AI speech-to-profile extraction.
- Calls `GET /api/seva-kendras` to fetch nearest Common Service Centres.
- Calls `GET /api/schemes/{scheme_id}` for scheme tutorials and YouTube application guides.
