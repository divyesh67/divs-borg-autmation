# Implementation Plan: Lead Automation MVP

**Branch**: `001-lead-automation-mvp` | **Date**: 2026-04-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-lead-automation-mvp/spec.md`

## Summary

Build a working lead automation system for the Borg Hybrid Technical Test that demonstrates end-to-end orchestration: a React form captures leads, Power Automate processes them through enrichment (Abstract API) and AI classification (OpenAI), stores everything in SharePoint, sends Outlook notifications, and a React dashboard displays the full pipeline state. The React app uses shadcn-admin (Vite) as a base template, stripped to essentials.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Node 20+ (for dev tooling only)
**Primary Dependencies**: Vite, TanStack Router, TanStack Table, shadcn/ui, React Hook Form, Zod, Tailwind CSS, Recharts (for stats), Lucide React (icons)
**Storage**: SharePoint List (Microsoft 365) — accessed via Power Automate HTTP triggers
**Testing**: Manual testing + Playwright for end-to-end smoke test (optional)
**Target Platform**: Web browser (desktop primary, responsive is nice-to-have)
**Project Type**: Web application (SPA) + Power Automate cloud flows (no-code, portal-built)
**Performance Goals**: Lead processed end-to-end within 2 minutes of form submission
**Constraints**: No backend server. No authentication. 3-5 day timeline. Demo-first design.
**Scale/Scope**: <100 leads/day. 2 pages (form + dashboard). 2 Power Automate flows. 1 SharePoint List.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Microsoft-First | ✅ PASS | Power Automate owns orchestration. SharePoint is system of record. Outlook delivers notifications. React is visibility layer only. |
| II. Event-Driven Workflow | ✅ PASS | Form POST triggers PA flow automatically. No manual scripts. Each stage is a discrete scope in the flow. |
| III. AI as Operational Component | ✅ PASS | OpenAI returns structured JSON (category + summary). Result stored in SharePoint. Category influences notification subject line ("HOT LEAD"). |
| IV. Observability & Traceability | ✅ PASS | StepHistory JSON tracks all stages with timestamps. Dashboard shows visual timeline. Error states surfaced with ErrorFlag. |
| V. Simplicity & Feasibility | ✅ PASS | No auth, no backend, no Graph API. Direct form-to-PA POST. PA flow serves dashboard data. Minimal viable architecture. |

**Constitution deviation (documented per governance rules):**

| Deviation | Why Accepted | Constitution Ref |
|-----------|-------------|-----------------|
| No backend API boundary | Brief doesn't require security. PA trigger URL in frontend is acceptable for demo. Saves ~30 min build time. | Principle V overrides the Tech Constraints section's "thin API layer" recommendation |
| No MSAL/Entra ID auth | Brief doesn't mention auth. Removing it saves ~60 min setup and eliminates the #1 risk of demo failure (identity provider issues). | Principle V: "YAGNI applies" |
| Outlook only (no Teams) | Teams not available in tenant. Brief says "Outlook OR Teams" — one is sufficient. | Principle I: "Teams and/or Outlook" — satisfied with Outlook |

## Project Structure

### Documentation (this feature)

```text
specs/001-lead-automation-mvp/
├── plan.md              # This file
├── research.md          # Phase 0: technology research
├── data-model.md        # Phase 1: SharePoint schema + lead entity
├── quickstart.md        # Phase 1: setup & run instructions
├── contracts/           # Phase 1: API contracts
│   ├── pa-trigger.md    # Power Automate HTTP trigger contract
│   ├── pa-data-api.md   # Power Automate data API contract
│   ├── glm-api.md       # OpenAI AI request/response
│   ├── abstract-api.md  # Abstract API enrichment request/response
│   └── outlook-email.md # Outlook notification format
├── architecture.md      # Architecture diagrams (already created)
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
app/                              # React app (cloned from shadcn-admin)
├── src/
│   ├── components/
│   │   ├── layout/               # App shell (sidebar, header) — from shadcn-admin
│   │   ├── ui/                   # shadcn/ui components — from shadcn-admin
│   │   ├── lead-table/           # Lead list table (TanStack Table)
│   │   │   ├── columns.tsx       # Column definitions with badges
│   │   │   ├── data-table.tsx    # Table component
│   │   │   └── toolbar.tsx       # Filter bar (temperature, status)
│   │   ├── lead-detail/          # Sheet slide-out content
│   │   │   ├── lead-sheet.tsx    # Sheet wrapper
│   │   │   ├── submission-card.tsx
│   │   │   ├── enrichment-card.tsx
│   │   │   ├── ai-output-card.tsx
│   │   │   └── processing-timeline.tsx  # Vertical stepper
│   │   ├── lead-form/            # Lead submission form
│   │   │   ├── lead-form.tsx     # Form with RHF + Zod
│   │   │   └── success-animation.tsx
│   │   ├── stats/                # Dashboard metric cards
│   │   │   └── stats-cards.tsx   # 4 metric cards
│   │   └── empty-state/          # Illustrated empty state
│   │       └── empty-state.tsx
│   ├── features/
│   │   ├── dashboard/            # Dashboard page
│   │   │   └── index.tsx
│   │   └── submit/               # Submit form page
│   │       └── index.tsx
│   ├── lib/
│   │   ├── api.ts                # Fetch functions (call PA flows)
│   │   ├── types.ts              # Lead type definitions
│   │   └── utils.ts              # Helpers (from shadcn-admin)
│   ├── config/
│   │   └── constants.ts          # PA flow URLs, branding config
│   └── routes/                   # TanStack Router file-based routes
│       ├── __root.tsx
│       ├── index.tsx             # → redirect to /dashboard
│       ├── dashboard.tsx         # Dashboard layout + page
│       └── submit.tsx            # Form page (standalone + sidebar)
├── public/
│   └── illustrations/            # Empty state SVG
├── .env                          # PA flow URLs (not secrets for demo)
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts

