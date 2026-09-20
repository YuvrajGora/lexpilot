# LexPilot

LexPilot is a GenAI-powered legal document navigation and analysis assistant that enables users to review, compare, navigate, and query complex contracts and legal texts with complete document-grounded traceability.

---

## What LexPilot Does

LexPilot guides users through five integrated stages of legal document intelligence:

1. **Analyze**: Upload contracts (PDF, DOCX, or TXT up to 10 MB) to extract structured legal terms—parties, important dates, financial commitments, key obligations, termination clauses, and items requiring attention.
2. **Compare**: Upload two agreements side-by-side to automatically detect modified, added, and removed provisions across standard categories with neutral diffing.
3. **Navigate**: Explore structured document sections with smooth scrolling, quick-jump anchors, and visual focus highlighting.
4. **Ask**: Query the document in natural language with guaranteed document-grounded responses, contextual suggested questions, and explicit confidence boundaries.
5. **Trace Evidence**: Verify every extracted claim, change, and answer against verbatim source text excerpts, section references, and clear grounding statuses (`directly_stated`, `not_specified`, or `insufficient_detail`).

---

## Chosen Challenge Vertical

LexPilot addresses the **"Legal Information & Basic Assistance"** vertical. It fits this vertical by helping users analyze, compare, navigate, and ask questions about user-provided legal documents using document-grounded AI.

---

## Assumptions

- LexPilot analyzes only documents provided by the user.
- Extracted text is assumed to represent the readable content of the uploaded document.
- LexPilot does not determine legal enforceability or jurisdiction-specific validity.
- Missing information is reported as **"Not specified in the document"** rather than inferred.
- LexPilot provides informational and educational assistance and does not replace a qualified legal professional.

---

## Features

- **Document Analysis**: Automated extraction of critical legal terms using Google Gemini with structured Pydantic schema validation.
- **Grounded Extraction**: Factual claims are tied directly to explicit contract text; absent information is marked as *"Not specified in the document."*
- **Document Comparison**: Dual-document comparison workspace supporting side-by-side alignment of agreements, amendments, and revisions.
- **Added, Removed & Modified Provisions**: Precise detection of provision changes with neutral descriptions and verbatim quotations from Document A and Document B.
- **Grounded Q&A ("Ask About This Document")**: Interactive query engine strictly confined to the uploaded document text, refusing speculative legal advice or external law extrapolation.
- **Document Navigation**: Interactive sidebar and header navigation for instant jumping between document overview, attention items, dates, financials, obligations, and termination clauses.
- **Evidence Traceability**: Every extracted data point includes a dedicated `SourceEvidence` record showing exact quote text, clause location, and section header.
- **Verbatim Source Quotations**: Visual `EvidenceViewer` component with collapsible text snippets, clause citations, and copyable citations.
- **Grounding Status Badges**: Clear visual indicators distinguishing directly stated provisions from omitted terms and items with insufficient detail.
- **Prompt Injection Defenses**: Rigorous prompt isolation treating all document contents and user questions as untrusted data, blocking prompt leakage and instruction overrides.

---

## Architecture

