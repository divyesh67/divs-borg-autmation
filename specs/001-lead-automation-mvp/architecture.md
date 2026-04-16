# Lead Automation MVP — Architecture Overview

**Purpose**: Visual blueprint of the complete system before implementation planning
**Date**: 2026-04-16
**Spec**: [spec.md](./spec.md)

## MCP & Tooling Decision

### What was considered

| Tool | Purpose | Verdict |
|------|---------|---------|
| Microsoft Dataverse MCP | AI agent reads/writes Dataverse | SKIP — we use SharePoint, not Dataverse |
| viaSocket Power Automate MCP | Trigger/monitor flows from Claude | SKIP — flow is built in portal, not programmatically |
| Automatisch (open-source flow engine) | Replace Power Automate | REJECT — brief requires Microsoft as backbone |
| ToolJet / Budibase (low-code dashboards) | Replace React dashboard | REJECT — brief wants custom React engineering skill |
| Azure OpenAI connector in PA | AI within Power Automate | CONSIDER — depends on Azure OpenAI access |
| External AI API (OpenAI/Claude) via HTTP | AI called from Power Automate | RECOMMENDED — fastest, no Azure provisioning |
| Power Platform Skills (GitHub) | Claude Code plugins for PA | SKIP — only covers Power Apps, not Power Automate |

### Final tooling stack

```
CODE (in this repo):
  ├── React dashboard (MSAL + Graph API)
  ├── Thin backend API (Node.js/Express)
  └── Public lead form (static HTML or React)

MICROSOFT PORTAL (manual build from blueprint):
  ├── Power Automate cloud flow
  ├── SharePoint List (lead records)
  ├── Teams channel (notifications)
  └── Entra ID app registration (dashboard auth)

EXTERNAL SERVICES:
  ├── AI API (OpenAI or Claude — structured JSON output)
  └── Enrichment API (public company data API or mock)
```

---

## 1. End-to-End Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        LEAD AUTOMATION MVP — DATA FLOW                      │
└─────────────────────────────────────────────────────────────────────────────┘

  EXTERNAL                    BACKEND                 MICROSOFT
  (Public)                    (Our Code)              (Portal-built)
 ┌──────────┐              ┌──────────────┐         ┌─────────────────┐
 │          │   POST       │              │  HTTP   │                 │
 │  Lead    │─────────────>│  Thin API    │────────>│  Power Automate │
 │  Form    │  name,co,    │  (Node.js)   │ trigger │  Cloud Flow     │
 │          │  email,msg   │              │         │                 │
 └──────────┘              │  • Validate  │         │  ┌───────────┐  │
                           │  • Gen ID    │         │  │ Validate  │  │
                           │  • Timestamp │         │  │ Intake    │  │
                           │  • Rate limit│         │  └─────┬─────┘  │
                           │  • Log       │         │        │        │
                           └──────────────┘         │  ┌─────▼─────┐  │
                                                    │  │ Create SP │  │
                                                    │  │ List Item │  │
                                                    │  └─────┬─────┘  │
                                                    │        │        │
                           ┌──────────────┐         │  ┌─────▼─────┐  │
                           │  Enrichment  │<────────│  │ Call       │  │
                           │  API         │────────>│  │ Enrichment│  │
                           │  (External)  │  JSON   │  └─────┬─────┘  │
                           └──────────────┘         │        │        │
                                                    │  ┌─────▼─────┐  │
                           ┌──────────────┐         │  │ Update SP │  │
                           │  AI API      │<────────│  │ + Call AI │  │
                           │  (OpenAI/    │────────>│  └─────┬─────┘  │
                           │   Claude)    │  JSON   │        │        │
                           └──────────────┘         │  ┌─────▼─────┐  │
                                                    │  │ Update SP │  │
                                                    │  │ with AI   │  │
                                                    │  └─────┬─────┘  │
                                                    │        │        │
                                                    │  ┌─────▼─────┐  │
                                                    │  │ Send      │  │
                                                    │  │ Teams/    │──┼──> Teams Channel
                                                    │  │ Outlook   │  │    (Notification)
                                                    │  └─────┬─────┘  │
                                                    │        │        │
                                                    │  ┌─────▼─────┐  │
                                                    │  │ Finalize  │  │
                                                    │  │ Status    │  │
                                                    │  └───────────┘  │
                                                    └────────┬────────┘
                                                             │
                                                    ┌────────▼────────┐
                                                    │  SharePoint     │
                                                    │  List           │
                                                    │  (System of     │
                                                    │   Record)       │
                                                    └────────┬────────┘
                                                             │
                                                    Graph API (read)
                                                             │
 ┌──────────┐              ┌──────────────┐         ┌────────▼────────┐
 │ Operator │──── MSAL ───>│  React       │────────>│  Microsoft      │
 │ (Entra   │   sign-in   │  Dashboard   │  Graph  │  Graph API      │
 │  ID)     │              │              │  query  │  Sites.Read.All │
 └──────────┘              └──────────────┘         └─────────────────┘
