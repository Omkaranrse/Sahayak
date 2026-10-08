# 🇮🇳 Sahayak (सहायक) — Government Scheme & Household Welfare Maximizer

[![Next.js](https://img.shields.io/badge/Next.js-14_App_Router-black?style=flat&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Groq AI](https://img.shields.io/badge/Groq-LLaMA_3.3_/_3.1-f55036?style=flat)](https://groq.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> A production-grade Civic Tech platform that deterministically matches Indian citizens and households against verified central and state government schemes, explains eligibility in plain regional language using Groq LLMs, generates printable CSC passbooks, and connects citizens directly to nearby Seva Kendras.

---

## 🌟 Key Features

### 1. 🎯 Deterministic Rules Engine (Zero Hallucinations)
- Eligibility decisions are strictly evaluated using a field-by-field Boolean logic rules engine against PostgreSQL JSONB criteria (`backend/app/matching.py`).
- **Critical Civic Tech Design**: Eligibility has financial consequences. An LLM is **never** used to decide whether a citizen qualifies; it is only utilized *afterwards* to synthesize plain-language explanations.

### 2. 👨‍👩‍👧‍👦 Household Welfare Maximizer
- Moves beyond single-applicant assessments to maximize aggregate benefits across the whole family.
- Evaluate household members (e.g., daughters, sons, elderly parents, spouses).
- Computes aggregated household welfare (e.g., **₹5.30 Lakh/year**) and attributes individual entitlements per family member (e.g., Sukanya Samriddhi for a daughter, Old Age Pension for a parent, PM-KISAN for a farmer).

### 3. 🎙️ Multilingual Voice-Driven Demographic Intake
- Citizens and CSC operators can speak naturally in **Hindi**, **Marathi**, or **English**.
- Powered by the Web Speech API and Groq AI voice parsing (`backend/app/llm.py`) with intelligent regex heuristics fallback when offline.

### 4. 🤖 Plain-Language AI Explanations
- Explains qualifying reasons with compassion and clarity using Groq (LLaMA 3.3 70B / LLaMA 3.1 8B).
- Fully localized in English, Hindi, and Marathi (`language` parameter).
- **Graceful Fallback**: If no Groq API key is configured, an automatic deterministic template explanation is rendered without crashing.

### 5. 🌉 Near-Miss Gap Analysis & Bridge Recommendations
- Citizens who narrowly miss eligibility criteria receive actionable explanations (e.g., *"Your income is ₹50,000 over the eligible limit"*).
- Provides practical bridge recommendations (e.g., applying for an official income certificate via the local Tahsildar office).

### 6. 🖨️ Printable CSC Citizen Passbook / Slip
- Generates a print-ready A4 passbook slip with QR verification code and personalized document checklist.
- Optimized for Common Service Centre (CSC) village-level entrepreneurs (VLEs) and offline citizen filing.

### 7. 💬 One-Click WhatsApp Advisory Share
- Instantly share a pre-formatted eligibility report, benefit values, and required paperwork checklist to WhatsApp.

### 8. 📍 Maha e-Seva & CSC Kendra Locator
- Built-in directory of verified citizen service centres searchable by PIN code, city, or state with one-click Google Maps navigation routing.

### 9. ✅ Document Readiness & DBT Pre-Check
- Interactive document checklist with an Aadhaar-Bank DBT linking readiness checker to verify paperwork before visiting government offices.

### 10. 📹 Form Filling Guides & Official YouTube Video Tutorials
- Every scheme includes curated step-by-step application instructions and embedded official video tutorials (`backend/app/tutorials.py`).

### 11. 🛡️ Production Security & Resilience
- **UUID-based profile IDs**: Prevents IDOR (Insecure Direct Object Reference) vulnerabilities.
- **SlowAPI Rate Limiting**: Protects intake and voice parsing endpoints from abuse.
- **Lifespan Auto-Seeding**: Automatic table migration and scheme dataset upsert on server startup (`backend/app/seed.py`).
- **Postgres URL Normalization**: Automatically normalizes legacy `postgres://` URLs to `postgresql://` for Render/Railway compatibility.

---

## 🏗️ Architecture

```mermaid
graph TD
    User([Citizens / CSC Operators]) -->|HTTPS| Web[Next.js 14 App Router\nTypeScript + Tailwind CSS]
    Web -->|REST API & JSON| API[FastAPI Backend\nPython 3.12]
    API -->|Deterministic Matching| Rules[Rules Engine\nmatching.py]
    API -->|SQLAlchemy| DB[(PostgreSQL Database\nSchemes & User Profiles)]
    API -.->|Async Non-Blocking| Groq[Groq AI Cloud\nLLaMA 3.3 / Voice Parser]
    Web -->|Print Slip / WhatsApp| CSC[Common Service Centres / WhatsApp]
```

---

## 📂 Repository Structure

```
sahayak/
├── frontend/                   # Next.js 14 App Router, TypeScript, Tailwind CSS
│   ├── app/
│   │   ├── page.tsx            # Modern civic landing page with trust markers
│   │   ├── intake/page.tsx     # 3-step intake form + voice input + household members
│   │   ├── results/page.tsx    # Welfare dashboard, CSC passbook modal, Seva Kendra locator
│   │   └── schemes/[id]/page.tsx # Detailed scheme guide, video tutorial, document checker
│   ├── components/             # Reusable UI components (Passbook modal, locator, stepper)
│   ├── lib/                    # API client, types, multilingual dictionary (EN/HI/MR)
│   └── vercel.json             # Vercel deployment configuration
├── backend/                    # FastAPI, PostgreSQL, SQLAlchemy, Groq AI
│   ├── app/
│   │   ├── main.py             # Application routes, lifespan, rate limiting, CORS
│   │   ├── matching.py         # Deterministic matching & household welfare maximizer
│   │   ├── llm.py              # Groq integration & voice transcript parsing
│   │   ├── models.py           # SQLAlchemy database models (UUID primary keys)
│   │   ├── schemas.py          # Pydantic v2 validation schemas
│   │   ├── seed.py             # Database seed runner (safe upsert)
│   │   ├── seed_data/          # schemes.json dataset
│   │   ├── seva_kendras.py     # Verified CSC / Maha e-Seva Kendra directory
│   │   └── tutorials.py        # Curated step-by-step guides & YouTube tutorials
│   ├── requirements.txt        # Python dependencies
│   ├── entrypoint.sh           # Container entrypoint (seed + uvicorn)
│   └── Dockerfile              # Backend container image
├── DEPLOYMENT.md               # Complete Vercel + Render / Railway deployment guide
├── docker-compose.yml          # Local multi-container development environment
└── render.yaml                 # Render Infrastructure-as-Code Blueprint
```

---

## ⚡ Quickstart

### Option 1: Docker Compose (Recommended)

Run the entire stack (PostgreSQL + FastAPI + Next.js) with a single command:

```bash
# 1. Clone repository
git clone https://github.com/<your-username>/sahayak.git
cd sahayak

# 2. Configure backend environment
cp backend/.env.example backend/.env
# (Optional: Add your GROQ_API_KEY to backend/.env)

# 3. Spin up all services
docker compose up --build
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API Docs (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Alternative Docs (ReDoc)**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Postgres Database**: `localhost:5432` (`sahayak` / `sahayak`)

> **Note**: Database tables are automatically initialized and schemes are seeded into PostgreSQL on startup via FastAPI's lifespan event.

---

### Option 2: Running Locally without Docker

#### 1. Backend Setup

Prerequisites: Python 3.11+ and PostgreSQL.

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env to set your DATABASE_URL and optional GROQ_API_KEY

# Seed database with schemes
python -m app.seed

# Start the FastAPI server
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup

Prerequisites: Node.js 18+.

```bash
cd frontend

# Install packages
npm install

# Configure environment variables
cp .env.local.example .env.local

# Start Next.js development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | **Yes** | `postgresql://sahayak:sahayak@localhost:5432/sahayak` | PostgreSQL connection string |
| `GROQ_API_KEY` | No | `""` | Groq Cloud API key for LLaMA 3.3 explanations & voice parsing |
| `GROQ_MODEL` | No | `llama-3.1-8b-instant` | Groq model identifier |
| `CORS_ORIGINS` | No | `http://localhost:3000,https://*.vercel.app` | Allowed CORS origins (comma-separated or JSON array) |

### Frontend (`frontend/.env.local`)

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | No | `http://localhost:8000` | Target FastAPI backend URL (no trailing slash) |

---

## 📡 API Reference

| Method | Endpoint | Description | Rate Limit |
| :--- | :--- | :--- | :---: |
| `GET` | `/` | Service health status and available endpoints summary | — |
| `GET` | `/api/health` | Service liveness, PostgreSQL ping, and LLM configuration check | — |
| `GET` | `/api/schemes` | Returns list of all seeded government schemes with tutorial metadata | — |
| `GET` | `/api/schemes/{scheme_id}` | Detailed scheme metadata, step-by-step guides & video tutorial | — |
| `POST` | `/api/profile` | Registers a citizen profile & household members; returns a secure UUID | 15 / min |
| `GET` | `/api/match/{profile_id}` | Runs deterministic engine + household welfare maximizer + Groq explanation | — |
| `POST` | `/api/voice/parse-transcript` | Extracts structured demographic profile from spoken voice text | 20 / min |
| `GET` | `/api/seva-kendras` | Searches nearby CSC / Maha e-Seva centres by query, pincode, or state | — |
| `GET` | `/docs` | Interactive Swagger UI documentation | — |

---

## 📊 Curated Government Schemes Dataset

The platform comes pre-loaded with verified, high-impact Central and State schemes in `backend/app/seed_data/schemes.json`:

1. **PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)** — ₹6,000/yr direct income support for farmers.
2. **Ayushman Bharat (PM-JAY)** — ₹5,00,000/yr cashless healthcare protection per family.
3. **Pradhan Mantri Ujjwala Yojana 2.0** — Free LPG connection and stove for women from low-income families.
4. **National Social Assistance Programme (NSAP Old Age Pension)** — Monthly pension for senior citizens.
5. **PMEGP (Prime Minister's Employment Generation Programme)** — Up to 35% subsidy on business project loans.
6. **Sukanya Samriddhi Yojana** — High-interest long-term savings scheme for girl children (up to age 10).
7. **National Disability Pension Scheme** — Monthly direct financial support for divyang citizens.
8. **Maharashtra BOCW Worker Welfare Scheme** — Health, education scholarships, and accident cover for construction workers.

To add new schemes, simply append a scheme definition to `backend/app/seed_data/schemes.json` and run `python -m app.seed`.

---

## 🚀 Production Deployment

Sahayak is built to deploy easily to production:

- **Frontend**: Deployed to [Vercel](https://vercel.com) (Edge CDN with automated Next.js optimization).
- **Backend**: Deployed to [Render](https://render.com) (using [`render.yaml`](./render.yaml)) or [Railway](https://railway.app) (using [`railway.json`](./railway.json)).
- **Database**: Managed PostgreSQL instance with automatic lifespan migrations.

For complete step-by-step deployment instructions, refer to **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

---

## 🧪 Testing

Run backend tests using `pytest`:

```bash
cd backend
source venv/bin/activate
pytest tests/ -v
```

---

## 🤝 Contributing

Contributions to expand scheme coverage across all Indian states, add regional languages, or enhance VLE tooling are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-scheme`)
3. Commit your changes (`git commit -m 'feat: add Karnataka Yuva Nidhi scheme'`)
4. Push to the branch (`git push origin feature/new-scheme`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