```text
User / Browser
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Client                        │
│            React 19 • TypeScript • Vite • Tailwind CSS       │
│  - DocumentUpload & Dual-Comparison Workspaces              │
│  - DocumentNavigator (smooth scroll & section anchors)      │
│  - EvidenceViewer (verbatim quotes & status badges)         │
│  - DocumentQA (suggested prompts & grounded answers)        │
└─────────────────────────────┬───────────────────────────────┘
                              │ HTTP / JSON & Multipart
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Node.js / Express Server                    │
│   (Port 3000 — Unified Reverse Proxy & Vite Static Host)    │
└─────────────────────────────┬───────────────────────────────┘
                              │ Reverse Proxy (/api/*)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     FastAPI Backend                         │
│               (Port 8001 — Python 3.11)                     │
│                                                             │
│  1. Validation Layer (extension, size, empty checks)        │
│  2. Text Extractor Service (pypdf, python-docx, UTF-8 TXT)  │
│  3. Security & Prompt Injection Boundary (untrusted data)   │
│  4. Gemini Service (google-genai SDK, structured prompts)   │
│  5. Pydantic v2 Schema Validation & Model Deserialization   │
│  6. SourceEvidence Normalization & Status Classification    │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
- **React 19** (`react`, `react-dom`)
- **TypeScript** (Strict type-checking)
- **Vite 8** (Build tool & development server)
- **Tailwind CSS v4** (Utility-first styling with `@tailwindcss/vite`)
- **Lucide React** (Interface icons)
- **Motion** (`motion/react` animations)

### Backend
- **Python 3.11**
- **FastAPI** (RESTful API framework)
- **Uvicorn** (ASGI server)
- **Pydantic v2** (Strict data validation and serialization)
- **Google GenAI SDK** (`google-genai` for Gemini API access)
- **pypdf** (PDF text extraction)
- **python-docx** (DOCX text and table parsing)
- **pytest & httpx** (Automated unit and integration testing)

### Host & Proxy
- **Express 4** with `http-proxy-middleware` and `tsx`
- **esbuild** (Production bundling of server runner)

---

## Project Structure

```text
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI application entry & CORS middleware
│   │   ├── models/
│   │   │   ├── analysis.py          # Pydantic models for single-document analysis
│   │   │   ├── comparison.py        # Pydantic models for document comparison
│   │   │   ├── evidence.py          # Unified SourceEvidence & EvidenceStatus models
│   │   │   └── qa.py                # Pydantic models for document Q&A
│   │   ├── routes/
│   │   │   ├── analyze.py           # POST /api/analyze route
│   │   │   ├── ask.py               # POST /api/ask route
│   │   │   └── compare.py           # POST /api/compare route
│   │   ├── services/
│   │   │   ├── ai_service.py        # Abstract AI service interface
│   │   │   ├── extractor_service.py # PDF, DOCX, and TXT parsing utilities
│   │   │   └── gemini_service.py    # Google GenAI service with strict system prompts
│   │   └── utils/
│   │       └── validation.py        # File type, size, and character validation
│   ├── requirements.txt             # Python backend dependencies
│   └── tests/                       # 47 automated pytest test cases
│       ├── test_api.py              # API endpoint integration tests
│       ├── test_ask.py              # Grounded Q&A tests & boundaries
│       ├── test_compare.py          # Document comparison & diff tests
│       ├── test_evidence.py         # Evidence attachment & verification tests
│       ├── test_extraction.py       # File extraction unit tests
│       ├── test_grounding.py        # Anti-hallucination & grounding prompt tests
│       ├── test_models.py           # Pydantic schema validation tests
│       └── test_validation.py       # File and input validation tests
├── public/                          # Static public assets
├── src/
│   ├── App.tsx                      # Main application component & tab coordinator
│   ├── main.tsx                     # React root mount
│   ├── index.css                    # Tailwind CSS entry point
│   ├── components/
│   │   ├── ComparisonResultsDashboard.tsx  # Side-by-side comparison diff view
│   │   ├── DocumentComparisonWorkspace.tsx # Dual file upload & sample selectors
│   │   ├── DocumentNavigator.tsx           # Sticky section jump navigation bar
│   │   ├── DocumentQA.tsx                  # Interactive Q&A chat panel
│   │   ├── DocumentUpload.tsx              # Single-document drag-and-drop uploader
│   │   ├── EvidenceViewer.tsx              # Traceable verbatim evidence viewer
│   │   ├── Footer.tsx                      # Application footer & legal disclaimer
│   │   ├── Header.tsx                      # App branding & navigation tabs
│   │   ├── LandingHero.tsx                 # Feature overview & workflow introduction
│   │   └── ResultsDashboard.tsx            # Single-document analysis report
│   ├── services/
│   │   └── api.ts                   # Client-side API client for FastAPI endpoints
│   └── types/                       # TypeScript interfaces aligned with Pydantic models
│       ├── analysis.ts
│       ├── comparison.ts
│       ├── evidence.ts
│       └── qa.ts
├── .env.example                     # Environment variable template
├── .gitignore                       # Git ignore configuration
├── index.html                       # HTML entry point with metadata & typography
├── package.json                     # Node.js dependencies & scripts
├── server.ts                        # Development & production full-stack server
├── tsconfig.json                    # TypeScript compiler configuration
└── vite.config.ts                   # Vite configuration
```

---

## API Endpoints

All endpoints are hosted by the backend and proxied through the Express server under the `/api` prefix:

| Method | Path | Description | Payload / Parameters |
|---|---|---|---|
| `GET` | `/api/health` | Service health status and Gemini configuration check | None |
| `POST` | `/api/analyze` | Analyzes a single legal document and extracts structured data with source evidence | `multipart/form-data` with `file` (PDF, DOCX, TXT, max 10 MB) |
| `POST` | `/api/compare` | Compares two legal documents and detects added, removed, and modified provisions | `multipart/form-data` with `file_a` and `file_b` (PDF, DOCX, TXT, max 10 MB each) |
| `POST` | `/api/ask` | Answers natural-language questions grounded strictly in the provided document text | `application/json` with `{ "document_text": string, "question": string }` |

---

## Grounding & Safety

LexPilot incorporates strict safeguards to guarantee accuracy, transparency, and safe AI usage:

1. **Document-Grounded Generation**: The Gemini model is instructed to act strictly on what is written in the contract text. It is forbidden from using external legal assumptions, jurisdiction rules, or unstated facts.
2. **Source Evidence**: Every critical fact (party identity, obligation, date, dollar amount, termination clause, or attention item) is paired with a `SourceEvidence` structure containing verbatim quotations and source location details.
3. **Handling of Missing Information**: If a provision is omitted from the contract, LexPilot explicitly returns `"Not specified in the document."` with `evidence_status: "not_specified"` rather than guessing.
4. **Anti-Hallucination & Anti-Fabrication**: Prompts explicitly forbid inventing section numbers, paragraph numbers, coordinates, or clause titles. If a heading does not exist in the source document, it is not fabricated.
5. **Prompt Injection Hardening**: All user inputs (uploaded files and Q&A questions) are quarantined as untrusted data. Embedded instructions attempting to override system rules, leak keys, or replace the task are ignored.
6. **No Subjective Scoring**: LexPilot deliberately avoids speculative "contract risk scores", letter grades, or biased ratings, presenting factual, neutral comparisons and observations.

---

## Testing

The backend includes a comprehensive automated test suite covering all functional modules:

```bash
# Run the full test suite via npm
npm run test:backend

