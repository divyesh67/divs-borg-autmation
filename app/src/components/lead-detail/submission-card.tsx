import { type Lead } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type SubmissionCardProps = {
  lead: Lead
}

export function SubmissionCard({ lead }: SubmissionCardProps) {
  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='text-base'>Submission</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-1 text-sm'>
        <p><span className='font-medium'>Name:</span> {lead.title}</p>
        <p><span className='font-medium'>Company:</span> {lead.company}</p>
        <p><span className='font-medium'>Email:</span> {lead.email}</p>
        <p><span className='font-medium'>Message:</span> {lead.message}</p>
      </CardContent>
    </Card>
  )
}
