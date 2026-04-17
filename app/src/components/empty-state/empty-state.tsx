import { Link } from '@tanstack/react-router'
import { Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

export function EmptyState() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant='icon'>
          <Inbox />
        </EmptyMedia>
        <EmptyTitle>No leads yet</EmptyTitle>
        <EmptyDescription>
          Submit your first lead to see the automation in action.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link to='/submit'>Submit Lead</Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
