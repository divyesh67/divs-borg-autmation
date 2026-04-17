import { type LeadCategory } from '@/lib/types'
import { Badge } from '@/components/ui/badge'

const categoryStyles: Record<LeadCategory, string> = {
  hot: 'bg-red-100 text-red-700 border-red-200',
  warm: 'bg-amber-100 text-amber-700 border-amber-200',
  cold: 'bg-blue-100 text-blue-700 border-blue-200',
  unknown: 'bg-zinc-100 text-zinc-700 border-zinc-200',
}

const categoryLabels: Record<LeadCategory, string> = {
  hot: 'Hot',
  warm: 'Warm',
  cold: 'Cold',
  unknown: 'Unknown',
}

type TemperatureBadgeProps = {
  category: LeadCategory | null
}

export function TemperatureBadge({ category }: TemperatureBadgeProps) {
  const safeCategory = category ?? 'unknown'

  return (
    <Badge variant='outline' className={categoryStyles[safeCategory]}>
      <span aria-hidden>●</span>
      {categoryLabels[safeCategory]}
    </Badge>
  )
}
