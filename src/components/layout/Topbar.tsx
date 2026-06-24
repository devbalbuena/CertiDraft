'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Search, Bell, Menu } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Sidebar } from './Sidebar'
import { AdminSidebar } from './AdminSidebar'

export function Topbar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  
  const isAdminArea = pathname.startsWith('/admin')

  // Create a simple breadcrumb from the pathname
  const segments = pathname.split('/').filter(Boolean)
  let currentSegment = segments[segments.length - 1] || 'Overview'
  
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentSegment)
  if (isUUID) {
    currentSegment = 'Project'
  }

  const title = currentSegment.charAt(0).toUpperCase() + currentSegment.slice(1)

  return (
    <header className="h-16 border-b border-slate-200 bg-white z-30 sticky top-0 px-4 md:px-6 flex items-center justify-between gap-4">
      
      {/* Mobile Menu Trigger & Breadcrumb */}
      <div className="flex items-center gap-4">
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-ml-2 text-slate-500">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[260px] border-r border-slate-200">
              {isAdminArea ? (
                <div className="flex h-full w-full [&>aside]:flex [&>aside]:w-full [&>aside]:border-none">
                  <AdminSidebar />
                </div>
              ) : (
                <div className="flex h-full w-full [&>aside]:flex [&>aside]:w-full [&>aside]:border-none">
                  <Sidebar />
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
        
        <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
          <span className="capitalize">{isAdminArea ? 'Admin' : 'Dashboard'}</span>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-900 tracking-tight">{title}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md hidden lg:flex justify-center ml-auto mr-8">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full bg-slate-50/50 pl-10 border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-600 rounded-full h-9 text-sm transition-all"
          />
        </div>
      </div>

      {/* Right Side: Notifications & Profile */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full">
          <Bell className="h-[18px] w-[18px]" />
          <span className="sr-only">Notifications</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full ml-1 ring-1 ring-slate-200 ring-offset-2 ring-offset-white hover:ring-slate-300">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.user_metadata?.avatar_url || ''} alt="Avatar" />
                <AvatarFallback className="bg-blue-50 text-blue-700 text-xs font-semibold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 rounded-xl border border-slate-200 shadow-lg" align="end" forceMount>
            <DropdownMenuLabel className="font-normal p-3">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold text-slate-900 leading-none">
                  {user?.user_metadata?.full_name || 'User'}
                </p>
                <p className="text-xs leading-none text-slate-500">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem className="text-slate-700 focus:bg-slate-50 focus:text-slate-900 cursor-pointer" asChild>
              <a href="/dashboard/settings">Settings</a>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem onClick={() => signOut()} className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer font-medium">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
