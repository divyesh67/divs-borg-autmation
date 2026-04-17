import { VITE_LOCAL_DEMO, VITE_PA_DATA_URL, VITE_PA_TRIGGER_URL } from '@/config/constants'
import { createLocalLead, getLocalLeads } from '@/lib/demo-data'
import { type Lead, type LeadCategory, type LeadSubmitPayload, type StepEntry } from '@/lib/types'

const DEFAULT_ERROR = 'Unable to complete the request. Please try again.'

function asString(value: unknown): string {
  if (typeof value === 'string') {
    return value
  }
  if (value == null) {
    return ''
  }
  return String(value)
}

function asNullableString(value: unknown): string | null {
  const normalized = asString(value).trim()
  return normalized.length > 0 ? normalized : null
}

function asBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'number') {
    return value === 1
  }
  const normalized = asString(value).toLowerCase()
  return normalized === 'true' || normalized === 'yes' || normalized === '1'
}

function parseStepHistory(value: unknown): { entries: StepEntry[]; raw: string | null } {
  const raw = typeof value === 'string' ? value : null
  const parsed = typeof value === 'string' ? safeJsonParse(value) : value
  if (!Array.isArray(parsed)) {
    return { entries: [], raw }
  }

  const entries = parsed
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null
      }

      const item = entry as Record<string, unknown>
      const stage = asString(item.stage) as StepEntry['stage']
      const timestamp = asString(item.timestamp || item.ts)
      const status = asString(item.status).toLowerCase() === 'failed' ? 'failed' : 'success'
      const detail = asNullableString(item.detail)

      if (!stage || !timestamp) {
        return null
      }

      return {
        stage,
        timestamp,
        status,
        detail,
      }
    })
    .filter((entry): entry is StepEntry => entry !== null)

  return { entries, raw: null }
}

function safeJsonParse(value: string): unknown {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function normalizeCategory(value: unknown): LeadCategory | null {
  const category = asString(value).toLowerCase()
  if (category === 'hot' || category === 'warm' || category === 'cold' || category === 'unknown') {
    return category
  }
  return null
}

function deriveStepHistory(lead: Omit<Lead, 'stepHistory' | 'stepHistoryRaw'>): StepEntry[] {
  const baseTime = new Date(lead.created).getTime() || Date.now()
  const at = (offsetSec: number) => new Date(baseTime + offsetSec * 1000).toISOString()
  const entries: StepEntry[] = [{ stage: 'Received', timestamp: at(0), status: 'success', detail: null }]

  if (lead.enrichmentStatus === 'Complete') {
    entries.push({
      stage: 'Enriched',
      timestamp: at(1),
      status: 'success',
      detail: lead.enrichmentCompany ?? null,
    })
  } else if (lead.enrichmentStatus === 'Failed') {
    entries.push({ stage: 'Enriched', timestamp: at(1), status: 'failed', detail: lead.errorSummary })
  }

  if (lead.aiCategory) {
    const failed = lead.aiCategory === 'unknown'
    entries.push({
      stage: 'AI Processed',
      timestamp: at(2),
      status: failed ? 'failed' : 'success',
      detail: failed ? 'AI classification unavailable' : `Classified as ${lead.aiCategory}`,
    })
  }

  if (lead.notificationStatus === 'Sent') {
    entries.push({ stage: 'Notified', timestamp: at(3), status: 'success', detail: 'Outlook email sent' })
  } else if (lead.notificationStatus === 'Failed') {
    entries.push({ stage: 'Notified', timestamp: at(3), status: 'failed', detail: 'Email send failed' })
  }

  if (lead.processingStatus === 'Complete') {
    entries.push({ stage: 'Complete', timestamp: at(4), status: 'success', detail: null })
  }

  return entries
}

function normalizeLead(rawLead: unknown): Lead {
  const item = (rawLead || {}) as Record<string, unknown>
  const stepHistoryResult = parseStepHistory(item.stepHistory ?? item.StepHistory)

  const base: Omit<Lead, 'stepHistory' | 'stepHistoryRaw'> = {
    id: Number(item.id ?? item.ID ?? item.Id ?? 0),
    title: asString(item.title ?? item.Title),
    company: asString(item.company ?? item.Company),
    email: asString(item.email ?? item.Email),
    message: asString(item.message ?? item.Message),
    emailDomain: asString(item.emailDomain ?? item.EmailDomain),
    processingStatus: asString(item.processingStatus ?? item.ProcessingStatus ?? 'Received') as Lead['processingStatus'],
    enrichmentCompany: asNullableString(item.enrichmentCompany ?? item.EnrichmentCompany),
    enrichmentIndustry: asNullableString(item.enrichmentIndustry ?? item.EnrichmentIndustry),
    enrichmentEmployees: asNullableString(item.enrichmentEmployees ?? item.EnrichmentEmployees),
    enrichmentLocation: asNullableString(item.enrichmentLocation ?? item.EnrichmentLocation),
    enrichmentStatus: asString(item.enrichmentStatus ?? item.EnrichmentStatus ?? 'Pending') as Lead['enrichmentStatus'],
    aiCategory: normalizeCategory(item.aiCategory ?? item.AICategory),
    aiSummary: asNullableString(item.aiSummary ?? item.AISummary),
    notificationStatus: asString(item.notificationStatus ?? item.NotificationStatus ?? 'Pending') as Lead['notificationStatus'],
    errorFlag: asBoolean(item.errorFlag ?? item.ErrorFlag),
    errorSummary: asNullableString(item.errorSummary ?? item.ErrorSummary),
    created: asString(item.created ?? item.Created ?? new Date().toISOString()),
  }

  const stepHistory = stepHistoryResult.entries.length > 1
    ? stepHistoryResult.entries
    : deriveStepHistory(base)

  return { ...base, stepHistory, stepHistoryRaw: stepHistoryResult.raw }
}

function assertConfigured(url: string, key: string) {
  if (!url) {
    throw new Error(`Missing ${key} in app/.env`)
  }
}

function isPlaceholderUrl(url: string) {
  return url.includes('your-flow')
}

function isLocalDemoMode() {
  return (
    VITE_LOCAL_DEMO ||
    !VITE_PA_TRIGGER_URL ||
    !VITE_PA_DATA_URL ||
    isPlaceholderUrl(VITE_PA_TRIGGER_URL) ||
    isPlaceholderUrl(VITE_PA_DATA_URL)
  )
}

async function parseError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string }
    return body.message || DEFAULT_ERROR
  } catch {
    return DEFAULT_ERROR
  }
}

export async function submitLead(payload: LeadSubmitPayload) {
  if (isLocalDemoMode()) {
    const lead = createLocalLead(payload)
    return { status: 'processed', id: lead.id, mode: 'local-demo' }
  }

  assertConfigured(VITE_PA_TRIGGER_URL, 'VITE_PA_TRIGGER_URL')

  const response = await fetch(VITE_PA_TRIGGER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return response.json()
  }

  return { status: 'processed' }
}

export async function fetchLeads(): Promise<Lead[]> {
  if (isLocalDemoMode()) {
    return getLocalLeads()
  }

  assertConfigured(VITE_PA_DATA_URL, 'VITE_PA_DATA_URL')

  const response = await fetch(VITE_PA_DATA_URL)
  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  const body = (await response.json()) as { leads?: unknown[] }
  const leads = Array.isArray(body.leads) ? body.leads.map(normalizeLead) : []

  return leads.sort((a, b) => +new Date(b.created) - +new Date(a.created))
}
