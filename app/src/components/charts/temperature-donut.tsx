import { Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { type Lead } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InfoTip } from '@/components/info-tip'

type TemperatureDonutProps = {
  leads: Lead[]
}

export function TemperatureDonut({ leads }: TemperatureDonutProps) {
  const hot = leads.filter((lead) => lead.aiCategory === 'hot').length
  const warm = leads.filter((lead) => lead.aiCategory === 'warm').length
  const cold = leads.filter((lead) => lead.aiCategory === 'cold').length
  const unknown = leads.filter((lead) => lead.aiCategory === 'unknown' || lead.aiCategory === null).length

  const data = [
    { name: 'Hot', value: hot, fill: 'var(--primary)' },
    { name: 'Warm', value: warm, fill: '#f59e0b' },
    { name: 'Cold', value: cold, fill: '#0ea5e9' },
    { name: 'Unknown', value: unknown, fill: '#71717a' },
  ]

  const total = hot + warm + cold + unknown

  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='flex items-center gap-2 text-base'>
          Lead Temperature Mix
          <InfoTip text='OpenAI gpt-5.4-mini classifies each lead as hot, warm, or cold based on the message + enrichment data. "Unknown" means the AI step failed and the run-after branch defaulted the value.' />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='relative h-64 w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={data}
                dataKey='value'
                nameKey='name'
                innerRadius={68}
                outerRadius={95}
                stroke='var(--background)'
                strokeWidth={2}
              />
              <Tooltip formatter={(value) => [value, 'Leads']} />
            </PieChart>
          </ResponsiveContainer>

          <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
            <div className='text-center'>
              <p className='text-2xl font-semibold'>{total}</p>
              <p className='text-xs text-muted-foreground'>Total Leads</p>
            </div>
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-3 text-xs'>
          {data.map((item) => (
            <div key={item.name} className='inline-flex items-center gap-2'>
              <span className='size-2 rounded-full' style={{ backgroundColor: item.fill }} />
              <span className='text-muted-foreground'>{item.name}</span>
              <span className='font-medium'>{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