```

---

## 2. Lead Lifecycle State Machine

```
┌─────────────────────────────────────────────────────────────────┐
│                    LEAD LIFECYCLE STAGES                         │
└─────────────────────────────────────────────────────────────────┘

  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌────────────┐    ┌──────────┐
  │          │    │          │    │          │    │            │    │          │
  │ RECEIVED │───>│  STORED  │───>│ ENRICHED │───>│AI PROCESSED│───>│ NOTIFIED │
  │          │    │          │    │          │    │            │    │          │
  └──────────┘    └──────────┘    └────┬─────┘    └─────┬──────┘    └──────────┘
                                      │                │
                                      │ on failure     │ on failure
                                      ▼                ▼
                                 ┌──────────┐    ┌──────────┐
                                 │ ENRICHMENT│    │AI FAILED │
                                 │ FAILED   │    │          │
                                 └────┬─────┘    └────┬─────┘
                                      │               │
                                      │  continues    │  continues
                                      ▼               ▼
                                 ┌──────────┐    ┌──────────┐
                                 │AI PROCESS│    │ NOTIFIED │
                                 │(fit=50)  │    │(w/ note) │
                                 └──────────┘    └──────────┘

  RETRY POLICY (enrichment + AI stages):
  ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌──────────┐
  │ Attempt │────>│ Wait    │────>│ Attempt │────>│ Wait     │───> Attempt 3
  │    1    │     │ ~1 min  │     │    2    │     │ ~2 min   │    (if fail →
  └─────────┘     └─────────┘     └─────────┘     └──────────┘     mark error)
```

---

## 3. AI Classification Model

```
┌─────────────────────────────────────────────────────────────────┐
│              MULTI-DIMENSIONAL AI SCORING MODEL                  │
└─────────────────────────────────────────────────────────────────┘

  INPUT TO AI:
  ┌────────────────────────────────────┐
  │ • Lead message (from form)         │
  │ • Company name (from form)         │
  │ • Enrichment data (if available)   │
  │   - domain, website, summary       │
  └──────────────┬─────────────────────┘
                 │
                 ▼
  ┌────────────────────────────────────┐
  │         AI STRUCTURED OUTPUT       │
  ├────────────────────────────────────┤
  │                                    │
  │  intent_score:    0━━━━━━━━━━100  │  "How clearly are they asking
  │                        ▲           │   to buy or engage?"
  │                        72          │
  │                                    │
  │  urgency_score:   0━━━━━━━━━━100  │  "How time-sensitive is
  │                      ▲             │   their request?"
  │                      58            │
  │                                    │
  │  company_fit:     0━━━━━━━━━━100  │  "How well does enrichment
  │                          ▲         │   data match ideal profile?"
  │                          80        │  (50 if no enrichment data)
  │                                    │
  │  intent_summary:  "Wants pricing   │
  │    for warehouse automation..."    │
  │                                    │
  │  reason: "Clear buying intent,     │
  │    established company, moderate   │
  │    urgency implied by timeline"    │
  │                                    │
  └──────────────┬─────────────────────┘
                 │
                 ▼
  COMPOSITE TEMPERATURE DERIVATION:
  ┌────────────────────────────────────┐
  │  avg = (intent + urgency + fit) / 3│
  │                                    │
  │  HOT:  any score > 70              │
  │        AND avg > 65                │
  │                                    │
  │  COLD: avg < 35                    │
  │                                    │
  │  WARM: everything else             │
  └────────────────────────────────────┘
