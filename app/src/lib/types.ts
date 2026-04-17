export type ProcessingStatus =
  | 'Received'
  | 'Enriched'
  | 'AI Processed'
  | 'Notified'
  | 'Complete'
  | 'Error'

export type EnrichmentStatus = 'Pending' | 'Complete' | 'Failed'
export type LeadCategory = 'hot' | 'warm' | 'cold' | 'unknown'
export type NotificationStatus = 'Pending' | 'Sent' | 'Failed'

export type StepStatus = 'success' | 'failed'

export interface StepEntry {
  stage: 'Received' | 'Enriched' | 'AI Processed' | 'Notified' | 'Complete'
  timestamp: string
  status: StepStatus
  detail: string | null
}

export interface Lead {
  id: number
  title: string
  company: string
  email: string
  message: string
  emailDomain: string
  processingStatus: ProcessingStatus
  enrichmentCompany: string | null
  enrichmentIndustry: string | null
  enrichmentEmployees: string | null
  enrichmentLocation: string | null
  enrichmentStatus: EnrichmentStatus
  aiCategory: LeadCategory | null
  aiSummary: string | null
  notificationStatus: NotificationStatus
  errorFlag: boolean
  errorSummary: string | null
  stepHistory: StepEntry[]
  stepHistoryRaw: string | null
  created: string
}

export interface LeadSubmitPayload {
  name: string
  company: string
  email: string
  message: string
}
