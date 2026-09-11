# JanSahayak

**Autonomous Scheme-Bundle Optimizer for Citizens**  
*Built for the PS16 Kurukshetra Hackathon*

JanSahayak is an AI-powered portal designed to help citizens discover, evaluate, and apply for government schemes. It replaces confusing eligibility requirements and massive government gazettes with a simple, localized questionnaire and an advanced Multi-Agent LLM architecture.

## Features

- **Multi-Agent Orchestration:** Utilizes 4 specialized AI Agents (Eligibility, Conflict, Document, and Recommendation) running sequentially and in parallel to evaluate user profiles.
- **Retrieval-Augmented Generation (RAG):** Instead of relying purely on hardcoded boolean logic, the system uses local text embeddings to "read" actual legal guidelines before making eligibility decisions.
- **AI-Powered Web Scraper:** Includes a Puppeteer + Groq headless crawler that can scrape messy government websites and automatically extract structured JSON data to keep the database up to date.
- **Stateless MVP Architecture:** Built with privacy in mind. No user data is saved to a server. All state is managed client-side until the final API evaluation.
- **Flat Classic Gov UI:** Highly accessible, high-contrast, flat design system built in Vanilla CSS for maximum performance and official aesthetics.

## Tech Stack

- **Frontend:** Next.js (App Router), React, Vanilla CSS
- **Backend:** Node.js, Next.js API Routes
- **AI / ML:** Groq SDK (`openai/gpt-oss-120b`), `@xenova/transformers` (`all-MiniLM-L6-v2` for local embeddings)
- **Data Ingestion:** Puppeteer (Headless Browser Scraping)

## Setup & Installation

### 1. Install Dependencies
```bash
cd jansahayak-app
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root of the `jansahayak-app` directory and add your API keys. (See `.env.example` for reference).
```env
GROQ_API_KEY=your_actual_groq_api_key_here
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Advanced Features

### Run the AI Web Scraper
To automatically scrape a new scheme from a website and add it to your local database:
```bash
node scripts/scrape.js <URL_TO_SCRAPE>
```
*Example:* `node scripts/scrape.js https://en.wikipedia.org/wiki/Stand-Up_India`

### Ingest Guidelines for RAG
If you add new markdown files to `data/guidelines/`, you must rebuild the local vector store:
```bash
node scripts/ingest.js
```