# Or run pytest directly
python3 -m pytest backend/tests/ -v
```

### Test Coverage Summary:
- **`test_api.py`**: Health checks, upload validation, error responses, and mocked end-to-end analysis pipeline.
- **`test_ask.py`**: Q&A length limits, empty queries, prompt injection defense, and legal advice boundary enforcement.
- **`test_compare.py`**: Dual-file validation, added/removed/modified clause categorization, and prompt injection defense.
- **`test_evidence.py`**: `SourceEvidence` structure, synchronization between legacy text fields and evidence models, and rejected invalid statuses.
- **`test_extraction.py`**: TXT, PDF, DOCX text extraction and fallback encoding handling.
- **`test_grounding.py`**: System prompt verification, strict grounding rules, and termination clause grounding.
- **`test_models.py`**: Pydantic v2 schema serialization and deserialization.
- **`test_validation.py`**: File extension whitelisting, file size limits, empty file rejection, and text character minimums.

**Result**: 47 passed tests.

---

## Setup & Local Development

### Prerequisites
- **Node.js** (v18 or higher) & **npm**
- **Python** (v3.10 or v3.11) & `pip`
- A **Google Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/))

### 1. Clone the Repository
```bash
git clone https://github.com/YuvrajGora/lexpilot.git
cd lexpilot
```

### 2. Environment Variables
Create a local `.env` file from `.env.example`:
```bash
cp .env.example .env
```
Edit `.env` and set your Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Install Dependencies
Install Node.js packages:
```bash
npm install
```

Install Python backend dependencies:
```bash
pip install -r backend/requirements.txt
```

### 4. Run the Development Server
Launch the unified server (spawns both the FastAPI backend on port 8001 and the Express/Vite frontend on port 3000):
```bash
npm run dev
```
Open your browser at [http://localhost:3000](http://localhost:3000).

### 5. Run Tests and Quality Checks
```bash
# Run backend tests
npm run test:backend

# Run TypeScript type-checking
npm run lint

# Compile production build
npm run build
```

---

## Environment Variables

| Variable | Description | Required | Example |
|---|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API key used for document analysis, comparison, and Q&A | Yes | `AIzaSy...` (from Google AI Studio) |
| `APP_URL` | The public base URL where the application is hosted | Optional | `http://localhost:3000` |

*Note: Never commit real API keys or credentials to version control. Keep `.env` in `.gitignore`.*

---

## Disclaimer

> ⚠️ **Important Notice**:  
> LexPilot is an AI-powered document navigation and informational analysis tool. It is designed solely for educational and informational purposes and does **not** constitute formal legal advice, legal representation, or a substitute for consultation with a qualified legal professional. Always consult a qualified legal professional for advice about your specific situation.
