import { type Lead } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TemperatureBadge } from '@/components/lead-table/temperature-badge'

type AIOutputCardProps = {
  lead: Lead
}

export function AIOutputCard({ lead }: AIOutputCardProps) {
  const unavailable = lead.aiCategory === 'unknown' || !lead.aiCategory

  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='text-base'>AI Output</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-2 text-sm'>
        <div>
          <span className='mb-1 block font-medium'>Category</span>
          <TemperatureBadge category={lead.aiCategory} />
        </div>
        <div>
          <span className='mb-1 block font-medium'>Summary</span>
          <p className='text-muted-foreground'>
            {unavailable ? 'AI classification unavailable.' : lead.aiSummary || 'No summary returned.'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