.specify/                         # Speckit project files
.env                              # API keys (gitignored)
.env.example                      # Template
.gitignore
```

**Structure Decision**: Single React SPA in `/app` folder within the monorepo. No backend server. Power Automate flows are built in the Microsoft portal following the blueprint in this plan. SharePoint List is created manually in the SharePoint portal.

## Power Automate Flow #1: Lead Processing Pipeline

### Trigger
**"When an HTTP request is received"** (POST)

JSON Schema:
```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "company": { "type": "string" },
    "email": { "type": "string" },
    "message": { "type": "string" }
  },
  "required": ["name", "company", "email", "message"]
}
```

### Scope Architecture

```
TRIGGER: When an HTTP request is received (POST)
│
├── SCOPE: 1. Create SharePoint Record
│   ├── Compose: extract email domain (split('@')[1])
│   ├── Compose: initialise stepHistory JSON array
│   ├── SharePoint: Create item
│   │   - Title = triggerBody()?['name']
│   │   - All submission fields
│   │   - ProcessingStatus = "Received"
│   │   - StepHistory = [{"stage":"Received","ts":"utcNow()","status":"success"}]
│   └── Compose: save item ID for later updates
│
├── SCOPE: 2. Call Enrichment (with error handling)
│   ├── HTTP GET: https://companyenrichment.abstractapi.com/v1/
│   │   ?api_key=<key>&domain=<email_domain>
│   │   Retry policy: exponential, 2 attempts
│   ├── Parse JSON: enrichment response
│   ├── SharePoint: Update item
│   │   - EnrichmentCompany, EnrichmentIndustry, EnrichmentEmployees, EnrichmentLocation
│   │   - EnrichmentStatus = "Complete"
│   │   - ProcessingStatus = "Enriched"
│   │   - Append to StepHistory
│   │
│   └── [Run-after: failed/timed-out]
│       ├── SharePoint: Update item
│       │   - EnrichmentStatus = "Failed"
│       │   - ErrorFlag = true
│       │   - ErrorSummary = "Enrichment API failed"
│       │   - Append error to StepHistory
│       └── (pipeline continues)
│
├── SCOPE: 3. Run AI Classification (with error handling)
│   ├── Compose: build prompt with message + enrichment data
│   ├── HTTP POST: https://api.openai.com/v1/chat/completions
│   │   Headers: Authorization: Bearer <openai_key>
│   │   Body: {
│   │     "model": "gpt-5.4-mini",
│   │     "messages": [
│   │       {"role":"system","content":"<classification prompt>"},
│   │       {"role":"user","content":"<lead data>"}
│   │     ],
│   │     "temperature": 0.3
│   │   }
│   │   Retry policy: exponential, 2 attempts
│   ├── Parse JSON: AI response → extract category + summary
│   ├── SharePoint: Update item
│   │   - AICategory = parsed category (hot/warm/cold)
│   │   - AISummary = parsed summary
│   │   - ProcessingStatus = "AI Processed"
│   │   - Append to StepHistory
│   │
│   └── [Run-after: failed/timed-out]
│       ├── SharePoint: Update item
│       │   - AICategory = "unknown"
│       │   - AISummary = "AI classification unavailable"
│       │   - ErrorFlag = true
│       │   - Append error to StepHistory
│       └── (pipeline continues)
│
├── SCOPE: 4. Send Outlook Notification
│   ├── Condition: AICategory equals "hot"
│   │   Yes → subject = "🔴 HOT LEAD: <name> from <company>"
│   │   No  → subject = "New Lead: <name> from <company>"
│   ├── Office 365 Outlook: Send an email (V2)
│   │   To: <configured recipient>
│   │   Subject: <dynamic subject>
│   │   Body (HTML):
│   │     Lead name, company, email
│   │     AI Category + Summary
│   │     Enrichment data
│   │     Link to SharePoint item
│   ├── SharePoint: Update item
│   │   - NotificationStatus = "Sent"
│   │   - ProcessingStatus = "Notified"
│   │   - Append to StepHistory
│   │
│   └── [Run-after: failed]
│       ├── SharePoint: Update item
│       │   - NotificationStatus = "Failed"
│       │   - ErrorFlag = true
│       │   - Append error to StepHistory
│       └── (no further steps)
│
├── SCOPE: 5. Finalize
│   ├── SharePoint: Update item
│   │   - ProcessingStatus = "Complete"
│   │   - Append final entry to StepHistory
│   └── Response: 200 OK { "status": "processed", "id": <item_id> }
│
└── [Run-after: any scope fails catastrophically]
    └── Response: 500 { "status": "error", "message": <error> }
