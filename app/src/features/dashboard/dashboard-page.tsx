import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import { VITE_LOCAL_DEMO, VITE_PA_DATA_URL, VITE_PA_TRIGGER_URL } from '@/config/constants'
import { fetchLeads } from '@/lib/api'
import { clearLocalLeads, seedLocalLeads } from '@/lib/demo-data'
import { type Lead } from '@/lib/types'
import { PipelineFunnel } from '@/components/charts/pipeline-funnel'
import { TemperatureDonut } from '@/components/charts/temperature-donut'
import { LeadsOverTime } from '@/components/charts/leads-over-time'
import { StatsCards } from '@/components/stats/stats-cards'
import { LeadDataTable } from '@/components/lead-table/data-table'
import { LeadSheet } from '@/components/lead-detail/lead-sheet'
import { EmptyState } from '@/components/empty-state/empty-state'
import { SystemStatus } from '@/components/system-status'
import { Button } from '@/components/ui/button'

export function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [temperatureFilter, setTemperatureFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())

  const loadLeads = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    try {
      setError(null)
      if (!silent) {
        setLoading(true)
      }
      const data = await fetchLeads()
      setLeads(data)
      setLastUpdatedAt(Date.now())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads')
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    void loadLeads({ silent: false })
  }, [loadLeads])

  useEffect(() => {
    const id = window.setInterval(() => {
      void loadLeads({ silent: true })
    }, 15_000)
    return () => window.clearInterval(id)
  }, [loadLeads])

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1_000)
    return () => window.clearInterval(id)
  }, [])

  const hasLeads = useMemo(() => leads.length > 0, [leads])
  const showClearLocal =
    VITE_LOCAL_DEMO ||
    !VITE_PA_TRIGGER_URL ||
    !VITE_PA_DATA_URL ||
    VITE_PA_TRIGGER_URL.includes('your-flow') ||
    VITE_PA_DATA_URL.includes('your-flow')
  const secondsAgo = lastUpdatedAt === null ? null : Math.max(0, Math.floor((now - lastUpdatedAt) / 1000))

  return (
    <div className='flex flex-col gap-6 p-4 sm:p-6'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-2xl font-semibold tracking-tight'>Dashboard</h1>
          <p className='text-sm text-muted-foreground'>Lead pipeline visibility across SharePoint + Power Automate.</p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' onClick={() => void loadLeads()}>
            {loading ? (
              <Loader2 data-icon='inline-start' className='animate-spin' />
            ) : (
              <RefreshCw data-icon='inline-start' />
            )}
            Refresh
          </Button>
          <span className='text-xs text-muted-foreground'>
            {secondsAgo === null ? 'Updated just now' : `Updated ${secondsAgo}s ago`}
          </span>
          {showClearLocal ? (
            <>
              <Button
                variant='outline'
                onClick={() => {
                  seedLocalLeads()
                  void loadLeads()
                }}
              >
                Seed Demo Leads
              </Button>
              <Button
                variant='outline'
                onClick={() => {
                  clearLocalLeads()
                  void loadLeads()
                }}
              >
                Clear Local Data
              </Button>
            </>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
          {error}
        </div>
      ) : null}
      {showClearLocal ? (
        <div className='rounded-lg border bg-muted px-4 py-3 text-sm text-muted-foreground'>
          Local demo mode is active. Data is stored in browser local storage.
        </div>
      ) : null}

      <SystemStatus />

      <StatsCards leads={leads} />

      <div className='grid gap-4 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          <PipelineFunnel leads={leads} />
        </div>
        <TemperatureDonut leads={leads} />
      </div>

      <LeadsOverTime leads={leads} />

      {loading ? (
        <div className='rounded-xl border p-10 text-center text-muted-foreground'>Loading leads...</div>
      ) : hasLeads ? (
        <LeadDataTable
          leads={leads}
          temperatureFilter={temperatureFilter}
          statusFilter={statusFilter}
          onTemperatureChange={setTemperatureFilter}
          onStatusChange={setStatusFilter}
          onLeadClick={(lead) => {
            setSelectedLead(lead)
            setSheetOpen(true)
          }}
        />
      ) : (
        <EmptyState />
      )}

      <LeadSheet lead={selectedLead} open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  )
}
