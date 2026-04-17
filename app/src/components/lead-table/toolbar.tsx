import { type ProcessingStatus } from '@/lib/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type ToolbarProps = {
  temperatureFilter: string
  statusFilter: string
  onTemperatureChange: (value: string) => void
  onStatusChange: (value: string) => void
}

const statuses: ProcessingStatus[] = [
  'Received',
  'Enriched',
  'AI Processed',
  'Notified',
  'Complete',
  'Error',
]

export function LeadTableToolbar({
  temperatureFilter,
  statusFilter,
  onTemperatureChange,
  onStatusChange,
}: ToolbarProps) {
  return (
    <div className='flex flex-col gap-3 pb-4 sm:flex-row sm:items-center'>
      <Select value={temperatureFilter} onValueChange={onTemperatureChange}>
        <SelectTrigger className='w-full sm:w-48'>
          <SelectValue placeholder='Temperature' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Temperatures</SelectItem>
          <SelectItem value='hot'>Hot</SelectItem>
          <SelectItem value='warm'>Warm</SelectItem>
          <SelectItem value='cold'>Cold</SelectItem>
          <SelectItem value='unknown'>Unknown</SelectItem>
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className='w-full sm:w-56'>
          <SelectValue placeholder='Status' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Statuses</SelectItem>
          {statuses.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
