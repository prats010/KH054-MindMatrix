# JanSahayak

**Autonomous Scheme-Bundle Optimizer for Citizens**  
*Built for PS16 — Kurukshetra Hackathon | Team KH054-MindMatrix*

JanSahayak is an AI-powered portal that helps Indian citizens discover, evaluate, and apply for government welfare schemes. It replaces confusing eligibility requirements and dense government gazettes with a simple, localized questionnaire and an advanced Multi-Agent LLM pipeline.

---

## Features

- **Multi-Agent AI Orchestration:** 5 specialized agents (Coordinator, Eligibility, Conflict, Document, Recommendation) running sequentially and in parallel to evaluate citizen profiles against 12+ Central Government schemes.
- **Goal-Based Strict Routing:** Citizens can select their primary goals (e.g., Business Funding, Medical Relief). The system uses strict pre-filtering to instantly discard irrelevant schemes, saving LLM tokens and ensuring hyper-relevant recommendations.
- **Retrieval-Augmented Generation (RAG):** Uses local text embeddings (`all-MiniLM-L6-v2`) to search a vector database of actual government gazettes before making eligibility decisions — reducing LLM hallucinations.
- **AI-Powered Web Scraper:** A Puppeteer + Groq headless crawler that scrapes any government website or news article and automatically extracts structured scheme data into the database.
- **Deterministic Document Matching:** Missing-document detection uses pure set-difference logic (not LLM), ensuring 100% accuracy with zero hallucinated requirements.
- **Rule-Based Pre-Filters:** Hard boolean/arithmetic checks (age, income, gender, farmer status, bereavement gates) run before any LLM call to save tokens and eliminate false matches.
- **Tri-Lingual Support:** Full interface and AI responses in English, Hindi, and Marathi.
- **Stateless & Private:** No user data is stored server-side. All state is managed client-side via `sessionStorage` until the final API evaluation. Income is bucketed before reaching the LLM — exact values are never sent.
- **Flat Classic Government UI:** High-contrast, WCAG-accessible, flat design system built in Vanilla CSS for maximum performance and official aesthetics.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js (App Router), React, Vanilla CSS |
| **Backend** | Node.js, Next.js API Routes |
| **AI / LLM** | Groq SDK → `openai/gpt-oss-120b` (primary), `openai/gpt-oss-20b` (fallback) |
| **Embeddings** | `@xenova/transformers` → `Xenova/all-MiniLM-L6-v2` (local, no API key) |
| **Vector DB** | Local JSON-based vector store with cosine similarity search |
| **Data Ingestion** | Puppeteer (headless Chrome scraper) + LLM extraction |
| **Localization** | Custom i18n Context with JSON translation files |

---

## Architecture

```
┌─────────────┐     POST /api/recommend      ┌──────────────────┐
│  Browser UI  │ ──────────────────────────▶  │  API Route       │
│  (Next.js)   │                              │  (route.js)      │
└─────────────┘                              └────────┬─────────┘
                                                      │
                                              ┌───────▼────────┐
                                              │  Coordinator   │
                                              │  Agent         │
                                              └───────┬────────┘
                                                      │
                                    ┌─────────────────┼─────────────────┐
                                    │                 │                 │
                              ┌─────▼─────┐   ┌──────▼──────┐  ┌──────▼──────┐
                              │ Eligibility│   │  Conflict   │  │  Document   │
                              │ Agent(RAG) │   │  Agent(LLM) │  │  Agent(Det) │
                              └─────┬─────┘   └──────┬──────┘  └──────┬──────┘
                                    │                 │                │
                                    └─────────────────┼────────────────┘
                                                      │
                                              ┌───────▼────────┐
                                              │ Recommendation │
                                              │ Agent          │
                                              └────────────────┘
```

---

## Setup & Installation

### 1. Clone & Install
```bash
git clone https://github.com/prats010/KH054-MindMatrix.git
cd KH054-MindMatrix
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the project root (see `.env.example`):
```env
GROQ_API_KEY=your_groq_api_key_here
```
Get your free Groq API key at [console.groq.com](https://console.groq.com).

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Advanced Usage

### AI Web Scraper
Automatically scrape a new scheme from any website and add it to the database:
```bash
node scripts/scrape.js <URL>
```
*Example:* `node scripts/scrape.js https://en.wikipedia.org/wiki/Stand-Up_India`

### Rebuild the RAG Vector Store
After adding new guideline files to `data/guidelines/`, regenerate embeddings:
```bash
node scripts/ingest.js
```

### Simulate Government API Sync
Test the data synchronization pipeline:
```bash
node scripts/sync-api.js
```

---

## Project Structure

```
jansahayak-app/
├── app/
│   ├── api/recommend/route.js    # API endpoint — triggers the AI pipeline
│   ├── page.js                   # Landing page
│   ├── profile/page.js           # 4-step eligibility questionnaire
│   ├── results/page.js           # Results dashboard
│   ├── layout.js                 # Root layout with footer
│   └── globals.css               # Flat Classic Gov design system
├── components/
│   └── Navbar.js                 # Navigation bar with language switcher
├── data/
│   ├── schemes.json              # Scheme database (12+ schemes)
│   ├── vector_store.json         # Pre-computed RAG embeddings
│   ├── guidelines/               # Markdown "gazette" files for RAG
│   └── i18n/                     # Translation files (en, hi, mr)
├── lib/
│   ├── agents/
│   │   ├── coordinator.js        # Pipeline orchestrator
│   │   ├── eligibility.js        # RAG-powered eligibility evaluation
│   │   ├── conflict.js           # Mutual exclusion detector
│   │   ├── document.js           # Deterministic missing-doc checker
│   │   └── recommendation.js     # Final bundle optimizer
│   ├── groq.js                   # LLM client with retry + fallback
│   ├── precheck.js               # Rule-based boolean pre-filters
│   ├── sanitize.js               # PII stripping + income bucketing
│   ├── apiSync.js                # Government API sync service
│   └── i18n.js                   # Localization context provider
└── scripts/
    ├── scrape.js                 # AI-powered Puppeteer web scraper
    ├── ingest.js                 # Vector store embedding generator
    └── sync-api.js               # Manual API sync trigger
```

---

## Future Scope

1. **API Setu Integration:** Replace the scraper with official Ministry APIs via `apisetu.gov.in` for real-time scheme metadata.
2. **DigiLocker Verification:** Auto-verify citizen documents against their DigiLocker account.
3. **Multi-lingual Voice Interface:** Enable voice-based input in regional dialects using Bhashini for illiterate citizens.
4. **State-Level Scheme Expansion:** Add crawlers for state portals (MahaDBT, SSP-UP, etc.) to cover 500+ state schemes.
5. **Cloud Vector DB:** Migrate from local JSON vector store to Pinecone/Qdrant for production-scale RAG.

---

## Deployment (Vercel)

1. Push your repository to GitHub.
2. Log into [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your GitHub repository.
4. In the Environment Variables section, add `GROQ_API_KEY`.
5. Click **Deploy**. Vercel auto-detects Next.js and deploys the AI pipeline.

*(Note: The Puppeteer scraper and `scripts/` are for local data-ingestion only. The Next.js API routes handle live user traffic on Vercel.)*

---

## AI Tools Used During Development

- **Google Antigravity** — Used to architect and generate the entire codebase including the multi-agent pipeline, RAG system, web scraper, and UI design system.
