# LeadFlow for Borg

End-to-end lead automation built for the **Borg Hybrid Technical Test** — a public form that captures leads, automatically enriches them, classifies them with AI, notifies the sales team, and surfaces everything on a live dashboard.

- **Live app:** https://divs-borg-autmation.vercel.app
- **Submit a lead:** https://divs-borg-autmation.vercel.app/submit
- **Dashboard:** https://divs-borg-autmation.vercel.app/dashboard

---

## Architecture

```
┌──────────────────────┐       ┌──────────────────────────────────────────────┐
│  React Web Form      │       │  Power Automate — Flow #1 (HTTP trigger)     │
│  (shadcn/ui + Vite)  │──POST▶│  Lead Processing Pipeline                    │
└──────────────────────┘       │                                              │
                               │  1. SharePoint  → Create item (Received)     │
                               │  2. Abstract API → Company enrichment        │
                               │  3. SharePoint  → Update with enrichment     │
                               │  4. OpenAI      → Classify (hot/warm/cold)   │
                               │  5. SharePoint  → Update with AI output      │
                               │  6. Outlook     → Send notification email    │
                               │  7. SharePoint  → Mark Complete              │
                               │                                              │
                               │  Each step has a run-after error branch      │
                               │  that updates the SharePoint record and lets │
                               │  the pipeline continue gracefully.           │
                               └──────────────────────────────────────────────┘
                                                    │
                                                    ▼
                                          ┌────────────────────┐
                                          │  SharePoint List   │
                                          │  (system of record)│
                                          │  17 columns        │
                                          └────────────────────┘
                                                    ▲
┌──────────────────────┐       ┌──────────────────────────────────────────────┐
│  React Dashboard     │◀─GET──│  Power Automate — Flow #2 (HTTP trigger)     │
│  (TanStack Table +   │       │  Dashboard Data API                          │
│   Recharts charts +  │       │  SP Get-items → Select projection → JSON     │
│   15s silent polling)│       └──────────────────────────────────────────────┘
└──────────────────────┘
```

**End-to-end latency:** ~5 seconds from form submission to lead appearing on the dashboard.

---

## Brief coverage

| Brief requirement | Implementation |
|---|---|
| **Input layer** — form OR API capturing name, company, email, message | React form (`app/src/components/lead-form/`) with React Hook Form + Zod validation. POSTs JSON to Power Automate. |
| **Microsoft layer** — Power Automate or Graph API; storage in SharePoint or Dataverse; notification via Outlook or Teams | Power Automate cloud flow + SharePoint List (17 columns) + Outlook Send-Email-V2. |
| **External integration** — call an external API and store enriched data back into Microsoft | Abstract Company Enrichment API. Returned `name`, `industry`, `employees_count`, `domain`, `locality` are written back to the SharePoint item. |
| **AI layer** — categorise OR summarise; output feeds back into workflow | Both. OpenAI **gpt-5.4-mini** called via HTTP action with `response_format: json_object`. Returns `{category: hot\|warm\|cold, summary: string}`. Category drives the email subject line (hot leads get a 🔴 prefix). |
| **Output layer** — dashboard or report showing lead status, AI output, processing steps | Live dashboard with 4 stat cards, pipeline funnel, temperature donut, leads-over-time chart, lead table with filters, and a side-sheet showing per-lead submission, enrichment, AI output, and a derived processing timeline. |
| **Event-driven workflow** | Power Automate HTTP trigger fires on form POST. No polling, no batch jobs. |
| **Clear data flow across systems** | Form → PA → SharePoint → Abstract → SharePoint → OpenAI → SharePoint → Outlook → SharePoint → Dashboard. Documented in `specs/001-lead-automation-mvp/data-model.md`. |
| **Not standalone, not theoretical** | Live URL above. SharePoint List has real submitted leads. Outlook inbox receives real emails. |

---

## What's smart about it

A few decisions that go beyond the brief:

