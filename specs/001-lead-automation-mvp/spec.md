# Feature Specification: Lead Automation MVP

**Feature Branch**: `001-lead-automation-mvp`
**Created**: 2026-04-16
**Status**: Draft
**Brief**: Borg Hybrid Technical Test — Automation + AI + Microsoft Stack

## What the Brief Requires (Exact)

| Layer | Mandatory | Our Choice |
|-------|-----------|------------|
| **1. Input** | Web form OR API endpoint. Capture: name, company, message, email | React web form (shadcn/ui) |
| **2A. Microsoft** | At least ONE: Power Automate (preferred) or Graph API. Store in SharePoint or Dataverse. Send notification via Outlook or Teams | Power Automate. SharePoint List. Outlook email |
| **2B. External** | Call an external API. Store enriched data back into Microsoft | Abstract API (company enrichment). Store in SharePoint |
| **3. AI** | Categorise (hot/warm/cold) OR summarise intent. Output feeds back into workflow | Both: categorise + summarise. OpenAI API via HTTP action. Result stored in SharePoint |
| **4. Output** | Dashboard (simple UI) OR structured report. Show: lead status, AI output, processing steps | Dashboard built on shadcn-admin (Vite + React 19). Data table with filters. Sheet slide-out for lead detail. Visual processing timeline. |
| **Constraints** | Event-driven workflow. 1 Microsoft + 1 external integration. Clear data flow. Not standalone. Not theoretical | All satisfied |

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Submit a Lead (Priority: P1)

A visitor opens the public lead form, fills in their name, company, email, and message, and submits. The system confirms receipt and the submission automatically triggers the Power Automate workflow.

**Why this priority**: Entry point for the entire system. Without this, nothing else works.

**Independent Test**: Open form in browser, fill fields, submit, see confirmation.

**Acceptance Scenarios**:

1. **Given** the form is accessible, **When** a visitor fills in all four fields and submits, **Then** a confirmation message appears and Power Automate receives the data
2. **Given** the form is displayed, **When** a visitor submits with empty required fields, **Then** validation errors are shown
3. **Given** the form is displayed, **When** a visitor enters an invalid email, **Then** the form rejects submission with an error

---

### User Story 2 - Automated Pipeline Processing (Priority: P1)

When Power Automate receives the form data, it automatically: creates a SharePoint List item, calls the external enrichment API and stores results, calls the AI API to categorise and summarise the lead, updates the SharePoint record with all results, and sends an Outlook email notification. Each step updates the lead's processing status.

**Why this priority**: This is the core automation the brief is testing — event-driven workflow with Microsoft, external API, and AI integration.

**Independent Test**: Submit a lead via the form, then check SharePoint to verify: record exists with all fields populated (submission data, enrichment data, AI categorisation, AI summary, processing status at each step).

**Acceptance Scenarios**:

1. **Given** a form submission arrives, **When** Power Automate triggers, **Then** a new SharePoint List item is created with the submission fields and status "Received"
2. **Given** a lead record exists, **When** the enrichment step runs, **Then** the Abstract API is called with the company domain, and the response (company name, industry, employee count, location) is stored on the SharePoint item
3. **Given** enrichment is complete, **When** the AI step runs, **Then** the OpenAI API is called with the lead message + enrichment data, and the response (hot/warm/cold category + intent summary) is stored on the SharePoint item
4. **Given** AI processing is complete, **When** the notification step runs, **Then** a Outlook email notification are sent containing the lead name, company, AI category, and AI summary
5. **Given** any step fails, **When** the error is caught, **Then** the SharePoint item is updated with an error flag and the pipeline continues to the next step where possible

---

### User Story 3 - View Leads on Dashboard (Priority: P2)

An operator opens the dashboard page in the React app and sees a list of all leads with their current status, AI output, and processing steps. Selecting a lead shows full details including a visual timeline of processing stages.

**Why this priority**: The output layer that satisfies the brief's requirement to show lead status, AI output, and processing steps.

**Independent Test**: Open dashboard route, verify leads appear with status, AI category, AI summary, and a visual processing timeline.

**Acceptance Scenarios**:

1. **Given** leads exist in SharePoint, **When** the dashboard loads, **Then** a list of leads is displayed showing name, company, AI category (hot/warm/cold), processing status, and submission time
2. **Given** a lead is displayed in the list, **When** the operator selects it, **Then** a detail view shows: original submission, enrichment data, AI summary, AI category, and a visual processing timeline with stages (Received → Enriched → AI Processed → Notified)
3. **Given** no leads exist, **When** the dashboard loads, **Then** an empty state message is shown
4. **Given** a lead had a processing error, **When** viewing its detail, **Then** the failed step is visually indicated on the timeline

---

### Edge Cases

- What if the enrichment API returns no data for the company? Store empty enrichment fields, AI still processes with just the message text
- What if the AI API is unreachable? Mark AI fields as "unavailable", continue to notification step, include note in notification
- What if someone submits the form with gibberish? AI will still categorise it (likely "cold") — no spam filtering for MVP

## Requirements *(mandatory)*

### Functional Requirements

**Input Layer**

- **FR-001**: System MUST provide a web form (React + shadcn/ui) capturing name, company, email, and message
- **FR-002**: Form MUST validate required fields and email format before submission
- **FR-003**: Form MUST display confirmation on successful submission
- **FR-004**: Form MUST POST directly to the Power Automate HTTP trigger URL

**Automation Layer — Microsoft**

