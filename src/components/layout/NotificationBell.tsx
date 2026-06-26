'use client'

import * as React from 'react'
import { Bell, Check, Info, AlertTriangle, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useAuth } from '@/context/AuthContext'
import { usePathname } from 'next/navigation'

export type Notification = {
  id: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
  type: 'info' | 'alert' | 'success'
}

export function NotificationBell() {
  const { user } = useAuth()
  const pathname = usePathname()
  const isAdminArea = pathname.startsWith('/admin')
  
  const storageKey = `certidraft_notifications_${user?.id || 'guest'}`
  
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [isOpen, setIsOpen] = React.useState(false)

  // Load notifications from local storage or set defaults
  React.useEffect(() => {
    if (!user) return
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      setNotifications(JSON.parse(stored))
    } else {
      // Create some mock notifications based on role
      const initial: Notification[] = isAdminArea 
        ? [
            { id: '1', title: 'New User Registration', message: 'A new user just signed up for the Starter plan.', isRead: false, createdAt: new Date().toISOString(), type: 'info' },
            { id: '2', title: 'System Update', message: 'CertiDraft dashboard has been updated successfully.', isRead: false, createdAt: new Date(Date.now() - 86400000).toISOString(), type: 'success' },
          ]
        : [
            { id: '1', title: 'Welcome to CertiDraft!', message: 'Get started by exploring our templates or creating a new project.', isRead: false, createdAt: new Date().toISOString(), type: 'success' },
            { id: '2', title: 'Subscription Active', message: 'Your plan is currently active and ready to use.', isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString(), type: 'info' },
          ]
      setNotifications(initial)
      localStorage.setItem(storageKey, JSON.stringify(initial))
    }
  }, [user, isAdminArea, storageKey])

  const unreadCount = notifications.filter(n => !n.isRead).length

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }))
    setNotifications(updated)
    localStorage.setItem(storageKey, JSON.stringify(updated))
  }

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
    setNotifications(updated)
    localStorage.setItem(storageKey, JSON.stringify(updated))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <ShieldCheck className="h-4 w-4 text-emerald-500" />
      case 'alert': return <AlertTriangle className="h-4 w-4 text-amber-500" />
      default: return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
          <Bell className="h-[18px] w-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-lg z-50">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-auto p-0 text-xs text-blue-600 hover:text-blue-700 hover:bg-transparent">
              <Check className="mr-1 h-3 w-3" /> Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto overflow-x-hidden">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">No notifications</div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`flex gap-3 p-4 text-left border-b border-slate-50 dark:border-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors ${notif.isRead ? 'opacity-60' : 'bg-blue-50/30 dark:bg-blue-900/10'}`}
                >
                  <div className="mt-0.5 shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="space-y-1 w-full">
                    <p className="text-sm font-medium leading-none text-slate-900 dark:text-slate-100">
                      {notif.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <div className="shrink-0 flex items-center">
                      <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
