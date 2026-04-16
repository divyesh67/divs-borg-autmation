# Quickstart: Lead Automation MVP

## Prerequisites

- Microsoft 365 tenant with Power Automate, SharePoint, and Outlook
- Node.js 20+ and npm/pnpm
- Abstract API key (stored in `.env`)
- GLM-5.1 API key (stored in `.env`)

## Step 1: Create SharePoint List

1. Go to your SharePoint site
2. Create a new List called **"Leads"**
3. Add all 17 columns as defined in [data-model.md](./data-model.md)
4. Note the site URL and list name for Power Automate

## Step 2: Build Power Automate Flow #1 (Lead Processing)

1. Go to [make.powerautomate.com](https://make.powerautomate.com)
2. Create new → Automated cloud flow
3. Trigger: "When an HTTP request is received"
4. Follow the scope architecture in [plan.md](./plan.md#power-automate-flow-1-lead-processing-pipeline)
5. Build each scope in order:
   - Scope 1: Create SharePoint Record
   - Scope 2: Call Enrichment (with error handling)
   - Scope 3: Run AI Classification (with error handling)
   - Scope 4: Send Outlook Notification
   - Scope 5: Finalize
6. Save the flow and copy the HTTP POST URL
7. Test with Postman using the payload from [pa-trigger.md](./contracts/pa-trigger.md)

## Step 3: Build Power Automate Flow #2 (Dashboard Data API)

1. Create new → Automated cloud flow
2. Trigger: "When an HTTP request is received" (set to GET)
3. Action: SharePoint → Get items (from Leads list, order by Created desc)
4. Action: Select → map fields to frontend-friendly names
5. Action: Response → 200 with JSON body and CORS header
6. Save and copy the HTTP GET URL

## Step 4: Set Up React App

```bash
# From repo root
cd app
npm install
# or: pnpm install

# Create .env in app/ folder
echo "VITE_PA_TRIGGER_URL=<your-flow-1-url>" > .env
echo "VITE_PA_DATA_URL=<your-flow-2-url>" >> .env

# Start dev server
npm run dev
```

## Step 5: Test End-to-End

1. Open `http://localhost:5173/submit`
2. Fill in the form and submit
3. Wait ~1 minute for pipeline processing
4. Check your Outlook inbox for the notification email
5. Open `http://localhost:5173/dashboard`
6. Verify the lead appears with enrichment, AI output, and timeline

## Demo Script

1. Open form → submit a lead
2. Show Power Automate flow running (optional)
3. Check Outlook email notification
4. Open dashboard → show lead in table
5. Click lead → show detail Sheet with timeline
6. Show filter by temperature
7. Narrate: "Microsoft owns the data and orchestration. React provides visibility."