- **FR-005**: Power Automate flow MUST trigger automatically when the form POSTs data (event-driven, not manual)
- **FR-006**: Flow MUST create a SharePoint List item for each submission
- **FR-007**: Flow MUST send an Outlook email with lead details and AI output
- **FR-008**: Outlook notification MUST include "HOT LEAD" in subject when AI categorises as hot
- **FR-009**: Flow MUST update the SharePoint item's processing status at each stage

**Automation Layer — External**

- **FR-010**: Flow MUST call the Abstract API Company Enrichment endpoint with the lead's company domain/email
- **FR-011**: Flow MUST store the enrichment response (company name, industry, employee count, location) back into the SharePoint item

**AI Layer**

- **FR-012**: Flow MUST call the OpenAI API via HTTP action with the lead message and enrichment data
- **FR-013**: AI MUST return a categorisation (hot, warm, or cold) AND an intent summary
- **FR-014**: AI output MUST be stored on the SharePoint item (feeds back into workflow, not just displayed)
- **FR-015**: AI category MUST influence the notification content (e.g., "HOT LEAD" in subject for hot leads)

**Output Layer**

- **FR-016**: Dashboard MUST be a route in the same React app as the form
- **FR-017**: Dashboard MUST read lead data from SharePoint via a second Power Automate flow (HTTP trigger that returns JSON)
- **FR-018**: Dashboard MUST show lead status, AI output (category + summary), and processing steps for each lead
- **FR-019**: Dashboard MUST display processing steps as a visual timeline (Received → Enriched → AI Processed → Notified)

### Key Entities

- **Lead**: A SharePoint List item containing: Name, Company, Email, Message, ProcessingStatus, EnrichmentData (industry, employee count, location), AICategory (hot/warm/cold), AISummary, ErrorFlag, StepHistory (JSON string of stages with timestamps)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A submitted lead appears as a fully processed SharePoint item within 2 minutes
- **SC-002**: Every processed lead has enrichment data, AI category, and AI summary stored in SharePoint
- **SC-003**: Every processed lead triggers an Outlook email notification
- **SC-004**: The dashboard displays all leads with their status, AI output, and processing timeline
- **SC-005**: The system is event-driven — no manual scripts or button clicks after form submission
- **SC-006**: Data flows clearly: Form → Power Automate → SharePoint → Enrichment API → AI API → SharePoint → Outlook → Dashboard
- **SC-007**: When AI or enrichment fails, the pipeline continues and the error is visible on the dashboard

## UI Design Decisions

### Branding
- **App name**: "LeadFlow for Borg" (or similar — personal touch without using their logo)
- **Colour palette**: Match Borg's identity — **black + red** primary, clean white background, red accent for CTAs and hot badges
- **Theme**: Light mode only (no dark mode toggle — keep it clean)
- **Base template**: shadcn-admin (Vite + React 19 + TanStack Router + shadcn/ui), cloned into `/app` folder, stripped of auth/settings/tasks/apps/chats

### Form Page (`/submit`)
- **Layout**: Single-page centered card with headline "Get in touch"
- **Fields**: name, company, email, message (4 fields, all required)
- **Validation**: Required fields + email format (React Hook Form + Zod)
- **Submit UX**: Animated checkmark — button transforms into green checkmark with "Lead submitted successfully! Our system is processing it now."
- **Accessibility**: Also accessible as standalone page AND from the sidebar
- **Style**: Clean, professional, minimal — like a Stripe contact form

### Dashboard Page (`/dashboard`)
- **Sidebar**: Two nav items — Dashboard + Submit Lead. Logo at top.
- **Stats bar**: 4 metric cards at top — Total Leads, Hot Leads, Avg Processing Time, Success Rate
- **Lead table**: TanStack Table with sorting, filtering, pagination
  - **Temperature display**: Coloured dot + text (professional yet beautiful: ● Hot in red, ● Warm in amber, ● Cold in blue)
  - **Columns**: Name, Company, Temperature, Status, Submitted time
  - **Click row**: Opens Sheet (slide-out panel) from right
- **Lead detail Sheet**:
  - Submission details (name, company, email, message)
  - Enrichment data (industry, employees, location)
  - AI output (category + summary)
  - **Processing timeline**: Vertical stepper with icons — green checkmark for done, red X for failed, gray circle for pending. Timestamps on the right.
- **Empty state**: Illustrated empty state with friendly onboarding text explaining what the dashboard shows and a CTA button "Submit your first lead" linking to the form. Not complicated — just helpful context for first-time users.

### App Structure
- Form available both as standalone public page (`/submit`) and from the sidebar
- Dashboard is the default route (`/`)
- Same React app, shared layout (sidebar + header) for dashboard routes

## Assumptions

- No authentication required for the form or dashboard — this is a demo project
- The Power Automate HTTP trigger URL is acceptable to expose in frontend code for a demo
- Abstract API free tier (100 requests) is sufficient for demo purposes
- OpenAI API key is available and working
- M365 tenant has Power Automate, SharePoint, and Outlook available (Teams not required)
- The React app is based on shadcn-admin (Vite + TanStack Router + shadcn/ui), cloned into /app within this monorepo
- Auth pages, settings, tasks, apps, chats are stripped from shadcn-admin; only the app shell, data table, cards, badges, theme, and error pages are kept
- Lead detail view opens as a Sheet (slide-out panel) from the right when clicking a table row
- The React app is deployed somewhere accessible (Vercel, localhost, or Azure — to be decided)
- Two Power Automate flows are needed: one for processing leads, one for serving dashboard data
- The brief says "categorise OR summarise" but we do both since it's one API call
- The brief says "Teams OR Outlook" — we use Outlook (Teams not available in tenant)
- SharePoint List columns are created manually in the SharePoint portal before building the flow
