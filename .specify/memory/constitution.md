<!--
Sync Impact Report
===================
Version change: N/A → 1.0.0 (initial ratification)
Modified principles: N/A (initial)
Added sections:
  - Core Principles (5 principles defined)
  - Technology Constraints
  - Development Workflow & Quality Gates
  - Governance
Removed sections: N/A
Templates requiring updates:
  - .specify/templates/plan-template.md — ✅ compatible (Constitution Check
    section references constitution gates generically)
  - .specify/templates/spec-template.md — ✅ compatible (no constitution-
    specific references beyond standard requirement format)
  - .specify/templates/tasks-template.md — ✅ compatible (phase structure
    aligns with principle-driven workflow)
Follow-up TODOs: none
-->

# Lead Automation Platform Constitution

## Core Principles

### I. Microsoft-First

All workflow orchestration, data persistence, and team collaboration
MUST use Microsoft services as the operational backbone. Microsoft is
the system of record, not an afterthought.

- Power Automate MUST own all workflow orchestration and state transitions
- SharePoint List MUST serve as the primary operational data store
- Teams and/or Outlook MUST deliver business notifications
- Custom surfaces (React dashboard) provide visibility into Microsoft-
  owned data; they MUST NOT replace Microsoft as the source of truth
- Any future evolution MUST be evaluable within the Microsoft ecosystem
  before introducing external alternatives

**Rationale**: The project exists to demonstrate Microsoft-centered
platform thinking. Treating Microsoft as a bolt-on integration defeats
the architectural purpose and weakens the demo narrative.

### II. Event-Driven Workflow

Every data transition MUST be triggered by an event, not executed as a
manual script or batch process.

- Inbound lead submission MUST automatically trigger the processing
  pipeline without human intervention
- Each processing stage (validation, record creation, enrichment, AI,
  notification) MUST execute as a discrete, observable step within the
  flow
- The workflow MUST handle partial failure gracefully — a failed
  enrichment MUST NOT block AI processing or notification
- Power Automate scopes MUST organize flow logic into named, readable
  blocks (Validate Intake, Create Record, Call Enrichment, Run AI,
  Update Record, Notify Team, Finalize, Catch/Error)

**Rationale**: The task brief explicitly requires a triggered, event-
driven workflow. A manual or script-based approach fails compliance
with the brief and misrepresents the system's operational capability.

### III. AI as Operational Component

AI output MUST feed back into the workflow and change system state. AI
MUST NOT be decorative or disconnected from the processing pipeline.

- AI MUST return structured JSON output containing at minimum:
  `intent_summary`, `lead_temperature` (hot/warm/cold), and `reason`
- AI results MUST be persisted to the Microsoft record (SharePoint)
- AI classification MUST influence downstream behavior (e.g.,
  notification priority, status assignment)
- AI processing status MUST be tracked as a discrete lifecycle stage
  (Received → Stored → Enriched → AI Processed → Notified)

**Rationale**: The brief requires AI output to "feed back into the
workflow." A display-only AI integration fails this requirement and
appears shallow in a live demo.

### IV. Observability & Traceability

Every lead MUST carry a complete, visible processing history from
intake to final state. The system MUST be self-explanatory.

- Each lead record MUST include: source submission fields, operational
  status fields, enrichment results, AI output, and audit/visibility
  fields
- The React dashboard MUST display the full lead lifecycle timeline
  (Received → Stored → Enriched → AI Processed → Notified)
- Error states MUST be surfaced with an ErrorFlag and ErrorSummary,
  not silently swallowed
- Processing step history MUST be stored per lead (StepHistoryJson or
  equivalent)
- The dashboard MUST support filtering by temperature, status, and
  notification state

**Rationale**: The brief's output requirement points toward showing
"the story of the lead through the system," not just final results.
Traceability is what separates a credible platform from a prototype.

### V. Simplicity & Feasibility

Design decisions MUST favor delivery confidence over architectural
ambition. Complexity MUST be justified against a simpler alternative.

- SharePoint MUST be the default data store; Dataverse is an upgrade
  path, not a prerequisite
- Use existing AI API keys (OpenAI/Claude) over Azure OpenAI unless
  the Azure environment is already provisioned and comfortable
- A thin backend API boundary MUST sit between the public form and
  Power Automate to provide validation, rate limiting, and trigger URL
  protection
- YAGNI applies: do not build features, abstractions, or integrations
  beyond what the brief requires
- Every architectural decision MUST be explainable in one sentence
  during a live demo

**Rationale**: Over-engineering under time pressure creates delivery
risk and demo fragility. The strongest interview signal is a working,
well-reasoned system — not an ambitious, half-finished one.

## Technology Constraints

- **Frontend**: React with Microsoft MSAL for Entra ID sign-in
- **Backend**: Thin API layer (Node.js or equivalent) for form intake
  and optional Graph proxy
- **Orchestration**: Power Automate cloud flows with scope-based
  organization
- **Data Store**: SharePoint List (standard connector); Dataverse
  only as documented upgrade path
- **AI Provider**: OpenAI or Claude API (structured JSON output);
  Azure OpenAI acceptable if environment ready
- **Enrichment**: One external API for company data enrichment
  (Clearbit-style or public equivalent)
- **Identity**: Public intake is unauthenticated; dashboard requires
  Microsoft Entra ID sign-in via MSAL
- **Notifications**: Teams channel message and/or Outlook email via
  Power Automate connectors (both standard connectors)
- **Graph API**: Used for read-only dashboard access to SharePoint
  list items; `Sites.Read.All` permission scope

## Development Workflow & Quality Gates

- **Specification first**: Every feature MUST have a written spec
  with acceptance scenarios before implementation begins
- **Plan before code**: Implementation plans MUST pass a Constitution
  Check gate validating alignment with these principles
- **Incremental delivery**: Work MUST be organized by user story
  priority (P1 → P2 → P3) with each story independently testable
  and demonstrable
- **Commit discipline**: Each logical unit of work MUST be committed
  separately with a descriptive message
- **Demo readiness**: The system MUST be demonstrable end-to-end at
  every milestone — a broken demo path is a blocking issue
- **Error design**: Power Automate flows MUST use scope-based
  try/catch with run-after conditions; happy-path-only flows are
  not acceptable
- **Record completeness**: Every SharePoint list item MUST populate
  all status and audit fields defined in the record schema, even if
  the value is "pending" or "skipped"

## Governance

This constitution is the highest-authority design document for the
Lead Automation Platform. All implementation decisions, code reviews,
and architectural choices MUST comply with the principles defined
above.

- **Supremacy**: Where this constitution conflicts with other project
  documentation, the constitution prevails
- **Amendment procedure**: Any principle change MUST be documented
  with rationale, approved by the project owner, and accompanied by
  a migration plan for affected artifacts
- **Version policy**: Constitution versions follow semantic versioning
  (MAJOR.MINOR.PATCH). MAJOR for principle removals or redefinitions,
  MINOR for new principles or material expansions, PATCH for wording
  and clarification changes
- **Compliance review**: Every implementation plan MUST include a
  Constitution Check section validating alignment before work begins
- **Complexity justification**: Any deviation from the Simplicity
  principle MUST be recorded in the plan's Complexity Tracking table
  with the rejected simpler alternative

**Version**: 1.0.0 | **Ratified**: 2026-04-16 | **Last Amended**: 2026-04-16
