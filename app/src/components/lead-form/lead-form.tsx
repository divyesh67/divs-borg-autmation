import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { submitLead } from '@/lib/api'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

const leadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  company: z.string().min(1, 'Company is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  message: z
    .string()
    .min(1, 'Message is required')
    .max(2000, 'Message must be 2000 characters or less'),
})

type LeadFormValues = z.infer<typeof leadSchema>

type LeadFormProps = {
  onSuccess: () => void
}

export function LeadForm({ onSuccess }: LeadFormProps) {
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: '',
      company: '',
      email: '',
      message: '',
    },
  })

  async function onSubmit(values: LeadFormValues) {
    try {
      await submitLead(values)
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Submission failed')
    }
  }

  return (
    <Form {...form}>
      <form className='flex flex-col gap-5' onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder='Marco Santos' autoComplete='name' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='company'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <FormControl>
                <Input placeholder='Borg' autoComplete='organization' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='div@test.com' autoComplete='email' {...field} />
              </FormControl>
              <FormDescription>Use a company email to improve enrichment quality.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='message'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Share what you are trying to solve and your timeline.'
                  className='min-h-32'
                  {...field}
                />
              </FormControl>
              <FormDescription>Max 2000 characters.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className='w-full' disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Submitting...' : 'Submit lead'}
        </Button>
      </form>
    </Form>
  )
}
