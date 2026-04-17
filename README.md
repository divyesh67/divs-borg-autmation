# LeadFlow for Borg

Lead automation MVP built for the Borg Hybrid Technical Test.

**Live:** https://divs-borg-autmation.vercel.app

## Architecture

```
React Form (Vite + shadcn/ui)
        │ POST
        ▼
Power Automate Flow #1 (HTTP trigger)
        │
        ├─► SharePoint List (system of record)
        ├─► Abstract API (company enrichment)
        ├─► OpenAI gpt-5.4-mini (hot/warm/cold + summary)
        └─► Outlook (notification email, hot leads flagged)

Dashboard ──GET──► Power Automate Flow #2 ──► SharePoint Get items ──► JSON
```

## Stack

- **Frontend:** React 19, Vite, TanStack Router, TanStack Table, shadcn/ui, Recharts, React Hook Form + Zod
- **Orchestration:** Power Automate (HTTP-triggered cloud flow)
- **Storage:** SharePoint List (17 columns)
- **Enrichment:** Abstract API
- **AI:** OpenAI gpt-5.4-mini
- **Notification:** Microsoft 365 Outlook
- **Hosting:** Vercel

## Repo layout

- `app/` — React web app (LeadFlow dashboard + lead-submission form)
- `specs/001-lead-automation-mvp/` — speckit spec, plan, tasks, contracts, data model
- `specs/001-lead-automation-mvp/power-automate-flow1.json` — sanitized PA flow snapshot

## Local dev

```bash
cd app
cp .env.example .env   # fill in VITE_PA_TRIGGER_URL and VITE_PA_DATA_URL
npm install
npm run dev
```

Without PA URLs, the app falls back to local-demo mode (browser localStorage).
