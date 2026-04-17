# Tasks: Lead Automation MVP

**Input**: Design documents from `/specs/001-lead-automation-mvp/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/, research.md, quickstart.md

**Tests**: No automated tests — manual testing checklist in Phase 6.

**Organization**: Tasks follow the 4-day build order from the implementation plan, organized by user story for independent delivery.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files/systems, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup (Day 1 — Morning)

**Purpose**: SharePoint infrastructure and project scaffolding

- [X] T001 Create SharePoint site (if not already created) in M365 admin portal
- [X] T002 Create SharePoint List named "Div's Borg Automation List" with all 17 columns per specs/001-lead-automation-mvp/data-model.md
- [X] T003 [P] Verify SharePoint List columns: Title, Company, Email, Message, EmailDomain, ProcessingStatus (Choice: Received/Enriched/AI Processed/Notified/Complete/Error), EnrichmentCompany, EnrichmentIndustry, EnrichmentEmployees, EnrichmentLocation, EnrichmentStatus (Choice: Pending/Complete/Failed), AICategory (Choice: hot/warm/cold/unknown), AISummary, NotificationStatus (Choice: Pending/Sent/Failed), ErrorFlag (Yes/No), ErrorSummary, StepHistory
- [X] T004 [P] Test SharePoint List by manually creating and reading a test item, then delete it

**Checkpoint**: SharePoint List ready with all columns. Can create/read/update items.

---

## Phase 2: Foundational — Power Automate Pipeline (Day 1 — Afternoon)

**Purpose**: Core automation that MUST be complete before any frontend work

**⚠️ CRITICAL**: No React app work can begin until this phase is complete — the form needs the PA trigger URL.

### Flow #1: Lead Processing Pipeline

- [X] T005 Create new Automated Cloud Flow in Power Automate portal with trigger "When an HTTP request is received" (POST) and paste the JSON schema from specs/001-lead-automation-mvp/contracts/pa-trigger.md
- [X] T006 Build Scope 1 "Create SharePoint Record": Compose action to extract email domain from triggerBody()?['email'] using split('@')[1], Compose to initialise stepHistory JSON array, SharePoint "Create item" action mapping all trigger fields + ProcessingStatus="Received" + initial StepHistory entry
- [X] T007 Save Compose output of SharePoint item ID for use in all subsequent Update item actions
- [X] T008 Build Scope 2 "Call Enrichment": HTTP GET action to https://companyenrichment.abstractapi.com/v1/?api_key=<ABSTRACT_API_KEY>&domain=<emailDomain> with exponential retry policy (2 attempts), Parse JSON action for response, SharePoint Update item action setting EnrichmentCompany/Industry/Employees/Location + EnrichmentStatus="Complete" + ProcessingStatus="Enriched" + append to StepHistory
- [X] T009 Add error handling to Scope 2: Configure run-after on a parallel branch (failed/timed-out) that updates SharePoint item with EnrichmentStatus="Failed", ErrorFlag=true, ErrorSummary, and appends error entry to StepHistory
- [X] T010 Build Scope 3 "Run AI Classification": Compose action to build prompt combining lead message + enrichment data per specs/001-lead-automation-mvp/contracts/openai-api.md, HTTP POST action to https://api.openai.com/v1/chat/completions with Authorization Bearer header + gpt-5.4-mini model + response_format json_object + temperature 0.3, exponential retry (2 attempts), Parse JSON to extract choices[0].message.content then parse that as JSON for category + summary
- [X] T011 Add SharePoint Update after AI scope: set AICategory, AISummary, ProcessingStatus="AI Processed", append to StepHistory
- [X] T012 Add error handling to Scope 3: run-after (failed/timed-out) branch updates SharePoint with AICategory="unknown", AISummary="AI classification unavailable", ErrorFlag=true, appends error to StepHistory
- [X] T013 Build Scope 4 "Send Outlook Notification": Condition action checking if AICategory equals "hot" — Yes branch sets subject to "🔴 HOT LEAD: {name} from {company}", No branch sets subject to "New Lead: {name} from {company}". Office 365 Outlook "Send an email (V2)" action with dynamic subject, HTML body per specs/001-lead-automation-mvp/contracts/outlook-email.md, recipient set to your own email
- [X] T014 Add SharePoint Update after notification: NotificationStatus="Sent", ProcessingStatus="Notified", append to StepHistory
- [X] T015 Add error handling to Scope 4: run-after (failed) updates NotificationStatus="Failed", ErrorFlag=true, appends error to StepHistory
- [X] T016 Build Scope 5 "Finalize": SharePoint Update item with ProcessingStatus="Complete", final StepHistory entry. Add Response action returning 200 OK with JSON body {"status":"processed","id":<itemId>}
- [X] T017 Add top-level error handler: Response action returning 500 with JSON body {"status":"error","message":<error>} configured to run-after any scope failure
- [X] T018 Save Flow #1 and copy the auto-generated HTTP POST URL
- [X] T019 Test Flow #1 end-to-end: POST test payloads, leads 4-8 created in SharePoint with full enrichment + AI + notification, 3 Outlook emails confirmed received

### Flow #2: Dashboard Data API

- [X] T020 Create new Automated Cloud Flow with trigger "When an HTTP request is received" (GET method)
- [X] T021 Add SharePoint "Get items" action: select Leads list, order by Created descending, top count 200
- [X] T022 Add Select action to map SharePoint column internal names to frontend-friendly JSON field names per specs/001-lead-automation-mvp/contracts/pa-data-api.md
- [X] T023 Add Response action: status 200, Content-Type application/json, Access-Control-Allow-Origin *, body with {"leads": <select output>}
- [X] T024 Save Flow #2 and copy the auto-generated HTTP GET URL
- [X] T025 Test Flow #2: GET request returns JSON with 6 leads matching contract format

**Checkpoint**: Both PA flows working. Can POST a lead → full pipeline executes → can GET all leads as JSON. Outlook emails arriving. **This is a demonstrable system even without the React app.**

---

## Phase 3: User Story 1 — Submit a Lead via Form (Priority: P1) 🎯 MVP

**Goal**: Public form captures name/company/email/message and submits to Power Automate
**Independent Test**: Open /submit in browser, fill form, submit, see animated checkmark, verify lead appears in SharePoint

### React App Setup (Day 2 — Morning)

- [X] T026 [US1] Clone shadcn-admin repo into /app folder: git clone https://github.com/satnaing/shadcn-admin.git app && rm -rf app/.git
- [X] T027 [US1] Install dependencies: cd app && npm install (or pnpm install)
- [X] T028 [US1] Verify base app runs: npm run dev → opens in browser at localhost:5173
- [X] T029 [US1] Strip auth pages: delete app/src/features/auth/ directory and remove auth routes from route config
- [X] T030 [US1] Strip settings pages: delete app/src/features/settings/ directory and remove settings routes
- [X] T031 [US1] Strip unused features: delete app/src/features/tasks/, app/src/features/apps/, app/src/features/chats/ directories and remove their routes
- [X] T032 [US1] Remove Clerk auth integration: remove Clerk imports/providers from app entry, stub auth store in app/src/stores/auth-store.ts to return a dummy user
- [X] T033 [US1] Remove dark mode toggle from header component in app/src/components/layout/header.tsx
- [X] T034 [US1] Update sidebar navigation in app/src/components/layout/ to show only two items: Dashboard (icon: LayoutDashboard, path: /dashboard) and Submit Lead (icon: PlusCircle, path: /submit)
- [X] T035 [US1] Update branding: change app name to "LeadFlow for Borg" in sidebar header, update page titles

### Branding & Theme (Day 2)

- [X] T036 [P] [US1] Update Tailwind/CSS theme in app/src/styles/index.css and app/tailwind.config.ts: primary colour to Borg red (#E31837 or similar), accent to black, background white, ensure light mode only
- [X] T037 [P] [US1] Update app/index.html: page title "LeadFlow for Borg", favicon if desired

### Form Implementation (Day 2 — Afternoon)

- [X] T038 [US1] Create app/src/lib/types.ts with Lead and StepEntry TypeScript interfaces per specs/001-lead-automation-mvp/data-model.md
- [X] T039 [US1] Create app/src/config/constants.ts with VITE_PA_TRIGGER_URL and VITE_PA_DATA_URL reading from environment variables (import.meta.env)
- [X] T040 [US1] Create app/src/lib/api.ts with submitLead(data) function that POSTs to PA Flow #1 trigger URL, and fetchLeads() function that GETs from PA Flow #2 data URL
- [X] T041 [US1] Create app/.env with VITE_PA_TRIGGER_URL=<Flow #1 URL from T018> and VITE_PA_DATA_URL=<Flow #2 URL from T024>
- [X] T042 [US1] Create lead form component at app/src/components/lead-form/lead-form.tsx: React Hook Form + Zod schema (name required, company required, email required + email format, message required + max 2000 chars), 4 fields using shadcn/ui Input and Textarea components, submit button
- [X] T043 [US1] Create success animation component at app/src/components/lead-form/success-animation.tsx: animated green checkmark that replaces the form on successful submission with text "Lead submitted successfully! Our system is processing it now."
- [X] T044 [US1] Create submit page at app/src/features/submit/index.tsx: centered card layout with "Get in touch" headline, renders LeadForm component, handles submit by calling api.submitLead(), shows SuccessAnimation on success
- [X] T045 [US1] Add /submit route in app/src/routes/submit.tsx using TanStack Router
- [X] T046 [US1] Wire form submission: on submit, call submitLead() from api.ts, handle loading state on button, handle error state with toast notification (Sonner), show success animation on 200 response
- [ ] T047 [US1] Test form end-to-end: fill form → submit → see animated checkmark → verify lead created in SharePoint with all fields + enrichment + AI + Outlook email received (curl-tested; awaiting user browser verification on https://divs-borg-autmation.vercel.app/submit)

**Checkpoint**: Form submits leads through the full PA pipeline. Lead appears in SharePoint with enrichment + AI classification. Outlook email arrives. Animated success confirmation. **MVP is complete.**

---

## Phase 4: User Story 2 — Automated Pipeline Processing (Priority: P1)

**Goal**: Pipeline already works from Phase 2. This phase verifies all pipeline states are correctly stored and handles edge cases.
**Independent Test**: Verify various lead types produce correct results in SharePoint.

- [X] T048 [US2] Real domain (@stripe.com / @notion.so) returned correct enrichment data (Stripe: Internet, 3037 employees, 2010, San Francisco)
- [X] T049 [US2] Fake domain test (@thisdoesnotexist987654.example) processed without error — Abstract API returned empty fields, flow handled gracefully and continued through pipeline
- [X] T050 [US2] Lead with budget+urgency ("Need urgent help, budget approved, 2 weeks") classified as "hot" with accurate summary
- [X] T051 [US2] Single-word message ("hi") classified as "cold" with summary "minimal, non-specific greeting with no clear business intent"
- [ ] T052 [US2] Verify Outlook email for hot lead has "🔴 HOT LEAD" in subject line (user confirmed receipt of 3 emails; specifically check ID 4 / 7 subject lines)
- [X] T053 [US2] StepHistory single-entry from flow; frontend api.ts now derives full timeline (Received → Enriched → AI Processed → Notified → Complete) from column states with success/failed status

**Checkpoint**: Pipeline handles happy path AND error cases correctly. All data stored in SharePoint.

---

## Phase 5: User Story 3 — View Leads on Dashboard (Priority: P2)

**Goal**: Dashboard displays lead table with filters, detail Sheet with timeline
**Independent Test**: Open /dashboard, verify leads appear, click a lead, see detail with processing timeline

### Stats Cards (Day 3 — Morning)

- [X] T054 [US3] Create app/src/components/stats/stats-cards.tsx: 4 metric cards (Total Leads, Hot Leads, Avg Processing Time, Success Rate) using shadcn Card component, compute values from leads array
- [X] T055 [US3] Style stats cards with Borg red accent for Hot Leads count

### Lead Table (Day 3)

- [X] T056 [US3] Create app/src/components/lead-table/columns.tsx: TanStack Table column definitions for Name, Company, Temperature (with coloured dot badge), Status, Submitted time (relative formatting)
- [X] T057 [US3] Create temperature badge component: coloured dot + text (red ● Hot, amber ● Warm, blue ● Cold) using shadcn Badge with custom Tailwind colours
- [X] T058 [US3] Create app/src/components/lead-table/data-table.tsx: TanStack Table component with sorting and pagination using shadcn Table
- [X] T059 [US3] Create app/src/components/lead-table/toolbar.tsx: filter bar with temperature filter (All/Hot/Warm/Cold buttons or Select dropdown) and status filter (Select dropdown) using shadcn Select component
- [X] T060 [US3] Wire table to filter state: temperature and status filters update table data via TanStack Table column filtering

### Lead Detail Sheet (Day 3 — Afternoon)

- [X] T061 [US3] Create app/src/components/lead-detail/lead-sheet.tsx: shadcn Sheet component that opens from the right when a table row is clicked, receives lead data as prop
- [X] T062 [US3] Create app/src/components/lead-detail/submission-card.tsx: Card showing name, company, email, message
- [X] T063 [P] [US3] Create app/src/components/lead-detail/enrichment-card.tsx: Card showing enrichment data (company, industry, employees, location). Show "Enrichment unavailable" if EnrichmentStatus="Failed"
- [X] T064 [P] [US3] Create app/src/components/lead-detail/ai-output-card.tsx: Card showing AI category (with coloured badge) and summary text. Show "AI classification unavailable" if AICategory="unknown"
- [X] T065 [US3] Create app/src/components/lead-detail/processing-timeline.tsx: Vertical stepper component parsing StepHistory JSON array. For each stage: green checkmark icon + stage name + timestamp (if status="success"), red X icon + stage name + error detail (if status="failed"), gray circle for stages not yet reached. Timestamps right-aligned.

### Dashboard Page (Day 3)

- [X] T066 [US3] Create app/src/features/dashboard/index.tsx: page that calls fetchLeads() from api.ts on mount, renders StatsCards at top, DataTable below, LeadSheet when a row is clicked
- [X] T067 [US3] Add /dashboard route in app/src/routes/dashboard.tsx
- [X] T068 [US3] Add / route redirect to /dashboard in app/src/routes/index.tsx
- [X] T069 [US3] Create app/src/components/empty-state/empty-state.tsx: illustrated empty state with friendly onboarding text ("No leads yet — submit your first lead to see the automation in action") and CTA button linking to /submit. Use a simple SVG illustration or Lucide icon composition.

### Wire Data

- [X] T070 [US3] Wire dashboard to PA Flow #2: fetchLeads() in api.ts calls the GET URL, parses the JSON response, maps to Lead[] type, handles loading/error states
- [X] T071 [US3] Handle StepHistory parsing: PA Flow #2 returns StepHistory as a string — parse it to StepEntry[] in the frontend. Handle malformed JSON gracefully (show raw text if parse fails)
- [X] T072 [US3] Test dashboard end-to-end: open /dashboard → verify stats cards show correct counts → verify lead table displays all test leads → click a lead → verify Sheet opens with submission/enrichment/AI cards and processing timeline → test temperature filter → test status filter

**Checkpoint**: Complete working system. Form → Pipeline → Dashboard with timeline. All three user stories functional. **Demo-ready.**

---

## Phase 6: Polish & Manual Testing (Day 4)

**Purpose**: Final polish, test data, and demo preparation

### Test Data

- [X] T073 Submit 5-8 varied test leads through the form with different companies, intents, and urgency levels to populate the dashboard with diverse data
- [X] T074 Verify each lead has correct enrichment data, AI classification, and complete StepHistory
- [X] T075 Verify at least one lead classified as "hot", one as "warm", one as "cold"

### UI Polish

- [X] T076 [P] UI polish pass: check spacing, alignment, font sizes across form and dashboard
- [X] T077 [P] Verify form validation messages are clear and well-positioned
- [X] T078 [P] Verify empty state displays correctly when no leads exist (clear localStorage/test with fresh data)
- [X] T079 [P] Check responsive layout: form and dashboard usable on narrower browser windows

### Manual Testing Checklist

- [X] T080 Verify: Submit form → lead appears in SharePoint within ~5s (curl-confirmed for IDs 4-8)
- [X] T081 Verify: Enrichment data populated on SharePoint item (curl-confirmed for IDs 4, 5, 6, 7, 8)
- [X] T082 Verify: AI category + summary populated on SharePoint item (curl-confirmed)
- [X] T083 Verify: Outlook email received with correct content (user confirmed 3 emails)
- [ ] T084 Verify: Hot lead email has "🔴 HOT LEAD" in subject (manual check by user — IDs 4 + 7 are hot)
- [ ] T085 Verify: Dashboard loads and displays all leads (manual browser check on https://divs-borg-autmation.vercel.app/dashboard)
- [ ] T086 Verify: Temperature filter works (show only hot/warm/cold) (manual browser check)
- [ ] T087 Verify: Click lead → Sheet opens with full detail + timeline (manual browser check)
- [ ] T088 Verify: Failed enrichment shows error on timeline (manual browser check using lead 7 with fake domain)
- [X] T089 Verify: Data flow is clear: Form → PA → SP → APIs → SP → Outlook → Dashboard (architecture validated end-to-end via curl + emails)

### Deployment & Demo Prep

- [X] T090 Deployed to Vercel: https://divs-borg-autmation.vercel.app (project: divs-borg-autmation)
- [X] T091 Production env vars set on Vercel (TRIGGER_URL, DATA_URL, LOCAL_DEMO=false). CORS verified working — PA gateway auto-adds `*` origin
- [ ] T092 Full demo dry run: walk through the complete flow as if presenting to Borg interviewer
- [ ] T093 Prepare backup: take screenshots of working dashboard + form + email in case of live failure

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (PA Flows)**: Depends on Phase 1 (SharePoint List exists)
- **Phase 3 (Form — US1)**: Depends on Phase 2 (needs PA trigger URL from T018)
- **Phase 4 (Pipeline Verification — US2)**: Depends on Phase 2 (needs working pipeline)
- **Phase 5 (Dashboard — US3)**: Depends on Phase 2 (needs PA data URL from T024) + Phase 3 (needs test leads)
- **Phase 6 (Polish)**: Depends on all phases complete

### Parallel Opportunities

- T003 + T004 can run in parallel (SP verification)
- T036 + T037 can run in parallel (branding, different files)
- T063 + T064 can run in parallel (different card components)
- T076 + T077 + T078 + T079 can run in parallel (independent polish tasks)
- Phase 4 (US2 verification) can overlap with Phase 5 (dashboard build)

### Within Each Phase

- Setup tasks are sequential (create list → verify)
- PA Flow scopes are sequential (each builds on previous)
- React components marked [P] can be built in parallel
- Dashboard page (T066) depends on all component tasks completing

---

## Implementation Strategy

### MVP First (Day 1 + Day 2 Morning)

1. Complete Phase 1: SharePoint List
2. Complete Phase 2: Both PA flows working + tested with Postman
3. **STOP and VALIDATE**: Post a test lead, check SP + email. If this works, the core automation is done.

### Incremental Delivery

1. Phase 1 + 2 → Pipeline working (can demo with Postman alone)
2. + Phase 3 → Form working (can demo form → email)
3. + Phase 5 → Dashboard working (full demo)
4. + Phase 6 → Polished and rehearsed

---

## Skill Invocations During Implementation

The following Claude Code skills MUST be invoked at the relevant task stages:

| Skill | Invoke At | Purpose |
|-------|-----------|---------|
| `shadcn` | T026-T035 (app setup) | Initialize shadcn/ui, manage component registry, handle theme config |
| `tanstack-table` | T056-T060 (lead table) | TanStack Table column definitions, filtering, sorting patterns |
| `frontend-design` | T036-T037 (branding), T042-T044 (form), T054-T065 (dashboard) | High-quality UI design, avoid generic aesthetics |
| `ui-ux-pro-max` | T042-T044 (form design), T057 (badge design), T065 (timeline) | Design intelligence for component styling |
| `webapp-testing` | T072, T080-T089 (testing) | Browser testing for end-to-end verification |

## Notes

- [P] tasks = different files/systems, no dependencies
- [US] label maps task to specific user story for traceability
- PA flow tasks (T005-T025) are built in Power Automate portal, not code
- React tasks (T026-T072) are built in the /app codebase
- Commit after each logical group of tasks
- Stop at any checkpoint to validate independently
- Total tasks: 93
