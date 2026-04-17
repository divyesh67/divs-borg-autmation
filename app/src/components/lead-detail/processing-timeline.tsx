import { format } from 'date-fns'
import { CheckCircle2, CircleDashed, XCircle } from 'lucide-react'
import { type Lead, type StepEntry } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const orderedStages: StepEntry['stage'][] = ['Received', 'Enriched', 'AI Processed', 'Notified', 'Complete']

type ProcessingTimelineProps = {
  lead: Lead
}

function findStep(lead: Lead, stage: StepEntry['stage']) {
  return lead.stepHistory.find((entry) => entry.stage === stage)
}

export function ProcessingTimeline({ lead }: ProcessingTimelineProps) {
  const showRawHistory = lead.stepHistory.length === 0 && Boolean(lead.stepHistoryRaw)

  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='text-base'>Processing Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {showRawHistory ? (
          <div className='rounded-md border bg-muted p-3 text-xs text-muted-foreground'>
            {lead.stepHistoryRaw}
          </div>
        ) : (
          <ol className='flex flex-col gap-4'>
            {orderedStages.map((stage) => {
            const step = findStep(lead, stage)
            const isFailed = step?.status === 'failed'
            const isComplete = step?.status === 'success'

            return (
              <li key={stage} className='flex gap-3'>
                <div className='pt-0.5'>
                  {isComplete ? (
                    <CheckCircle2 className='size-4 text-emerald-500' />
                  ) : isFailed ? (
                    <XCircle className='size-4 text-red-500' />
                  ) : (
                    <CircleDashed className='size-4 text-muted-foreground' />
                  )}
                </div>
                <div className='flex-1 text-sm'>
                  <div className='flex items-center justify-between gap-3'>
                    <p className='font-medium'>{stage}</p>
                    <p className='text-xs text-muted-foreground'>
                      {step?.timestamp ? format(new Date(step.timestamp), 'PPp') : 'Pending'}
                    </p>
                  </div>
                  {step?.detail ? (
                    <p className='mt-0.5 text-xs text-muted-foreground'>{step.detail}</p>
                  ) : null}
                </div>
              </li>
            )
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
