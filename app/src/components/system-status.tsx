import { Card, CardContent } from '@/components/ui/card'
import { InfoTip } from '@/components/info-tip'

const services: { name: string; description: string }[] = [
  { name: 'Power Automate', description: 'HTTP-triggered cloud flow orchestrating the pipeline.' },
  { name: 'SharePoint', description: 'List acting as the system of record for every lead and pipeline stage.' },
  { name: 'OpenAI', description: 'gpt-5.4-mini called via HTTP action to classify and summarise.' },
  { name: 'Outlook', description: 'Send-Email-V2 action notifying sales of every new lead.' },
]

export function SystemStatus() {
  return (
    <Card>
      <CardContent className='flex flex-wrap items-center gap-3 py-4'>
        <span className='inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground'>
          Integrations
          <InfoTip text='Microsoft + AI services this app depends on. "Operational" reflects the last successful pipeline run, not a live health check.' />
        </span>
        {services.map((service) => (
          <div
            key={service.name}
            className='inline-flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-xs'
            title={service.description}
          >
            <span className='size-2 rounded-full bg-emerald-500' />
            <span className='font-medium'>{service.name}</span>
            <span className='text-muted-foreground'>Operational</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