```

---

## 4. Power Automate Flow Blueprint

```
┌─────────────────────────────────────────────────────────────────┐
│        POWER AUTOMATE CLOUD FLOW — SCOPE ARCHITECTURE           │
└─────────────────────────────────────────────────────────────────┘

  TRIGGER: "When an HTTP request is received" (POST)
  ┌──────────────────────────────────────────┐
  │ JSON Schema:                              │
  │ {                                         │
  │   "leadId": "string",                     │
  │   "submittedAt": "string (ISO 8601)",     │
  │   "name": "string",                       │
  │   "company": "string",                    │
  │   "email": "string",                      │
  │   "message": "string"                     │
  │ }                                         │
  └──────────────────┬───────────────────────┘
                     │
  ┌──────────────────▼───────────────────────┐
  │ SCOPE: Try (Main Pipeline)               │
  │ ┌────────────────────────────────────┐   │
  │ │ SCOPE: 1. Validate Intake          │   │
  │ │  • Parse JSON trigger body         │   │
  │ │  • Compose: set initial variables  │   │
  │ │    - processingStatus = "Received" │   │
  │ │    - currentStage = "Validate"     │   │
  │ │    - stepHistory = []              │   │
  │ └────────────────┬───────────────────┘   │
  │                  │                        │
  │ ┌────────────────▼───────────────────┐   │
  │ │ SCOPE: 2. Create SharePoint Record │   │
  │ │  • SharePoint: Create item         │   │
  │ │    - All submission fields          │   │
  │ │    - ProcessingStatus = "Stored"    │   │
  │ │    - CurrentStage = "Create"        │   │
  │ │  • Append to stepHistory:           │   │
  │ │    {stage:"Stored", ts:utcNow(),    │   │
  │ │     status:"success"}               │   │
  │ └────────────────┬───────────────────┘   │
  │                  │                        │
  │ ┌────────────────▼───────────────────┐   │
  │ │ SCOPE: 3. Call Enrichment          │   │
  │ │  • HTTP action → enrichment API    │   │
  │ │    - Retry: exponential, 3 attempts │   │
  │ │  • Parse JSON response             │   │
  │ │  • SharePoint: Update item         │   │
  │ │    - EnrichmentStatus = "Complete" │   │
  │ │    - CompanyDomain, Website, etc.  │   │
  │ │    - ProcessingStatus = "Enriched" │   │
  │ │  • Append to stepHistory           │   │
  │ │                                     │   │
  │ │  ┌─ ON FAILURE (run-after:failed)─┐│   │
  │ │  │ • Set EnrichmentStatus="Failed"││   │
  │ │  │ • Set ErrorFlag=true            ││   │
  │ │  │ • Set ErrorSummary              ││   │
  │ │  │ • Append error to stepHistory   ││   │
  │ │  │ • (pipeline continues)          ││   │
  │ │  └────────────────────────────────┘│   │
  │ └────────────────┬───────────────────┘   │
  │                  │                        │
  │ ┌────────────────▼───────────────────┐   │
  │ │ SCOPE: 4. Run AI Classification   │   │
  │ │  • Compose: build AI prompt with   │   │
  │ │    message + enrichment data       │   │
  │ │  • HTTP action → AI API (POST)     │   │
  │ │    - Retry: exponential, 3 attempts │   │
  │ │    - Body: structured output prompt│   │
  │ │  • Parse JSON → extract scores     │   │
  │ │  • Compose: derive temperature     │   │
  │ │    from intent/urgency/fit scores  │   │
  │ │  • If no enrichment: fit = 50      │   │
  │ │                                     │   │
  │ │  ┌─ ON FAILURE (run-after:failed)─┐│   │
  │ │  │ • Set AI fields to null/unknown ││   │
  │ │  │ • Set ErrorFlag=true            ││   │
  │ │  │ • Append error to stepHistory   ││   │
  │ │  │ • (pipeline continues)          ││   │
  │ │  └────────────────────────────────┘│   │
  │ └────────────────┬───────────────────┘   │
  │                  │                        │
  │ ┌────────────────▼───────────────────┐   │
  │ │ SCOPE: 5. Update Record with AI   │   │
  │ │  • SharePoint: Update item         │   │
  │ │    - IntentScore, UrgencyScore     │   │
  │ │    - CompanyFitScore, Temperature  │   │
  │ │    - AISummary, AIReason           │   │
  │ │    - ProcessingStatus="AI Processed"│  │
  │ │  • Append to stepHistory           │   │
  │ └────────────────┬───────────────────┘   │
  │                  │                        │
  │ ┌────────────────▼───────────────────┐   │
  │ │ SCOPE: 6. Notify Team             │   │
  │ │  • Compose: build notification     │   │
  │ │    card with lead details + scores │   │
  │ │    + deep link to dashboard        │   │
  │ │  • Condition: temperature == "hot" │   │
  │ │    Yes → add priority indicator    │   │
  │ │  • Teams: Post adaptive card       │   │
  │ │    to channel                      │   │
  │ │  • SharePoint: Update item         │   │
  │ │    - NotificationStatus = "Sent"   │   │
  │ │    - ProcessingStatus = "Notified" │   │
  │ │  • Append to stepHistory           │   │
  │ └────────────────┬───────────────────┘   │
  │                  │                        │
  │ ┌────────────────▼───────────────────┐   │
  │ │ SCOPE: 7. Finalize                 │   │
  │ │  • SharePoint: Update item         │   │
  │ │    - ProcessingStatus = "Complete" │   │
  │ │    - StepHistoryJson = full history│   │
  │ │  • Response: 200 OK to backend     │   │
  │ └────────────────────────────────────┘   │
  └──────────────────┬───────────────────────┘
                     │ on failure
  ┌──────────────────▼───────────────────────┐
  │ SCOPE: Catch (Error Handler)             │
  │  • Filter array: result() for failures   │
  │  • SharePoint: Update item               │
  │    - ProcessingStatus = "Error"           │
  │    - ErrorFlag = true                     │
  │    - ErrorSummary = filtered error msg    │
  │  • Response: 500 to backend               │
  │  • (Optional: Terminate with Failed)      │
  └──────────────────────────────────────────┘
