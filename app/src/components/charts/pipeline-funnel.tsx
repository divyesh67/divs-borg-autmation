import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import { type Lead } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type PipelineFunnelProps = {
  leads: Lead[]
}

type StageKey = 'received' | 'enriched' | 'ai_processed' | 'notified' | 'complete'

type StageStat = {
  key: StageKey
  label: string
  count: number
}

function stageReached(lead: Lead, stage: StageKey): boolean {
  if (stage === 'received') {
    return true
  }

  if (stage === 'enriched') {
    return lead.enrichmentStatus === 'Complete' || lead.enrichmentStatus === 'Failed'
  }

  if (stage === 'ai_processed') {
    return (
      lead.aiCategory !== null ||
      lead.processingStatus === 'AI Processed' ||
      lead.processingStatus === 'Notified' ||
      lead.processingStatus === 'Complete'
    )
  }

  if (stage === 'notified') {
    return (
      lead.notificationStatus === 'Sent' ||
      lead.notificationStatus === 'Failed' ||
      lead.processingStatus === 'Notified' ||
      lead.processingStatus === 'Complete'
    )
  }

  return lead.processingStatus === 'Complete'
}

function buildStats(leads: Lead[]): StageStat[] {
  const stages: Array<{ key: StageKey; label: string }> = [
    { key: 'received', label: 'Received' },
    { key: 'enriched', label: 'Enriched' },
    { key: 'ai_processed', label: 'AI Processed' },
    { key: 'notified', label: 'Notified' },
    { key: 'complete', label: 'Complete' },
  ]

  return stages.map(({ key, label }) => ({
    key,
    label,
    count: leads.filter((lead) => stageReached(lead, key)).length,
  }))
}

export function PipelineFunnel({ leads }: PipelineFunnelProps) {
  const stats = buildStats(leads)

  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='text-base'>Pipeline Funnel</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <div className='h-64 w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={stats} layout='vertical' margin={{ left: 8, right: 24 }}>
              <CartesianGrid strokeDasharray='3 3' horizontal={false} />
              <XAxis type='number' allowDecimals={false} />
              <YAxis type='category' dataKey='label' width={96} />
              <Bar dataKey='count' fill='var(--primary)' radius={[0, 6, 6, 0]}>
                <LabelList dataKey='count' position='right' />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className='flex flex-col gap-2'>
          {stats.slice(1).map((stage, index) => {
            const previous = stats[index]
            const drop = Math.max(previous.count - stage.count, 0)
            const dropPercent = previous.count === 0 ? 0 : Math.round((drop / previous.count) * 100)
            return (
              <div key={stage.key} className='flex items-center justify-between text-sm'>
                <span className='text-muted-foreground'>
                  {previous.label} → {stage.label}
                </span>
                <span className='font-medium'>
                  -{drop} ({dropPercent}%)
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
