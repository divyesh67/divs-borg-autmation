# Hybrid Technical Test – Deep-Dive Solution Brief
## Microsoft-Centered Lead Automation with Custom React Visibility Layer

Prepared for: interview-task planning  
Prepared as: architecture and feasibility brief  
Purpose: help shape a **high-impact, realistic, Microsoft-centered implementation** without turning this into a build-order document.

---

## 1) Executive recommendation

### Recommended solution shape
Build a **two-surface solution**:

1. **Public lead intake surface**  
   A simple external web form captures `name`, `company`, `email`, and `message`.

2. **Internal operator surface**  
   A custom **React dashboard** shows lead records, processing state, AI output, and workflow visibility.

Between those two surfaces, use **Power Automate as the orchestration engine** and **SharePoint List as the Microsoft system of record**.

### Recommended architecture
**Public form → thin API layer → Power Automate cloud flow → SharePoint List → external enrichment API → AI classification/summarisation → update SharePoint → Teams/Outlook notification → React dashboard (Microsoft sign-in + Graph read view)**

### Why this is the strongest option
This structure gives you the best combination of:

- **low delivery risk**
- **high Microsoft visibility**
- **clear compliance with the test brief**
- **strong demo story**
- **real end-to-end architecture rather than “just a form and an API”**

The brief explicitly wants:
- an **external input**
- a **triggered/event-driven workflow**
- at least **one Microsoft integration**
- at least **one external API integration**
- an **AI layer whose output feeds back into the workflow**
- an **output layer** that shows lead status, AI output, and processing steps  
Source: uploaded brief. [PDF source: Hybrid Technical Test](file:///mnt/data/Hybrid%20Technical%20Test.pdf)

### Final recommendation in one sentence
Do **not** build this as a standalone app with Microsoft bolted on. Build it as a **Microsoft-centered workflow platform with a custom React visibility layer on top**.

---

## 2) What the task is really testing

The brief looks like a lead automation task, but at interview level it is really testing whether you can:

- translate a vague business process into a system
- make sensible trade-offs under time pressure
- connect Microsoft services with external services
- treat AI as a workflow decision component, not just a chatbot
- produce something demonstrably “enterprise-shaped” without overengineering

That means the interviewer is likely looking for these signals:

### A. Microsoft is the backbone, not decoration
The brief literally labels Microsoft integration as mandatory and says Power Automate is preferred.  
That means your design should make it obvious that:
- the workflow backbone lives in Microsoft
- records are persisted in Microsoft
- team notifications happen in Microsoft
- the platform could evolve further inside the Microsoft ecosystem

### B. The workflow is event-driven
The brief specifically excludes a purely manual script and requires a triggered workflow.  
So the design must show that new inbound lead data automatically moves through the pipeline.

### C. AI output changes the workflow state
The brief says AI output must **feed back into the workflow**, not just be displayed.  
That means the AI result must update data, affect status, influence notifications, or shape the output view.

### D. The output layer should make the system legible
Because you will demonstrate it live, the output layer should make the data journey visible:
- original submission
- enrichment result
- AI result
- current status
- operational notification state
- success/failure visibility

---

## 3) Architecture options considered

There are three realistic architecture families here.

---

## Option A — Power Automate + SharePoint + React dashboard (**recommended**)

### Shape
- External form captures lead
- Backend/API relays request into Power Automate
- Power Automate creates/updates SharePoint item
- Flow calls enrichment + AI
- Flow sends Teams/Outlook notification
- React dashboard reads lead state from SharePoint/Microsoft Graph

### Why it is strong
- Closest to the brief’s preferred Microsoft approach
- Fastest path to a credible end-to-end solution
- Easy to explain in business language
- Easy to demo visually
- Lets you show both low-code orchestration and custom engineering

### Why it is the best fit under deadline
SharePoint is a **standard connector** in Power Automate and is available across Power Automate regions.  
Microsoft’s connector docs list SharePoint as a **Standard** connector for Power Automate, and the SharePoint connector supports core list triggers and actions such as **Create item**, **Update item**, **Get item**, and **Get items**.  
Sources:
- SharePoint connector reference: https://learn.microsoft.com/en-us/connectors/sharepoint/
- SharePoint Power Automate actions/triggers: https://learn.microsoft.com/en-us/sharepoint/dev/business-apps/power-automate/sharepoint-connector-actions-triggers

### Main trade-off
It is not the “most enterprise” data model compared with Dataverse, but for an interview task it is the best balance of feasibility and clarity.

---

## Option B — Power Automate + Dataverse + React dashboard

### Shape
Same pattern as Option A, but Dataverse becomes the primary operational store instead of SharePoint.

### Why it is attractive
Dataverse is architecturally stronger for:
- richer schema control
- relational expansion
- cleaner long-term business application design
- stronger Power Platform story

Microsoft’s documentation confirms Dataverse is available as a **Premium** connector in Power Automate.  
Source: https://learn.microsoft.com/en-us/connectors/commondataserviceforapps/

### Why I do not recommend it as the default
It adds environment/licensing/setup friction that can swallow time.  
The **Power Apps Developer Plan** is free for development and includes Dataverse and Power Automate, but Microsoft states it requires a **work or school email backed by Microsoft Entra ID** and is for **development/test only**, not production.  
Source: https://learn.microsoft.com/en-au/power-platform/developer/plan

### Best use of Dataverse here
Treat Dataverse as:
- a **bonus/upgrade path**
- not the default choice unless your environment is already smooth

---

## Option C — Graph-first custom app with Microsoft integrations

### Shape
- External app handles intake
- Custom backend writes to Microsoft via Graph/API
- Custom orchestration handles enrichment/AI
- Power Automate used only for some notifications or secondary actions

### Why it can look impressive
It appears “more engineering heavy.”

### Why it is weaker for this test
It risks failing the spirit of the brief because:
- Microsoft workflow orchestration becomes less central
- Power Automate may look incidental rather than core
- more time goes into plumbing/auth instead of workflow value

### Verdict
Use Graph for the dashboard and possibly identity, but **do not make Graph-first the core story**.

---

## 4) Recommended target architecture

## Core principle
The system should have **one Microsoft-owned source of truth** and **one visible orchestration path**.

### Recommended component map

#### 1. Public intake
A simple external form captures:
- Name
- Company
- Email
- Message

This satisfies the input requirement directly.

#### 2. Thin API boundary
A minimal backend endpoint receives the form submission and forwards it into the workflow layer.

### Why this backend boundary is valuable
It gives you:
- a clean place for validation
- a clean place for rate limiting/basic abuse protection
- a place to hide the Power Automate trigger URL
- flexibility if Power Automate trigger auth is awkward

This is one of the most important design decisions.

Microsoft has documentation for OAuth authentication on the **When an HTTP request is received** trigger, but that feature is explicitly described as **rolling out** and might not yet be available in every region.  
Source: https://learn.microsoft.com/en-us/power-automate/oauth-authentication

That means for an interview task you should **not rely on trigger-level auth as the only protective boundary**.

#### 3. Power Automate orchestration layer
Use a cloud flow as the workflow backbone.

The Power Automate HTTP training material explicitly distinguishes:
- built-in HTTP options
- premium HTTP connectors
- the built-in **When an HTTP request is received** trigger  
Source: https://learn.microsoft.com/en-us/training/modules/http-connectors/

This is a strong fit for an inbound lead event.

#### 4. SharePoint list as the operational record
Store each lead as a SharePoint list item.

This makes Microsoft visibly central:
- the lead exists as a Microsoft business record
- downstream automation updates that record
- the dashboard can read the current state
- the notification references the same source item

#### 5. External enrichment API
Use a public or mock enrichment source to add business metadata.  
The brief explicitly permits a “Clearbit-style mock” or any public API.  
That means the external API does not need to be commercially perfect; it needs to prove integration, transformation, and persistence.

#### 6. AI processing
Use AI to:
- summarise intent
- classify priority (hot/warm/cold)

Both are useful, but the ideal hierarchy is:

- **Primary AI output:** intent summary
- **Secondary AI output:** lead temperature

Why this order works:
- summary makes the system feel intelligent and useful to humans
- temperature creates a workflow-friendly operational flag

#### 7. Microsoft notification
Use either:
- Teams message
- Outlook email
- or both

Microsoft’s Teams connector docs confirm Power Automate can send messages to a Teams channel or group chat using the Teams connector.  
Sources:
- Teams connector reference: https://learn.microsoft.com/en-au/connectors/teams/
- Send message in Teams from Power Automate: https://learn.microsoft.com/en-us/power-automate/teams/send-a-message-in-teams

Office 365 Outlook is documented as a **Standard** connector in Power Automate.  
Source: https://learn.microsoft.com/en-us/connectors/office365/

#### 8. Internal visibility dashboard
Build a custom React dashboard that is clearly an operator/admin view, not a public CRM replacement.

The best dashboard role is:
- give visibility into workflow state
- make processing explainable
- expose lead outcome clearly
- show Microsoft-connected operational data

---

## 5) Why the custom React dashboard is a good idea

This is a very good decision.

If you only use native Microsoft surfaces, the solution may feel functional but not “product-shaped.”  
If you only build a custom app, the solution may feel like Microsoft is secondary.

A custom React dashboard solves that tension:
- it gives you a polished, self-explanatory interface
- it demonstrates engineering skill
- it keeps Microsoft services visible underneath
- it lets you narrate the system in a much stronger way during the demo

### What the dashboard should communicate at a glance
Each lead card or row should make these things obvious:

- who submitted it
- what they want
- whether enrichment succeeded
- what the AI thinks
- whether the system notified the team
- where the lead sits right now

This is what makes the platform self-explanatory.

### The right way to frame it
Do not position it as:
> “I built a dashboard to display the results.”

Position it as:
> “I built an operator view so that the workflow is observable, explainable, and easy to action.”

That sounds substantially more senior.

---

## 6) Recommended access and identity model

There are two different user types implied by this project:

### A. Public lead submitter
This user should **not** need Microsoft authentication.

### B. Internal operator / demo user
This user **should** ideally authenticate with Microsoft.

That means the right split is:

- **public unauthenticated intake**
- **internal authenticated visibility**

This is one of the cleanest architecture choices in the whole design.

---

## 7) Best dashboard authentication approach

There are two reasonable ways to build the internal dashboard.

## Option 1 — Direct React + MSAL + Microsoft Graph (**good for demo visibility**)
Use Microsoft Entra sign-in in the dashboard and read SharePoint list items via Microsoft Graph.

Microsoft has official React SPA guidance using the Microsoft identity platform / MSAL for sign-in.  
Sources:
- https://learn.microsoft.com/en-us/entra/identity-platform/tutorial-single-page-app-react-prepare-app
- https://learn.microsoft.com/en-us/entra/identity-platform/tutorial-single-page-app-react-sign-in-sign-out

Microsoft Graph supports SharePoint list items as first-class resources:
- list item resource: https://learn.microsoft.com/en-us/graph/api/resources/listitem?view=graph-rest-1.0
- list items collection: https://learn.microsoft.com/en-us/graph/api/listitem-list?view=graph-rest-1.0
- get single list item: https://learn.microsoft.com/en-us/graph/api/listitem-get?view=graph-rest-1.0

For **read-only dashboard visibility**, Graph permissions can stay lighter:
- `Sites.Read.All` is sufficient for reading list items
Source: https://learn.microsoft.com/en-us/graph/api/listitem-list?view=graph-rest-1.0

### Why this option is strong
- shows Microsoft identity usage
- shows Graph familiarity
- looks modern and professional
- keeps your dashboard clearly tied to Microsoft data

### Main trade-off
You add app registration and auth configuration work.

---

## Option 2 — React dashboard + backend proxy (**best if auth complexity becomes annoying**)
React calls your backend; backend reads SharePoint data and returns a UI-friendly shape.

### Why this option is useful
- simpler UI data fetching
- more control over transformation
- easier to hide Graph complexity
- easier to add aggregated timeline data

### Main trade-off
The Microsoft identity story becomes less obvious unless you still add Microsoft sign-in to the dashboard.

---

## Recommendation on dashboard access
For this task, the best overall position is:

> Use **Microsoft sign-in for the dashboard** and keep the dashboard primarily **read-focused**.

That gives you the Microsoft identity signal without forcing the dashboard to own all the business logic.

### Practical design rule
Let:
- **Power Automate own writes and workflow state changes**
- **React own operator visibility**
- **Graph (or proxy) provide read access**

That division is elegant and interview-friendly.

---

## 8) SharePoint vs Dataverse: the real decision

This is one of the biggest feasibility questions.

## SharePoint as system of record (**recommended default**)

### Why SharePoint wins for this task
- standard connector
- easier setup
- easy list-based schema
- easy to inspect during demo
- easy to use from Power Automate
- very credible within Microsoft 365

### What it is good enough for
- lead records
- statuses
- processing metadata
- AI summaries
- timestamps
- operational comments
- simple dashboard access

### What it is not ideal for
- complex relational domain models
- highly structured enterprise app evolution
- advanced multi-table business logic

For this task, those limitations are acceptable.

---

## Dataverse as system of record (**upgrade path, not default**)

### When Dataverse is worth it
Choose Dataverse only if:
- you already have a working Power Platform environment
- you want to emphasize platform architecture over speed
- you know you can avoid environment friction

### Why it can be worth mentioning
Because it shows you understand maturity paths:
- SharePoint now for speed
- Dataverse later for scale/governance/schema maturity

That is a very strong analyst-style recommendation.

---

## 9) Recommended record design

A major reason many interview demos feel weak is that the record design is too shallow.  
This solution should have a record model that makes the automation observable.

## Suggested lead record fields

### Source / original submission
- LeadId
- SubmittedAt
- Name
- Company
- Email
- Message
- SourceChannel

### Operational status
- ProcessingStatus
- CurrentStage
- LastProcessedAt
- FlowRunReference
- NotificationStatus
- ErrorFlag
- ErrorSummary

### Enrichment
- EnrichmentStatus
- CompanyDomain
- CompanyWebsite
- EnrichmentSummary
- EnrichmentRawJson (optional, text/multiline)

### AI output
- AISummary
- AILeadTemperature
- AIConfidenceOrReasoningNote
- AIProcessedAt

### Visibility / audit
- StepHistoryJson or StepHistoryText
- Owner / AssignedTo (optional)
- DemoNotes (optional)

### Why this matters
This lets the dashboard show not just “the result,” but the **story of the lead through the system**.

That is exactly what the brief’s output requirement is pointing toward.

---

## 10) AI design: how to make it look useful instead of gimmicky

The AI layer is mandatory, but the risk is using it in a shallow way.

### Bad AI implementation
- user enters a message
- AI returns text
- text is displayed somewhere
- no operational effect

That does **not** satisfy the spirit of the brief well.

### Good AI implementation
The AI:
- reads the inbound message
- produces a structured outcome
- writes the outcome into the Microsoft record
- influences notification or status logic
- appears in the dashboard as part of the lead state

That is much stronger.

## Best AI output shape
The AI should return structured JSON such as:

```json
{
  "intent_summary": "Wants pricing and deployment help for a warehouse automation solution.",
  "lead_temperature": "hot",
  "reason": "Clear buying intent, company context present, urgency implied.",
  "recommended_action": "Sales follow-up within 24 hours"
}
```

### Why structured output is best
- easier to persist
- easier to parse
- easier to display in UI
- easier to branch on in workflow
- avoids brittle free-text downstream logic

## Best operational use of AI result
Use the AI result to:
- update `AILeadTemperature`
- update `AISummary`
- optionally set `ProcessingStatus`
- determine whether Teams/Outlook notification uses a “priority” treatment

That means the AI genuinely feeds into the workflow.

---

## 11) Best AI provider choice

There are two realistic paths.

## Path A — Use your existing non-Microsoft AI API keys (**best for speed**)
If you already have OpenAI/Claude access, this is the fastest route.

### Why it is acceptable
The brief allows:
- OpenAI
- Claude
- Azure OpenAI as bonus

So there is no requirement that AI must be Microsoft-native.

### Why it still fits a Microsoft-centered design
Because Microsoft still owns:
- orchestration
- operational record
- notification
- internal visibility

The AI is a capability provider, not the platform backbone.

---

## Path B — Use Azure OpenAI (**best Microsoft purity, higher setup load**)
Azure OpenAI supports REST usage and can be authenticated with either API key or Microsoft Entra ID.  
Sources:
- Quickstart: https://learn.microsoft.com/en-us/azure/cognitive-services/openai/quickstart
- REST reference: https://learn.microsoft.com/en-us/azure/ai-services/openai/reference

### Why it looks good
- stronger Microsoft ecosystem alignment
- cleaner “Azure + Microsoft 365” story

### Why it is not my default recommendation
It can add provisioning/setup burden that is unnecessary for an interview task unless you already have Azure ready.

## Recommendation
Use:
- **existing AI API key** if speed matters most
- **Azure OpenAI** only if the environment is already comfortable and won’t slow you down

---

## 12) External API strategy

The brief requires an external API beyond Microsoft.  
The safest pattern is:

- use one enrichment call
- keep the response mapping simple
- store a concise enrichment summary plus raw payload if useful
- update the Microsoft record with the result

### What matters to the interviewer
Not which enrichment vendor you chose.

What matters is whether you demonstrate:
- outbound API call
- data normalization
- persistence
- data traceability
- downstream use

### Best presentation language
> “I kept the external enrichment deliberately lightweight because the goal of the task is orchestration quality and workflow clarity, not dependency sprawl.”

That sounds mature.

---

## 13) Power Automate flow design principles

This section matters a lot because a messy flow can ruin the credibility of the solution.

## Recommended logical scopes
Microsoft guidance recommends using **scopes** to organize cloud flows and to support try/catch style error handling.  
Sources:
- Organize flows with scopes: https://learn.microsoft.com/en-us/power-automate/guidance/coding-guidelines/create-scopes
- Use scopes in cloud flows: https://learn.microsoft.com/en-us/power-automate/scopes
- Error handling guidance: https://learn.microsoft.com/en-us/power-automate/guidance/coding-guidelines/error-handling

### Ideal scope structure
- **Validate Intake**
- **Create Microsoft Record**
- **Call Enrichment**
- **Run AI**
- **Update Record**
- **Notify Team**
- **Finalize Success**
- **Catch / Error Handling**

### Why this is important
Even if the flow is not huge, scopes make the design:
- readable
- professional
- easy to demo
- easy to troubleshoot

### Error handling posture
Microsoft recommends:
- **Run after** conditions
- **scope-based try/catch**
- retry policy for transient failures  
Source: error handling guidance above.

This matters because a flow demo is much stronger when you can say:
> “I designed for partial failure, not just happy path.”

That is a senior-engineering signal.

---

## 14) Best notification strategy

Notification is mandatory enough to matter, but not where you should spend most of your complexity budget.

## Best primary notification
Use **Teams** if the interview audience is Microsoft-collaboration minded.  
Why:
- looks more modern and operational
- feels like a team workflow, not just email
- supports rich visibility patterns

## Best fallback / parallel notification
Use **Outlook email** if you want guaranteed familiar readability or need a human-readable summary artifact.

### Strong notification content should include
- lead name/company
- short message summary
- AI summary
- lead temperature
- status
- link/reference to the Microsoft record or dashboard

### Strong demo effect
A Teams or email alert makes the system feel alive.  
It shows that the automation is not just storing data — it is creating action.

---

## 15) Best dashboard information architecture

Because you want the platform to be self-explanatory, the UI should feel like an operations console.

## Core dashboard views

### A. Lead list
Columns or cards showing:
- name
- company
- submitted time
- temperature
- processing status
- notification status

### B. Lead detail drawer/page
Shows:
- original message
- enrichment result
- AI summary
- processing timeline
- last updated time
- error section if any

### C. Workflow timeline / processing steps
This is the highest-value visibility element.

Show steps such as:
- received
- stored in SharePoint
- enrichment complete
- AI complete
- notification sent
- complete / failed

This directly addresses the brief’s requirement to show processing steps.

### D. Filtering
Useful filters:
- all / hot / warm / cold
- succeeded / failed / in progress
- recent submissions
- notified / not notified

### UI principle
Avoid making the dashboard look like a blank admin CRUD tool.
It should instead communicate:
- motion
- status
- traceability
- prioritization

---

## 16) Best Microsoft environment strategy

This is a major feasibility issue.

## If you want Microsoft 365 services quickly
The **Microsoft 365 Developer Program** offers a developer sandbox, and Microsoft documents that the **instant sandbox** comes pre-provisioned with **Teams, SharePoint, Outlook, Office**, and also includes **Power Apps** and other sample data.  
Sources:
- overview: https://learn.microsoft.com/en-us/office/developer-program/microsoft-365-developer-program
- FAQ / instant sandbox details: https://learn.microsoft.com/en-us/office/developer-program/microsoft-365-developer-program-faq
- setup: https://learn.microsoft.com/en-us/office/developer-program/microsoft-365-developer-program-get-started

### Why this is attractive
It is arguably the best environment for:
- SharePoint
- Teams
- Outlook
- Microsoft 365-oriented demo data

## If you specifically want Dataverse
The **Power Apps Developer Plan** gives a free development environment with Power Apps, Power Automate, and Dataverse, but requires a **work or school account backed by Microsoft Entra ID**.  
Source: https://learn.microsoft.com/en-au/power-platform/developer/plan

### Best environment recommendation
If setup speed matters:
- **Microsoft 365 sandbox + SharePoint-first** is the safest route

If Dataverse is already easy for you:
- consider it an upgrade path, not a must-have

---

## 17) Why this recommended design will impress in a live demo

A live demo is not just about whether it works.  
It is about whether the system tells a convincing story.

This design demos well because you can show:

1. public lead comes in
2. Microsoft workflow receives it
3. Microsoft record is created
4. external system enriches it
5. AI adds operational meaning
6. Microsoft collaboration channel is notified
7. internal dashboard shows full status and traceability

That sequence is easy for non-technical and technical interviewers alike to follow.

### What the interviewer will likely take away
- you think in systems
- you use Microsoft appropriately rather than superficially
- you can combine low-code and code cleanly
- you understand operational visibility
- you do not confuse complexity with quality

---

## 18) Risks and what they imply architecturally

## Risk 1 — Power Platform environment friction
### Implication
Prefer SharePoint-first over Dataverse-first.

## Risk 2 — Exposing Power Automate HTTP trigger directly
### Implication
Put a small backend/API boundary in front of it.

## Risk 3 — Direct browser-to-Microsoft data access complexity
### Implication
Use MSAL + Graph for read-only visibility, or fall back to a proxy if needed.

## Risk 4 — AI parsing instability
### Implication
Demand structured JSON output and store both summary and categorical result.

## Risk 5 — Flow readability collapsing as logic grows
### Implication
Use scopes and explicit status fields from the start.

## Risk 6 — Demo lacks “why this matters”
### Implication
Make dashboard and notifications focus on actionability and traceability.

---

## 19) Recommended final positioning statement

If you need one concise positioning statement for the solution brief, use this:

> This solution is designed as a Microsoft-centered lead orchestration platform rather than a standalone app. A public intake surface captures inbound leads, Power Automate handles event-driven processing, SharePoint acts as the operational source of truth, external services provide enrichment and AI classification, Microsoft collaboration tools deliver notifications, and a custom React dashboard provides a clear operator view of lead status, AI outcomes, and workflow progression.

That is a strong, senior-sounding description.

---

## 20) Final recommendation

## Best overall choice
Choose **Option A**:

**Public web intake + thin backend + Power Automate + SharePoint + external enrichment + AI + Teams/Outlook + internal React dashboard**

## Why this is the best answer to the task
Because it is:
- clearly compliant with the brief
- visibly Microsoft-centered
- strong in demo form
- realistic to deliver
- technically respectable without being reckless

## What not to do
Do **not**:
- make Microsoft a side integration
- make the dashboard purely cosmetic
- rely on an unauthenticated flow URL as your public boundary
- overinvest in Dataverse if environment setup is uncertain
- make AI output decorative instead of operational

## The most important architectural idea in this whole brief
Keep the project framed as:

> **a workflow platform with Microsoft as the backbone and React as the visibility layer**

That is the strongest balance of feasibility, clarity, and interview impact.

---

## 21) Source notes

### Uploaded task brief
- Hybrid Technical Test PDF: file:///mnt/data/Hybrid%20Technical%20Test.pdf

### Microsoft documentation used
- SharePoint connector reference: https://learn.microsoft.com/en-us/connectors/sharepoint/
- SharePoint connector actions/triggers: https://learn.microsoft.com/en-us/sharepoint/dev/business-apps/power-automate/sharepoint-connector-actions-triggers
- Teams connector reference: https://learn.microsoft.com/en-au/connectors/teams/
- Send a Teams message using Power Automate: https://learn.microsoft.com/en-us/power-automate/teams/send-a-message-in-teams
- Office 365 Outlook connector reference: https://learn.microsoft.com/en-us/connectors/office365/
- Dataverse connector reference: https://learn.microsoft.com/en-us/connectors/commondataserviceforapps/
- Power Apps Developer Plan: https://learn.microsoft.com/en-au/power-platform/developer/plan
- Microsoft 365 Developer Program overview: https://learn.microsoft.com/en-us/office/developer-program/microsoft-365-developer-program
- Microsoft 365 Developer Program FAQ: https://learn.microsoft.com/en-us/office/developer-program/microsoft-365-developer-program-faq
- Set up developer sandbox: https://learn.microsoft.com/en-us/office/developer-program/microsoft-365-developer-program-get-started
- HTTP connectors in Power Automate: https://learn.microsoft.com/en-us/training/modules/http-connectors/
- OAuth authentication for HTTP request triggers: https://learn.microsoft.com/en-us/power-automate/oauth-authentication
- Organize flows with scopes: https://learn.microsoft.com/en-us/power-automate/guidance/coding-guidelines/create-scopes
- Use scopes in cloud flows: https://learn.microsoft.com/en-us/power-automate/scopes
- Power Automate error handling guidance: https://learn.microsoft.com/en-us/power-automate/guidance/coding-guidelines/error-handling
- Microsoft identity platform React SPA tutorial: https://learn.microsoft.com/en-us/entra/identity-platform/tutorial-single-page-app-react-prepare-app
- React sign-in/sign-out tutorial: https://learn.microsoft.com/en-us/entra/identity-platform/tutorial-single-page-app-react-sign-in-sign-out
- Microsoft Graph listItem resource: https://learn.microsoft.com/en-us/graph/api/resources/listitem?view=graph-rest-1.0
- List items API: https://learn.microsoft.com/en-us/graph/api/listitem-list?view=graph-rest-1.0
- Get list item API: https://learn.microsoft.com/en-us/graph/api/listitem-get?view=graph-rest-1.0
- Create list item API: https://learn.microsoft.com/en-us/graph/api/listitem-create?view=graph-rest-1.0
- Microsoft Graph permissions reference: https://learn.microsoft.com/en-us/graph/permissions-reference
- Azure OpenAI quickstart: https://learn.microsoft.com/en-us/azure/cognitive-services/openai/quickstart
- Azure OpenAI REST reference: https://learn.microsoft.com/en-us/azure/ai-services/openai/reference

---