```

---

## 5. SharePoint List Schema

```
┌─────────────────────────────────────────────────────────────────┐
│              SHAREPOINT LIST: "Leads"                            │
├──────────────────┬──────────────┬────────────────────────────────┤
│ Column           │ Type         │ Purpose                        │
├──────────────────┼──────────────┼────────────────────────────────┤
│ SUBMISSION FIELDS                                                │
├──────────────────┼──────────────┼────────────────────────────────┤
│ LeadId           │ Single text  │ Unique ID from backend         │
│ SubmittedAt      │ Single text  │ ISO 8601 timestamp             │
│ Name             │ Single text  │ Submitter name                 │
│ Company          │ Single text  │ Submitted company name         │
│ Email            │ Single text  │ Submitter email                │
│ Message          │ Multi text   │ Lead message (≤2000 chars)     │
│ SourceChannel    │ Single text  │ "web-form"                     │
├──────────────────┼──────────────┼────────────────────────────────┤
│ OPERATIONAL FIELDS                                               │
├──────────────────┼──────────────┼────────────────────────────────┤
│ ProcessingStatus │ Choice       │ Received/Stored/Enriched/      │
│                  │              │ AI Processed/Notified/Error    │
│ CurrentStage     │ Single text  │ Last completed scope name      │
│ LastProcessedAt  │ Single text  │ ISO 8601 timestamp             │
│ FlowRunRef       │ Single text  │ workflow() run ID              │
│ NotificationStatus│ Choice      │ Pending/Sent/Failed            │
│ ErrorFlag        │ Yes/No       │ Any stage failed?              │
│ ErrorSummary     │ Multi text   │ Error details                  │
│ RetryCount       │ Number       │ Total retries across stages    │
├──────────────────┼──────────────┼────────────────────────────────┤
│ ENRICHMENT FIELDS                                                │
├──────────────────┼──────────────┼────────────────────────────────┤
│ EnrichmentStatus │ Choice       │ Pending/Complete/Failed         │
│ CompanyDomain    │ Single text  │ e.g., "microsoft.com"          │
│ CompanyWebsite   │ Single text  │ e.g., "https://microsoft.com"  │
│ EnrichmentSummary│ Multi text   │ Human-readable summary         │
│ EnrichmentRaw    │ Multi text   │ Raw JSON response              │
├──────────────────┼──────────────┼────────────────────────────────┤
│ AI CLASSIFICATION FIELDS                                         │
├──────────────────┼──────────────┼────────────────────────────────┤
│ IntentScore      │ Number       │ 0-100                          │
│ UrgencyScore     │ Number       │ 0-100                          │
│ CompanyFitScore  │ Number       │ 0-100 (50 if no enrichment)    │
│ Temperature      │ Choice       │ Hot/Warm/Cold/Unknown          │
│ AISummary        │ Multi text   │ Intent summary text            │
│ AIReason         │ Multi text   │ Reasoning explanation          │
│ AIProcessedAt    │ Single text  │ ISO 8601 timestamp             │
├──────────────────┼──────────────┼────────────────────────────────┤
│ VISIBILITY FIELDS                                                │
├──────────────────┼──────────────┼────────────────────────────────┤
│ StepHistoryJson  │ Multi text   │ JSON array of stage entries    │
│ AssignedTo       │ Single text  │ Nullable (future write actions)│
│ DashboardLink    │ Single text  │ Deep link URL to dashboard     │
└──────────────────┴──────────────┴────────────────────────────────┘
```

---

## 6. Dashboard Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                REACT DASHBOARD — COMPONENT TREE                  │
└─────────────────────────────────────────────────────────────────┘

  App (MSAL Provider)
  │
  ├── AuthGate
  │   └── Redirects to Microsoft sign-in if unauthenticated
  │
  ├── Layout
  │   ├── Header (logo, user info, sign-out)
  │   └── Main Content
  │       │
  │       ├── LeadListView (default route)
  │       │   ├── FilterBar
  │       │   │   ├── TemperatureFilter  [Hot] [Warm] [Cold] [All]
  │       │   │   ├── StatusFilter       [dropdown: all statuses]
  │       │   │   └── TimeFilter         [Today] [Week] [All]
  │       │   │
  │       │   ├── LeadTable / LeadCards
  │       │   │   └── LeadRow (for each lead)
  │       │   │       ├── Name + Company
  │       │   │       ├── TemperatureBadge  🔴 Hot  🟡 Warm  🔵 Cold
  │       │   │       ├── StatusIndicator
  │       │   │       ├── SubmittedTime (relative)
  │       │   │       └── NotificationStatus icon
  │       │   │
  │       │   └── PollingManager (fetches every 10-15s)
  │       │
  │       └── LeadDetailView (route: /leads/:leadId)
  │           ├── SubmissionCard
  │           │   └── Name, Email, Company, Message
  │           │
  │           ├── EnrichmentCard
  │           │   └── Side-by-side: Submitted Co. | Enriched Co.
  │           │       Domain, Website, Summary
  │           │
  │           ├── AIScoreCard
  │           │   ├── IntentGauge     ████████░░  72/100
  │           │   ├── UrgencyGauge    █████░░░░░  58/100
  │           │   ├── FitGauge        ████████░░  80/100
  │           │   ├── CompositeTemp   🔴 HOT
  │           │   ├── Summary text
  │           │   └── Reason text
  │           │
  │           └── ProcessingTimeline
  │               ├── VisualTimeline (horizontal bar)
  │               │   ┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐
  │               │   │ ✓  │─>│ ✓  │─>│ ✗  │─>│ ✓  │─>│ ✓  │
  │               │   │Recv│  │Stor│  │Enri│  │ AI │  │Noti│
  │               │   └────┘  └────┘  └────┘  └────┘  └────┘
  │               │   0s       +2s     +8s     +15s    +22s
  │               │
  │               └── ExpandableStageDetails
  │                   └── Per-stage: timestamp, duration,
  │                       status, error detail (if any),
  │                       retry count
  │
  └── EmptyState (shown when no leads exist)
```

