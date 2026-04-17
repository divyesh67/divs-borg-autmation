export const APP_NAME = 'LeadFlow for Borg'

export const VITE_PA_TRIGGER_URL = import.meta.env.VITE_PA_TRIGGER_URL?.trim() ?? ''
export const VITE_PA_DATA_URL = import.meta.env.VITE_PA_DATA_URL?.trim() ?? ''
export const VITE_LOCAL_DEMO =
  String(import.meta.env.VITE_LOCAL_DEMO ?? '').toLowerCase() === 'true'