- **Run-after error branches at every stage.** If Abstract or OpenAI times out, the flow doesn't crash — it writes the failure into `EnrichmentStatus` / `AICategory=unknown` and keeps going. The dashboard timeline visualises which step failed.
- **Frontend-derived timeline.** Power Automate writes one `StepHistory` entry on creation; the rest of the timeline is reconstructed in `app/src/lib/api.ts` from the per-stage SharePoint columns. Saves five Compose+Update steps in PA without losing UX fidelity.
- **15-second silent polling.** The dashboard quietly re-fetches every 15s without showing a loading spinner. Submit a lead in one tab and watch it appear in another — no refresh.
- **Two flows, one HTTP method per flow.** Flow #1 is POST-only (ingestion), Flow #2 is GET-only (read API). Cleaner than overloading one trigger with method switching, and makes CORS / SAS-token rotation independent.
- **Pipeline funnel chart.** Visualises stage-by-stage drop-off so failures are immediately legible — turns the orchestration into a story the reviewer can scan in 2 seconds.
- **Auto-detected lead temperature in the email subject.** Hot leads get a 🔴 HOT LEAD prefix; everything else is "New Lead". Hard-stops sales from missing the urgent ones.
- **Sanitised flow exports committed alongside the code.** Both flows are checked in (JSON + importable solution zips) so a reviewer can stand up the full system in their own tenant.

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React 19, Vite, TypeScript | Fast HMR, modern React features, type safety |
| Routing | TanStack Router | File-based, type-safe routes |
| UI | shadcn/ui (cloned from `satnaing/shadcn-admin`, then stripped + rebranded) | Production-grade primitives without lock-in |
| Tables | TanStack Table | Headless filtering/sorting |
| Charts | Recharts | Composable, theme-aware |
| Forms | React Hook Form + Zod | Type-safe validation |
| Orchestration | Power Automate (HTTP-triggered cloud flow) | Brief-mandated, native Microsoft integration |
| Storage | SharePoint List | Brief-mandated, 17 typed columns |
| Enrichment | Abstract Company Enrichment API | Free tier, returns the company fields the brief implies |
| AI | OpenAI gpt-5.4-mini | Latest small model, JSON mode, cheap, fast (~2s) |
| Notification | Microsoft 365 Outlook (Send Email V2) | Brief-mandated |
| Hosting | Vercel | GitHub auto-deploy on push to `main` |

---

## Repo layout

```
.
├── app/                                   # React web app
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/                    # Pipeline funnel, temperature donut, leads-over-time
│   │   │   ├── lead-form/                 # Submit form + success animation
│   │   │   ├── lead-table/                # TanStack Table + toolbar
│   │   │   ├── lead-detail/               # Side sheet w/ submission, enrichment, AI, timeline
│   │   │   ├── stats/                     # 4 KPI cards
│   │   │   ├── system-status.tsx          # Integration pill row
│   │   │   └── info-tip.tsx               # Hover tooltips on every chart
│   │   ├── features/
│   │   │   ├── dashboard/dashboard-page.tsx
│   │   │   └── submit/submit-page.tsx
│   │   ├── lib/
│   │   │   ├── api.ts                     # PA Flow #1 + #2 client + step-history derivation
│   │   │   └── types.ts
│   │   └── routes/
│   ├── .env.example                       # PA URLs go here
│   └── vercel.json                        # SPA rewrite for client-side routing
│
└── specs/001-lead-automation-mvp/
    ├── spec.md                            # Brief mapping + user stories
    ├── plan.md                            # Implementation plan
    ├── tasks.md                           # 93-task breakdown (84/93 ✅ complete)
    ├── data-model.md                      # SharePoint List schema (17 columns)
    ├── contracts/                         # OpenAI prompt, Abstract URL, PA trigger schema, email body
    └── power-automate/
        ├── flow1-lead-pipeline.json       # Flow #1 JSON (sanitised)
        ├── flow2-dashboard-data.json      # Flow #2 JSON
        ├── solution-flow1-lead-pipeline.zip   # Importable solution package
        └── solution-flow2-dashboard-api.zip   # Importable solution package
```

---

## Run it locally

```bash
git clone https://github.com/divyesh67/divs-borg-autmation.git
cd divs-borg-autmation/app
cp .env.example .env
# Fill in:
#   VITE_PA_TRIGGER_URL=<Flow #1 HTTP POST URL>
#   VITE_PA_DATA_URL=<Flow #2 HTTP GET URL>
#   VITE_LOCAL_DEMO=false
npm install
npm run dev
# → http://localhost:5173
```

If you don't have Power Automate URLs handy, set `VITE_LOCAL_DEMO=true` and the app will use seeded demo data from browser localStorage.

---

## Deploy your own

1. **SharePoint** — create a list named `Div's Borg Automation List` with the 17 columns from `specs/001-lead-automation-mvp/data-model.md`.
2. **Power Automate** — import both solution zips from `specs/001-lead-automation-mvp/power-automate/`. Configure the SharePoint and Office 365 connections. Replace the redacted Abstract API key and OpenAI Bearer token in Flow #1.
3. **Vercel** — connect this repo, set `app/` as the root directory, add `VITE_PA_TRIGGER_URL` / `VITE_PA_DATA_URL` env vars from the two flow trigger URLs, deploy.

Full step-by-step in `specs/001-lead-automation-mvp/quickstart.md`.

---

## Status

84 of 93 build tasks complete. Remaining items are manual demo-day checks (browser smoke test, screenshot backups, dry-run). See `specs/001-lead-automation-mvp/tasks.md` for the full breakdown.