---

## 7. Notification Card Structure (Teams Adaptive Card)

```
┌─────────────────────────────────────────────────────────────────┐
│  🔴 HOT LEAD                                     New Lead Alert │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Name:     Jane Smith                                           │
│  Company:  Acme Industries                                      │
│  Email:    jane@acme.com                                        │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  AI Summary                                                      │
│  "Wants pricing and deployment timeline for warehouse            │
│   automation solution. Clear buying intent with Q3 deadline."    │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  Scores                                                          │
│  Intent: 85/100  │  Urgency: 72/100  │  Fit: 90/100            │
│                                                                  │
│  Temperature: 🔴 HOT                                            │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  Status: Notified  │  Processed: 22s ago                        │
│                                                                  │
│  ┌──────────────────────┐                                       │
│  │  View in Dashboard →  │                                       │
│  └──────────────────────┘                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Request/Response Contracts

### Backend API → Power Automate (HTTP POST)

```json
{
  "leadId": "lead_20260416_a1b2c3",
  "submittedAt": "2026-04-16T14:32:05.000Z",
  "name": "Jane Smith",
  "company": "Acme Industries",
  "email": "jane@acme.com",
  "message": "We need pricing for warehouse automation..."
}
```

### AI API → Structured Response

```json
{
  "intent_score": 85,
  "urgency_score": 72,
  "company_fit_score": 90,
  "composite_temperature": "hot",
  "intent_summary": "Wants pricing and deployment timeline for warehouse automation solution.",
  "reason": "Clear buying intent with explicit Q3 deadline. Established company with matching industry profile. Request specificity indicates late-stage evaluation."
}
```

### Enrichment API → Response

```json
{
  "company_name": "Acme Industries Inc.",
  "domain": "acme-industries.com",
  "website": "https://www.acme-industries.com",
  "industry": "Manufacturing",
  "employee_count": "500-1000",
  "description": "Industrial automation and logistics solutions provider."
}
```

---

## 9. Authentication & Security Boundaries

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY BOUNDARIES                            │
└─────────────────────────────────────────────────────────────────┘

  PUBLIC ZONE                    PROTECTED ZONE
  (no auth)                      (authenticated)
  ┌────────────┐                ┌─────────────────────────────┐
  │            │                │                             │
  │  Lead Form │────────────────│  Backend API                │
  │            │  HTTPS POST    │  • Rate limited             │
  │  (anyone)  │                │  • Validates input          │
  │            │                │  • Hides PA trigger URL     │
  └────────────┘                └──────────┬──────────────────┘
                                           │
                                           │ HTTP trigger
                                           │ (URL secret)
                                ┌──────────▼──────────────────┐
                                │  Power Automate             │
                                │  • Runs under service acct  │
                                │  • SharePoint write access  │
                                │  • Teams post access        │
                                │  • HTTP outbound (AI, enrich)│
                                └─────────────────────────────┘

  INTERNAL ZONE
  (Entra ID auth)
  ┌────────────┐                ┌─────────────────────────────┐
  │  Operator  │── MSAL ──────>│  React Dashboard            │
  │  (Entra ID)│  OAuth 2.0    │  • Token: Sites.Read.All    │
  │            │  sign-in      │  • Read-only Graph queries   │
  └────────────┘                └─────────────────────────────┘
```

