import { type Lead, type LeadCategory, type LeadSubmitPayload, type StepEntry } from '@/lib/types'

const STORAGE_KEY = 'leadflow.local.leads'

function classifyCategory(message: string): LeadCategory {
  const text = message.toLowerCase()
  if (
    text.includes('urgent') ||
    text.includes('asap') ||
    text.includes('quote') ||
    text.includes('pricing') ||
    text.includes('buy')
  ) {
    return 'hot'
  }
  if (text.includes('explore') || text.includes('curious') || text.includes('looking')) {
    return 'warm'
  }
  return 'cold'
}

function makeSummary(category: LeadCategory): string {
  if (category === 'hot') {
    return 'Lead has strong buying intent and asks for commercial next steps.'
  }
  if (category === 'warm') {
    return 'Lead shows interest and is likely evaluating options.'
  }
  return 'Lead intent appears low with limited concrete buying signal.'
}

function domainFromEmail(email: string): string {
  const pieces = email.split('@')
  return pieces[1] || 'unknown.local'
}

function loadLeads(): Lead[] {
  if (typeof window === 'undefined') {
    return []
  }
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return []
  }
  try {
    return JSON.parse(raw) as Lead[]
  } catch {
    return []
  }
}

function saveLeads(leads: Lead[]) {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(leads))
}

function buildHistory(now: Date): StepEntry[] {
  const toIso = (offsetMs: number) => new Date(now.getTime() + offsetMs).toISOString()
  return [
    { stage: 'Received', timestamp: toIso(0), status: 'success', detail: 'Lead captured from form' },
    {
      stage: 'Enriched',
      timestamp: toIso(1_000),
      status: 'success',
      detail: 'Demo enrichment completed',
    },
    {
      stage: 'AI Processed',
      timestamp: toIso(2_000),
      status: 'success',
      detail: 'Demo AI classification completed',
    },
    {
      stage: 'Notified',
      timestamp: toIso(3_000),
      status: 'success',
      detail: 'Demo notification simulated',
    },
    {
      stage: 'Complete',
      timestamp: toIso(4_000),
      status: 'success',
      detail: 'Pipeline finalized',
    },
  ]
}

export function createLocalLead(payload: LeadSubmitPayload): Lead {
  const existing = loadLeads()
  const id = existing.length === 0 ? 1 : Math.max(...existing.map((lead) => lead.id)) + 1
  const now = new Date()
  const domain = domainFromEmail(payload.email)
  const category = classifyCategory(payload.message)
  const history = buildHistory(now)

  const lead: Lead = {
    id,
    title: payload.name,
    company: payload.company,
    email: payload.email,
    message: payload.message,
    emailDomain: domain,
    processingStatus: 'Complete',
    enrichmentCompany: payload.company,
    enrichmentIndustry: 'Industrial Services',
    enrichmentEmployees: '51-200',
    enrichmentLocation: 'Australia',
    enrichmentStatus: 'Complete',
    aiCategory: category,
    aiSummary: makeSummary(category),
    notificationStatus: 'Sent',
    errorFlag: false,
    errorSummary: null,
    stepHistory: history,
    stepHistoryRaw: null,
    created: now.toISOString(),
  }

  saveLeads([lead, ...existing])
  return lead
}

export function getLocalLeads(): Lead[] {
  return loadLeads().sort((a, b) => +new Date(b.created) - +new Date(a.created))
}

export function clearLocalLeads() {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.removeItem(STORAGE_KEY)
}

export function seedLocalLeads() {
  const payloads: LeadSubmitPayload[] = [
    {
      name: 'Mia Harris',
      company: 'Atlas Mining',
      email: 'mia@atlasmining.com',
      message: 'We need urgent pricing for NDT inspections across three sites.',
    },
    {
      name: 'Luca Reed',
      company: 'Boreline Services',
      email: 'luca@boreline.io',
      message: 'Exploring options for recurring inspection workflows this quarter.',
    },
    {
      name: 'Nina Cole',
      company: 'Delta Fabrication',
      email: 'nina@deltafab.com',
      message: 'Can you send a quote this week? We are ready to buy.',
    },
    {
      name: 'Tom Kay',
      company: 'Harbor Works',
      email: 'tom@harborworks.net',
      message: 'Just curious what your platform does.',
    },
    {
      name: 'Evan Stone',
      company: 'QuarryTech',
      email: 'evan@quarrytech.com',
      message: 'Looking to evaluate your system with our maintenance team.',
    },
    {
      name: 'Ari Flynn',
      company: 'SteelNorth',
      email: 'ari@steelnorth.co',
      message: 'Need ASAP rollout plan and commercial terms for next month.',
    },
  ]

  clearLocalLeads()
  payloads.forEach((payload) => {
    createLocalLead(payload)
  })
}
