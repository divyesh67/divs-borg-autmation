import { Card, CardContent } from '@/components/ui/card'

const services = ['Power Automate', 'SharePoint', 'OpenAI', 'Outlook']

export function SystemStatus() {
  return (
    <Card>
      <CardContent className='flex flex-wrap items-center gap-3 py-4'>
        {services.map((service) => (
          <div
            key={service}
            className='inline-flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-xs'
          >
            <span className='size-2 rounded-full bg-emerald-500' />
            <span className='font-medium'>{service}</span>
            <span className='text-muted-foreground'>Operational</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
