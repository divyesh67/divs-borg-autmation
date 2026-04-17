import { type Lead } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type EnrichmentCardProps = {
  lead: Lead
}

export function EnrichmentCard({ lead }: EnrichmentCardProps) {
  const unavailable = lead.enrichmentStatus === 'Failed'

  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='text-base'>Enrichment</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-1 text-sm'>
        {unavailable ? (
          <p className='text-muted-foreground'>Enrichment unavailable.</p>
        ) : (
          <>
            <p><span className='font-medium'>Company:</span> {lead.enrichmentCompany ?? '—'}</p>
            <p><span className='font-medium'>Industry:</span> {lead.enrichmentIndustry ?? '—'}</p>
            <p><span className='font-medium'>Employees:</span> {lead.enrichmentEmployees ?? '—'}</p>
            <p><span className='font-medium'>Location:</span> {lead.enrichmentLocation ?? '—'}</p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
