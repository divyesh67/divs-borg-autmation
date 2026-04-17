import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

type InfoTipProps = {
  text: string
}

export function InfoTip({ text }: InfoTipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type='button'
          aria-label='More info'
          className='inline-flex size-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground'
        >
          <Info className='size-3.5' />
        </button>
      </TooltipTrigger>
      <TooltipContent className='max-w-xs text-left leading-relaxed'>{text}</TooltipContent>
    </Tooltip>
  )
}
