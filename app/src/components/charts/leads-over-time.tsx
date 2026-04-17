import { addDays, eachDayOfInterval, format, startOfDay, subDays } from 'date-fns'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { type Lead } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type LeadsOverTimeProps = {
  leads: Lead[]
}

type SeriesRow = {
  dateKey: string
  label: string
  total: number
  hot: number
}

function buildSeries(leads: Lead[]): SeriesRow[] {
  const end = startOfDay(new Date())
  const start = subDays(end, 6)
  const days = eachDayOfInterval({ start, end: addDays(start, 6) })

  return days.map((day) => {
    const dateKey = format(day, 'yyyy-MM-dd')
    const items = leads.filter((lead) => format(new Date(lead.created), 'yyyy-MM-dd') === dateKey)
    return {
      dateKey,
      label: format(day, 'MMM d'),
      total: items.length,
      hot: items.filter((lead) => lead.aiCategory === 'hot').length,
    }
  })
}

export function LeadsOverTime({ leads }: LeadsOverTimeProps) {
  const data = buildSeries(leads)

  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='text-base'>Leads Over Time (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='h-64 w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={data} margin={{ left: 4, right: 8 }}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='label' />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Area
                type='monotone'
                dataKey='total'
                name='Total leads'
                stroke='var(--primary)'
                fill='var(--primary)'
                fillOpacity={0.2}
              />
              <Area
                type='monotone'
                dataKey='hot'
                name='Hot leads'
                stroke='#f59e0b'
                fill='#f59e0b'
                fillOpacity={0.25}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
