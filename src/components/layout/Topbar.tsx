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
  
  // If the segment looks like a UUID, rename it to "Project"
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentSegment)
  if (isUUID) {
    currentSegment = 'Project'
  }

  const title = currentSegment.charAt(0).toUpperCase() + currentSegment.slice(1)

  return (
    <header className="h-16 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-30 sticky top-0 px-4 flex items-center justify-between gap-4">
      
      {/* Mobile Menu Trigger & Breadcrumb */}
      <div className="flex items-center gap-4">
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-ml-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[260px]">
              {/* Render the appropriate sidebar inside the sheet for mobile */}
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
        
        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
          <span className="capitalize">{isAdminArea ? 'Admin' : 'Dashboard'}</span>
          <span>/</span>
          <span className="font-medium text-foreground">{title}</span>
        </div>
      </div>

      {/* Search Bar (Placeholder) */}
      <div className="flex-1 max-w-md hidden lg:flex">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search certificates, templates..."
            className="w-full bg-muted/50 pl-9 border-none focus-visible:ring-1 focus-visible:bg-background"
          />
        </div>
      </div>

      {/* Right Side: Notifications & Profile */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8 border border-border">
                <AvatarImage src={user?.user_metadata?.avatar_url || ''} alt="Avatar" />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.user_metadata?.full_name || 'User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/settings">Profile Settings</a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/dashboard/subscription">Billing</a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()} className="text-destructive focus:text-destructive cursor-pointer">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