```

### AI System Prompt (for OpenAI)

```
You are a lead classification assistant. Analyse the following lead
submission and enrichment data, then return a JSON object with exactly
these fields:

{
  "category": "hot" | "warm" | "cold",
  "summary": "1-2 sentence intent summary"
}

Classification rules:
- HOT: Clear buying intent, specific product/service request, urgency
- WARM: General interest, exploring options, no urgency
- COLD: Vague inquiry, spam-like, no clear business intent

Return ONLY valid JSON, no markdown, no explanation.
```

## Power Automate Flow #2: Dashboard Data API

### Trigger
**"When an HTTP request is received"** (GET)

### Logic
```
TRIGGER: When an HTTP request is received (GET)
│
├── SharePoint: Get items
│   - Site: <your site>
│   - List: Leads
│   - Order by: Created desc
│   - Top count: 100
│
├── Select: Map SharePoint items to clean JSON
│   - Map each field to a frontend-friendly name
│   - Parse StepHistory from string to JSON
│
└── Response: 200 OK
    - Headers: Content-Type: application/json
    - Body: { "leads": [<mapped items>] }
    - CORS: Access-Control-Allow-Origin: *
```

## SharePoint List: "Leads"

| Column | SP Type | Default | Purpose |
|--------|---------|---------|---------|
| Title | Single line text | — | Lead name (required by SP) |
| Company | Single line text | — | Submitted company |
| Email | Single line text | — | Submitter email |
| Message | Multiple lines text | — | Lead message |
| EmailDomain | Single line text | — | Extracted from email |
| ProcessingStatus | Choice | Received | Received/Enriched/AI Processed/Notified/Complete/Error |
| EnrichmentCompany | Single line text | — | From Abstract API |
| EnrichmentIndustry | Single line text | — | From Abstract API |
| EnrichmentEmployees | Single line text | — | From Abstract API |
| EnrichmentLocation | Single line text | — | From Abstract API |
| EnrichmentStatus | Choice | Pending | Pending/Complete/Failed |
| AICategory | Choice | — | hot/warm/cold/unknown |
| AISummary | Multiple lines text | — | AI intent summary |
| NotificationStatus | Choice | Pending | Pending/Sent/Failed |
| ErrorFlag | Yes/No | No | Any stage failed? |
| ErrorSummary | Multiple lines text | — | Error details |
| StepHistory | Multiple lines text | — | JSON array of stage entries |

**Total columns**: 17 (well within SharePoint's limits)

## Build Order & Timeline

### Day 1: Microsoft Infrastructure (4-5 hours)

| # | Task | Time | Deliverable |
|---|------|------|-------------|
| 1 | Create SharePoint site + "Leads" list with all 17 columns | 30 min | Working SP list |
| 2 | Build PA Flow #1: HTTP trigger + Create SP item scope | 45 min | Leads created on POST |
| 3 | Add PA Flow #1: Enrichment scope (Abstract API call + SP update) | 30 min | Enrichment working |
| 4 | Add PA Flow #1: AI scope (OpenAI HTTP call + SP update) | 45 min | AI classification working |
| 5 | Add PA Flow #1: Outlook notification scope | 30 min | Emails sent |
| 6 | Add PA Flow #1: Error handling (run-after on each scope) | 30 min | Graceful failures |
| 7 | Add PA Flow #1: Finalize scope + Response action | 15 min | 200/500 responses |
| 8 | Test end-to-end with Postman | 30 min | Full pipeline verified |
| 9 | Build PA Flow #2: Dashboard data API | 30 min | JSON endpoint working |

**Day 1 checkpoint**: Full pipeline working. Can POST JSON → get processed lead in SharePoint → receive Outlook email → GET leads as JSON. **This alone is a demonstrable system.**

### Day 2: React App Setup (4-5 hours)

| # | Task | Time | Deliverable |
|---|------|------|-------------|
| 10 | Clone shadcn-admin into `/app` | 15 min | Base app running |
| 11 | Strip auth, settings, tasks, apps, chats pages | 30 min | Clean app shell |
| 12 | Configure branding: "LeadFlow for Borg", black+red palette | 30 min | Branded app |
| 13 | Remove dark mode toggle | 10 min | Light mode only |
| 14 | Set up routes: `/`, `/dashboard`, `/submit` | 20 min | Routing working |
| 15 | Create `lib/types.ts` with Lead type definitions | 15 min | Type safety |
| 16 | Create `lib/api.ts` with fetch functions for PA flows | 20 min | Data layer |
| 17 | Build lead form page with RHF + Zod validation | 45 min | Form working |
| 18 | Add animated checkmark success state | 20 min | Submit UX polished |
| 19 | Wire form POST to PA Flow #1 trigger URL | 15 min | Form → PA connected |
| 20 | Test form submission end-to-end | 15 min | Lead appears in SP |

**Day 2 checkpoint**: Form submits leads, PA processes them, leads appear in SharePoint with enrichment + AI. Outlook emails arrive. React form is polished.

### Day 3: Dashboard (4-5 hours)

| # | Task | Time | Deliverable |
|---|------|------|-------------|
| 21 | Build stats cards component (4 metrics) | 30 min | Stats visible |
| 22 | Build lead table with TanStack Table | 60 min | Table with data |
| 23 | Add temperature badges (coloured dot + text) | 15 min | Visual indicators |
| 24 | Add status column + submitted time formatting | 15 min | Full table columns |
| 25 | Add filter toolbar (temperature + status dropdowns) | 30 min | Filtering works |
| 26 | Build lead detail Sheet (slide-out panel) | 30 min | Detail view |
| 27 | Build vertical processing timeline stepper | 45 min | Timeline with icons |
| 28 | Build empty state with illustration + onboarding text | 20 min | Empty state polished |
| 29 | Wire dashboard to PA Flow #2 data API | 15 min | Live data displayed |
| 30 | End-to-end smoke test: form → PA → dashboard | 15 min | Everything works |

**Day 3 checkpoint**: Complete working system. Form → Pipeline → Dashboard with timeline. Demo-ready.

### Day 4: Polish & Demo Prep (2-3 hours)

| # | Task | Time | Deliverable |
|---|------|------|-------------|
| 31 | Submit 5-10 test leads with varied messages | 20 min | Demo data ready |
| 32 | Verify each lead has correct enrichment + AI output | 15 min | Data quality check |
| 33 | Test error scenarios (bad email domain, AI timeout) | 20 min | Error handling verified |
| 34 | UI polish pass (spacing, alignment, responsive) | 30 min | Professional finish |
| 35 | Deploy React app (Vercel or localhost decision) | 15 min | Accessible URL |
| 36 | Full demo dry run (follow the 14-step demo script) | 30 min | Demo rehearsed |
| 37 | Prepare backup screenshots in case of live failure | 15 min | Safety net |

**Day 4 checkpoint**: Demo-ready with test data, polished UI, and rehearsed walkthrough.

## Complexity Tracking

| Deviation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| No backend API | Brief doesn't require it. PA trigger URL in frontend is acceptable for a demo. | Adding Express server would cost 30+ min with no brief requirement fulfilled |
| No auth | Brief doesn't mention auth. Removing it eliminates the #1 demo-failure risk. | MSAL setup takes 60+ min and frequently fails on first attempt |
| Outlook only (no Teams) | Teams not available in tenant. Brief allows either. | Can't use what's not available |
| Direct form-to-PA POST | Simplest possible data flow. No middleware. | Backend proxy adds complexity with zero brief requirement |