---

## 10. Demo Script Flow

```
  STEP   ACTION                           WHAT INTERVIEWER SEES
  ────   ──────                           ─────────────────────
   1     Open lead form in browser        Clean minimal form
   2     Fill in: Jane Smith, Acme,       Professional intake
         jane@acme.com, "Need pricing     experience
         for warehouse automation..."
   3     Click Submit                      ✓ Confirmation message
   4     Switch to Power Automate portal  Flow running in real-time
         (optional)                        Scopes executing visually
   5     Wait ~30 seconds                 Pipeline processing
   6     Check Teams channel              🔴 HOT LEAD notification
                                           with scores + deep link
   7     Click deep link → Dashboard      Dashboard opens to lead
                                           detail view
   8     Show AI scores breakdown         Intent: 85, Urgency: 72,
                                           Fit: 90 → HOT
   9     Show processing timeline         Visual timeline with
                                           ✓ on all stages + times
  10     Show enrichment side-by-side     "Acme" vs "Acme Industries
                                           Inc." comparison
  11     Go to lead list, filter "hot"    Filtered view shows lead
  12     Show pre-seeded failure #1       Enrichment ✗, AI ✓, Notif ✓
  13     Show pre-seeded failure #2       Enrichment ✓, AI ✗, Notif ✓
                                           (with "AI unavailable" note)
  14     Narrate: "Designed for partial   Senior engineering signal
         failure, not just happy path"
```
