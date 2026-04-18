import { type Lead } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type EnrichmentCardProps = {
  lead: Lead
}

export function EnrichmentCard({ lead }: EnrichmentCardProps) {
  const failed = lead.enrichmentStatus === 'Failed'
  const hasAnyData = Boolean(
    lead.enrichmentCompany || lead.enrichmentIndustry || lead.enrichmentEmployees
  )
  const noMatch = !failed && !hasAnyData

  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='text-base'>Enrichment</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-1 text-sm'>
        {failed ? (
          <p className='text-muted-foreground'>Enrichment unavailable — Abstract API call failed.</p>
        ) : noMatch ? (
          <p className='text-muted-foreground'>
            No enrichment match for <span className='font-medium'>{lead.emailDomain || 'this domain'}</span> in Abstract&apos;s
            company database. Common for smaller / regional companies.
          </p>
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
