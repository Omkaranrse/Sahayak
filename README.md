# Sahayak — Government Scheme Eligibility Assistant

A full-stack app that matches a user's profile against verified government
scheme eligibility rules and explains the result in plain language.

```
sahayak/
├── frontend/          Next.js 14 (App Router) + TypeScript + Tailwind
├── backend/            FastAPI + PostgreSQL + Groq
└── docker-compose.yml  Runs all three together
```

## Quickest way to run it: Docker Compose

```bash
cp backend/.env.example backend/.env
# open backend/.env and add your Groq API key (optional — see note below)

docker compose up --build
```

- Frontend: http://localhost:3000
- Backend docs (Swagger UI): http://localhost:8000/docs
- Postgres: localhost:5432 (user/pass/db: `sahayak`)

The backend seeds its 8 curated schemes into Postgres automatically on
startup (`app/seed.py` runs before `uvicorn` in the Dockerfile).

**No Groq key?** The app still works — `llm.py` falls back to a plain
template sentence per scheme instead of an LLM-generated explanation. Get a
free key at https://console.groq.com if you want the real explanations.

## Running without Docker

**Backend** (needs a local or remote Postgres instance):

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # edit DATABASE_URL to point at your Postgres
python -m app.seed     # creates tables + loads schemes.json
uvicorn app.main:app --reload
```

**Frontend:**

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

## How the pieces fit together

1. **Intake** (`frontend/app/intake`) — 3-step form. On submit, `lib/api.ts`
   POSTs the profile to `backend`'s `/api/profile`, which returns a
   `profile_id`.
2. **Matching** (`backend/app/matching.py`) — a deterministic rules engine,
   not an LLM, decides eligibility. Every scheme's `eligibility_rules` (JSONB
   in Postgres) is checked field-by-field against the profile. This is
   intentional: eligibility has real financial consequences, so the decision
   should never be left to a model that can hallucinate a criterion.
3. **Explanation** (`backend/app/llm.py`) — only *after* eligibility is
   decided, Groq is asked to explain the result in plain language (batched
   into one call for all eligible matches). The prompt explicitly forbids
   inventing criteria.
4. **Results** (`frontend/app/results`) — fetches `/api/match/{profile_id}`,
   shows a skeleton loading state, then splits results into "You're
   eligible" and "Almost there" (near-misses), each with a live gap reason
   like *"Your income is ₹50,000 over the eligible limit."*
5. **Scheme detail** (`frontend/app/schemes/[id]`) — fetches
   `/api/schemes/{id}` directly, with a tappable document checklist.

## The scheme dataset

`backend/app/seed_data/schemes.json` currently has 8 real, curated central
+ Maharashtra-state schemes with structured `eligibility_rules` (see
`backend/app/models.py` for the JSONB shape). Adding a scheme means adding
one JSON object and re-running `python -m app.seed` (it upserts by
`scheme_id`, safe to re-run). This file — not the code — is where most of
the ongoing effort for a real product would go.

## API reference

| Method | Path                    | Purpose                                   |
|--------|-------------------------|--------------------------------------------|
| GET    | `/api/health`           | Liveness check                            |
| GET    | `/api/schemes`          | List all seeded schemes                   |
| POST   | `/api/profile`          | Create a profile, returns `{ id }`        |
| GET    | `/api/match/{id}`       | Run matching for a profile → eligible/near-miss lists |
| GET    | `/api/schemes/{scheme_id}` | Full detail for one scheme             |

Full interactive docs at `/docs` once the backend is running (FastAPI
auto-generates this from `schemas.py`).

## What's stubbed / left for you to extend

- **Application status tracking** — not implemented. Most scheme portals
  don't expose a public status API; see the original design discussion for
  why this is scoped out of the MVP.
- **Regional-language scheme content** — the UI chrome (nav, buttons) is
  translated via `frontend/lib/language-context.tsx`; the `language` query
  param is already wired through to `/api/match` so Groq generates
  explanations in Hindi/Marathi, but full scheme-name/document translation
  would need a dedicated pass (e.g. Bhashini).
- **Auth** — profiles are anonymous (`session_id` field exists on
  `UserProfile` for you to wire up a real session later).
