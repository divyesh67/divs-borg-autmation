import { useEffect, useMemo, useState } from 'react'
import {
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { type Lead } from '@/lib/types'
import { leadColumns } from '@/components/lead-table/columns'
import { LeadTableToolbar } from '@/components/lead-table/toolbar'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type LeadDataTableProps = {
  leads: Lead[]
  temperatureFilter: string
  statusFilter: string
  onTemperatureChange: (value: string) => void
  onStatusChange: (value: string) => void
  onLeadClick: (lead: Lead) => void
}

export function LeadDataTable({
  leads,
  temperatureFilter,
  statusFilter,
  onTemperatureChange,
  onStatusChange,
  onLeadClick,
}: LeadDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'created',
      desc: true,
    },
  ])
  const [filters, setFilters] = useState<ColumnFiltersState>([])

  useEffect(() => {
    setFilters([
      { id: 'aiCategory', value: temperatureFilter },
      { id: 'processingStatus', value: statusFilter },
    ])
  }, [temperatureFilter, statusFilter])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: leads,
    columns: leadColumns,
    state: {
      sorting,
      columnFilters: filters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const rows = useMemo(() => table.getRowModel().rows, [table])

  return (
    <div>
      <LeadTableToolbar
        temperatureFilter={temperatureFilter}
        statusFilter={statusFilter}
        onTemperatureChange={onTemperatureChange}
        onStatusChange={onStatusChange}
      />

      <div className='rounded-lg border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  className='cursor-pointer'
                  onClick={() => onLeadClick(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={leadColumns.length} className='h-20 text-center text-muted-foreground'>
                  No leads match the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='mt-3 flex items-center justify-end gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
