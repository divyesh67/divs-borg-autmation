import { Check } from 'lucide-react'

export function SuccessAnimation() {
  return (
    <div className='flex flex-col items-center justify-center gap-5 py-8 text-center'>
      <div className='relative'>
        <span className='absolute inset-0 rounded-full bg-emerald-500/30 blur-sm' />
        <div className='relative flex size-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg'>
          <Check className='size-8' />
        </div>
      </div>
      <div className='flex flex-col gap-1'>
        <h3 className='text-xl font-semibold text-foreground'>Lead submitted successfully!</h3>
        <p className='text-sm text-muted-foreground'>Our system is processing it now.</p>
      </div>
    </div>
  )
}
