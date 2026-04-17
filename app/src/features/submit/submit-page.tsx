import { useState } from 'react'
import { LeadForm } from '@/components/lead-form/lead-form'
import { SuccessAnimation } from '@/components/lead-form/success-animation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function SubmitPage() {
  const [isComplete, setIsComplete] = useState(false)

  return (
    <div className='flex min-h-[calc(100svh-5rem)] items-center justify-center p-4 sm:p-8'>
      <Card className='w-full max-w-2xl border-primary/20'>
        <CardHeader>
          <CardTitle className='text-3xl tracking-tight'>Get in touch</CardTitle>
          <p className='text-sm text-muted-foreground'>Tell us about your project and a lead will be routed instantly.</p>
        </CardHeader>
        <CardContent>{isComplete ? <SuccessAnimation /> : <LeadForm onSuccess={() => setIsComplete(true)} />}</CardContent>
      </Card>
    </div>
  )
}
