import { formatDistanceToNowStrict } from 'date-fns'
import { type ColumnDef } from '@tanstack/react-table'
import { type Lead } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { TemperatureBadge } from '@/components/lead-table/temperature-badge'

export const leadColumns: ColumnDef<Lead>[] = [
  {
    accessorKey: 'title',
    header: 'Name',
  },
  {
    accessorKey: 'company',
    header: 'Company',
  },
  {
    accessorKey: 'aiCategory',
    header: 'Temperature',
    cell: ({ row }) => <TemperatureBadge category={row.original.aiCategory} />,
    filterFn: (row, id, value) => {
      if (value === 'all') {
        return true
      }
      return (row.getValue(id) ?? 'unknown') === value
    },
  },
  {
    accessorKey: 'processingStatus',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.processingStatus
      const error = row.original.errorFlag
      return <Badge variant={error ? 'destructive' : 'secondary'}>{status}</Badge>
    },
    filterFn: (row, id, value) => {
      if (value === 'all') {
        return true
      }
      return row.getValue(id) === value
    },
  },
  {
    accessorKey: 'created',
    header: 'Submitted',
    cell: ({ row }) => {
      const value = row.original.created
      return `${formatDistanceToNowStrict(new Date(value), { addSuffix: true })}`
    },
  },
]
