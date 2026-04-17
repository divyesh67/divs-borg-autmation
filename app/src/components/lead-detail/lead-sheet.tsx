import { type Lead } from '@/lib/types'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { SubmissionCard } from '@/components/lead-detail/submission-card'
import { EnrichmentCard } from '@/components/lead-detail/enrichment-card'
import { AIOutputCard } from '@/components/lead-detail/ai-output-card'
import { ProcessingTimeline } from '@/components/lead-detail/processing-timeline'

type LeadSheetProps = {
  lead: Lead | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LeadSheet({ lead, open, onOpenChange }: LeadSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-full overflow-y-auto sm:max-w-xl'>
        {lead ? (
          <>
            <SheetHeader>
              <SheetTitle>{lead.title} · {lead.company}</SheetTitle>
              <SheetDescription>Full processing details for this lead.</SheetDescription>
            </SheetHeader>

            <div className='flex flex-col gap-4 p-4'>
              <SubmissionCard lead={lead} />
              <EnrichmentCard lead={lead} />
              <AIOutputCard lead={lead} />
              <ProcessingTimeline lead={lead} />
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
