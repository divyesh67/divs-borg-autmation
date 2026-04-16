# Research: Lead Automation MVP

**Date**: 2026-04-16
**Feature**: 001-lead-automation-mvp

## Decision 1: AI Provider

**Decision**: OpenAI API (gpt-5.4-mini) via HTTP action in Power Automate
**Rationale**: The brief explicitly lists "OpenAI / Claude API" as options. Using OpenAI directly matches the brief's listed options. gpt-5.4-mini is the cheapest model, fast, and sufficient for lead classification. JSON mode (`response_format: json_object`) ensures reliable structured output. Called via standard HTTP POST action in PA — no premium connectors needed.
**Alternatives considered**:
- AI Builder "Run a prompt" — requires premium AI Builder credits, may not be available on dev tenant
- GLM-5.1 — OpenAI-compatible but not listed in the brief, could be questioned
- Azure OpenAI — would earn bonus points but needs Azure provisioning, unnecessary complexity
- Claude API — would work but user has OpenAI key ready

**API endpoint**: `https://api.openai.com/v1/chat/completions`
**Auth**: Bearer token via Authorization header
**Model**: `gpt-5.4-mini`

## Decision 2: Enrichment API

**Decision**: Abstract API Company Enrichment
**Rationale**: Free tier (100 requests), returns structured company data (name, industry, employees, location), simple GET request with API key and domain parameter.
**Alternatives considered**:
- Clearbit — requires paid account
- Hunter.io — focuses on email finding, not company data
- Mock endpoint — user explicitly chose real API over mock

**API endpoint**: `https://companyenrichment.abstractapi.com/v1/?api_key=<key>&domain=<domain>`
**Lookup method**: Extract domain from submitter's email address (split on @, take second part)

## Decision 3: Dashboard Data Access Pattern

**Decision**: Second Power Automate flow with HTTP trigger returns JSON
**Rationale**: No backend server needed. No MSAL/Graph API setup. PA flow queries SharePoint and returns mapped JSON. React dashboard fetches from the PA flow URL. Simplest no-auth approach.
**Alternatives considered**:
- Graph API with MSAL — requires Entra ID app registration, OAuth flow, significant setup
- Node.js backend proxy — adds a server to maintain, not required by brief
- Direct SharePoint REST API — CORS issues, requires authentication

## Decision 4: React App Base

**Decision**: Clone shadcn-admin (satnaing/shadcn-admin) into `/app` folder
**Rationale**: 11.7K stars, MIT license, actively maintained. Includes app shell (sidebar + header), TanStack Table, TanStack Router, React Hook Form + Zod, Recharts, shadcn/ui components, theme system. Saves 2+ days of setup.
**What to keep**: App shell layout, data table, cards, badges, Sheet, form components, error pages
**What to remove**: Auth pages (sign-in, sign-up, forgot, OTP), settings (5 pages), tasks, apps, chats, Clerk integration, dark mode toggle

## Decision 5: Branding

**Decision**: "LeadFlow for Borg" with black + red colour palette
**Rationale**: Matches Borg's brand identity (black text, red "O" in logo). Personal touch ("for Borg") shows it was built specifically for them. Light mode only — clean and professional.

## Decision 6: Form-to-PA Connection

**Decision**: Direct POST from React form to PA HTTP trigger URL
**Rationale**: Simplest possible data flow. No middleware. PA trigger URL stored in `.env` file (acceptable for demo). Brief doesn't require security.
**CORS note**: PA HTTP triggers accept cross-origin requests by default. No CORS configuration needed.

## Decision 7: Notification Channel

**Decision**: Outlook email only (no Teams)
**Rationale**: Teams not available in user's M365 tenant. Brief says "Outlook OR Teams" — one satisfies the requirement. Office 365 Outlook is a standard (free) connector in Power Automate.

## Decision 8: Deployment

**Decision**: To be determined (Vercel, localhost, or Azure)
**Rationale**: Deferred to Day 4. Vite app can run on localhost for demo. Vercel deployment is 2 commands if a public URL is needed.
