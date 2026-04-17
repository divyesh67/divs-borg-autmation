import { createFileRoute } from '@tanstack/react-router'
import { SubmitPage } from '@/features/submit'

export const Route = createFileRoute('/_authenticated/submit')({
  component: SubmitPage,
})
