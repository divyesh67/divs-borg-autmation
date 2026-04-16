# Data Model: Lead Automation MVP

**Date**: 2026-04-16

## Entity: Lead

A single SharePoint List item representing one inbound lead and its entire processing lifecycle.

### Fields

| Field | Type | Required | Default | Validation | Description |
|-------|------|----------|---------|------------|-------------|
| Title | Text (255) | Yes | — | Not empty | Lead submitter's name (SP requires Title) |
| Company | Text (255) | Yes | — | Not empty | Submitted company name |
| Email | Text (255) | Yes | — | Valid email format | Submitter's email |
| Message | Multi-line text | Yes | — | Max 2000 chars | Lead inquiry message |
| EmailDomain | Text (255) | No | — | — | Extracted from email (e.g., "acme.com") |
| ProcessingStatus | Choice | Yes | "Received" | One of: Received, Enriched, AI Processed, Notified, Complete, Error | Current pipeline stage |
| EnrichmentCompany | Text (255) | No | — | — | Company name from Abstract API |
| EnrichmentIndustry | Text (255) | No | — | — | Industry from Abstract API |
| EnrichmentEmployees | Text (255) | No | — | — | Employee count range |
| EnrichmentLocation | Text (255) | No | — | — | HQ location |
| EnrichmentStatus | Choice | No | "Pending" | One of: Pending, Complete, Failed | Enrichment stage result |
| AICategory | Choice | No | — | One of: hot, warm, cold, unknown | AI temperature classification |
| AISummary | Multi-line text | No | — | — | AI intent summary (1-2 sentences) |
| NotificationStatus | Choice | No | "Pending" | One of: Pending, Sent, Failed | Outlook email delivery status |
| ErrorFlag | Yes/No | No | No | — | True if any stage failed |
| ErrorSummary | Multi-line text | No | — | — | Error message(s) from failed stages |
| StepHistory | Multi-line text | No | "[]" | Valid JSON array | Processing timeline data |

### StepHistory JSON Schema

```json
[
  {
    "stage": "Received",
    "timestamp": "2026-04-16T14:32:05.000Z",
    "status": "success",
    "detail": null
  },
  {
    "stage": "Enriched",
    "timestamp": "2026-04-16T14:32:12.000Z",
    "status": "success",
    "detail": "Abstract API returned data for acme.com"
  },
  {
    "stage": "AI Processed",
    "timestamp": "2026-04-16T14:32:18.000Z",
    "status": "success",
    "detail": "Classified as hot"
  },
  {
    "stage": "Notified",
    "timestamp": "2026-04-16T14:32:22.000Z",
    "status": "success",
    "detail": "Email sent to operator@company.com"
  }
]
```

Error example:
```json
{
  "stage": "Enriched",
  "timestamp": "2026-04-16T14:32:12.000Z",
  "status": "failed",
  "detail": "Abstract API returned 429 Too Many Requests"
}
```

### State Transitions

```
Received → Enriched → AI Processed → Notified → Complete
    │           │            │            │
    │           │            │            └── on fail → NotificationStatus=Failed, ErrorFlag=true
    │           │            └── on fail → AICategory=unknown, ErrorFlag=true, continue to Notified
    │           └── on fail → EnrichmentStatus=Failed, ErrorFlag=true, continue to AI Processed
    └── on fail → ProcessingStatus=Error (catastrophic — shouldn't happen)
```

### TypeScript Type (for React app)

```typescript
interface Lead {
  id: number;                              // SharePoint item ID
  title: string;                           // Name
  company: string;
  email: string;
  message: string;
  emailDomain: string;
  processingStatus: 'Received' | 'Enriched' | 'AI Processed' | 'Notified' | 'Complete' | 'Error';
  enrichmentCompany: string | null;
  enrichmentIndustry: string | null;
  enrichmentEmployees: string | null;
  enrichmentLocation: string | null;
  enrichmentStatus: 'Pending' | 'Complete' | 'Failed';
  aiCategory: 'hot' | 'warm' | 'cold' | 'unknown' | null;
  aiSummary: string | null;
  notificationStatus: 'Pending' | 'Sent' | 'Failed';
  errorFlag: boolean;
  errorSummary: string | null;
  stepHistory: StepEntry[];
  created: string;                         // ISO 8601 from SharePoint
}

interface StepEntry {
  stage: 'Received' | 'Enriched' | 'AI Processed' | 'Notified' | 'Complete';
  timestamp: string;                       // ISO 8601
  status: 'success' | 'failed';
  detail: string | null;
}
```
