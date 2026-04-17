import { Link, useRouterState } from '@tanstack/react-router'
import { LayoutDashboard, PlusCircle } from 'lucide-react'
import { APP_NAME } from '@/config/constants'
import { cn } from '@/lib/utils'

type NavItem = {
  label: string
  to: '/dashboard' | '/submit'
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Submit Lead',
    to: '/submit',
    icon: PlusCircle,
  },
]

export function AppSidebar() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  return (
    <aside className='w-full border-b bg-white md:min-h-screen md:w-72 md:border-e md:border-b-0'>
      <div className='px-4 py-5 md:px-6'>
        <p className='text-xs font-medium tracking-[0.18em] text-primary uppercase'>Borg</p>
        <h1 className='mt-1 text-lg font-semibold text-foreground'>{APP_NAME}</h1>
      </div>

      <nav className='grid gap-1 px-3 pb-4 md:px-4'>
        {navItems.map(({ label, to, icon: Icon }) => {
          const isActive = pathname === to
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <Icon className='size-4' />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
