import { Flame, Gauge, Timer, Users } from 'lucide-react'
import { type Lead } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type StatsCardsProps = {
  leads: Lead[]
}

function toMinutes(start: string, end: string): number {
  return Math.max(0, (+new Date(end) - +new Date(start)) / (1000 * 60))
}

function findStageTime(lead: Lead, stage: string): string | null {
  return lead.stepHistory.find((entry) => entry.stage === stage)?.timestamp ?? null
}

export function StatsCards({ leads }: StatsCardsProps) {
  const totalLeads = leads.length
  const hotLeads = leads.filter((lead) => lead.aiCategory === 'hot').length

  const completedMinutes = leads
    .map((lead) => {
      const received = findStageTime(lead, 'Received')
      const complete = findStageTime(lead, 'Complete')
      if (!received || !complete) {
        return null
      }
      return toMinutes(received, complete)
    })
    .filter((value): value is number => value !== null)

  const avgProcessingTime =
    completedMinutes.length > 0
      ? completedMinutes.reduce((sum, value) => sum + value, 0) / completedMinutes.length
      : 0

  const successRate =
    totalLeads === 0
      ? 0
      : (leads.filter((lead) => !lead.errorFlag).length / totalLeads) * 100

  const cards = [
    {
      label: 'Total Leads',
      value: totalLeads.toString(),
      helper: 'Captured submissions',
      icon: Users,
      valueClassName: 'text-foreground',
    },
    {
      label: 'Hot Leads',
      value: hotLeads.toString(),
      helper: 'High intent opportunities',
      icon: Flame,
      valueClassName: 'text-primary',
    },
    {
      label: 'Avg Processing Time',
      value: `${avgProcessingTime.toFixed(1)} min`,
      helper: 'Received to Complete',
      icon: Timer,
      valueClassName: 'text-foreground',
    },
    {
      label: 'Success Rate',
      value: `${successRate.toFixed(0)}%`,
      helper: 'Pipeline runs without errors',
      icon: Gauge,
      valueClassName: 'text-foreground',
    },
  ]

  return (
    <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
      {cards.map(({ label, value, helper, icon: Icon, valueClassName }) => (
        <Card key={label} className='border-primary/10'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>{label}</CardTitle>
            <Icon className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${valueClassName}`}>{value}</p>
            <p className='text-xs text-muted-foreground'>{helper}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
