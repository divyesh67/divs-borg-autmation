import { Outlet } from '@tanstack/react-router'
import { AppSidebar } from '@/components/layout/app-sidebar'

export function AuthenticatedLayout() {
  return (
    <div className='min-h-screen bg-white md:flex'>
      <AppSidebar />
      <main className='flex-1 bg-background'>
        <Outlet />
      </main>
    </div>
  )
}
