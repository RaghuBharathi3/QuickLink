'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, QrCode, Settings, BarChart3, CreditCard, ChevronRight, Palette, LogOut, Crown
} from 'lucide-react'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuPage, DropdownMenuPageTrigger, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem
} from '@/components/ui/cinematic-dropdown'
import { cn } from '@/lib/utils'
import { createClient } from '@/utils/supabase/client'

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, exact: true },
  { name: 'QR Codes', href: '/dashboard/qrcodes', icon: QrCode },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [user, setUser] = React.useState<any>(null)
  const [plan, setPlan] = React.useState<string>('free')

  React.useEffect(() => {
    const fetchAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const userPlan = user.user_metadata?.plan || 'free'
        setPlan(userPlan)
      }
    }
    fetchAuth()
  }, [])

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) return pathname === item.href
    return pathname === item.href || pathname.startsWith(item.href + '/')
  }

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="hidden md:flex h-screen w-64 flex-col bg-white dark:bg-neutral-900 border-r border-gray-100 dark:border-neutral-800 shadow-sm flex-shrink-0"
    >
      {/* Logo */}
      <div className="flex h-16 items-center px-5 border-b border-gray-100 dark:border-neutral-800">
        <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-lg tracking-tight group">
          <div className="bg-primary/10 p-1.5 rounded-lg group-hover:bg-primary/20 transition-colors">
            <QrCode className="h-5 w-5 text-primary" />
          </div>
          <span className="text-foreground">Quicklink</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-2">Main Menu</p>
        {navItems.map((item) => {
          const active = isActive(item)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                  : 'text-muted-foreground hover:bg-gray-50 dark:hover:bg-neutral-800 hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("h-4 w-4", active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                {item.name}
              </div>
              {active && <ChevronRight className="h-3.5 w-3.5 text-primary-foreground/70" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Profile Dropdown */}
      <div className="p-3 mt-auto border-t border-gray-100 dark:border-neutral-800">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full">
            <div className="flex items-center gap-3 w-full px-2 py-2 rounded-xl text-left bg-gradient-to-br from-primary/5 to-blue-50 dark:from-primary/10 dark:to-blue-950/30 border border-primary/10 dark:border-primary/20 hover:border-primary/30 transition-colors">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">
                {user?.email ? user.email[0].toUpperCase() : 'U'}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-foreground truncate flex items-center gap-2">
                  {user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User'}
                  {plan === 'pro' && <span className="px-1.5 py-0.5 rounded text-[9px] bg-primary/20 text-primary uppercase tracking-wider font-bold">PRO</span>}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email || 'Loading...'}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" side="right" align="center" sideOffset={12}>
            {/* Main Menu Page */}
            <DropdownMenuPage id="main">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => window.location.href = '/dashboard/settings'}>
                <Settings className="h-4 w-4 text-foreground/80" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuPageTrigger targetId="theme">
                <Palette className="h-4 w-4 text-foreground/80" />
                <span>Theme Preview</span>
              </DropdownMenuPageTrigger>
              <DropdownMenuPageTrigger targetId="billing">
                <CreditCard className="h-4 w-4 text-foreground/80" />
                <span>Billing</span>
              </DropdownMenuPageTrigger>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 dark:text-red-400">
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuPage>

            {/* Theme Sub-page */}
            <DropdownMenuPage id="theme">
              <DropdownMenuLabel>Appearance</DropdownMenuLabel>
              <DropdownMenuRadioGroup value="system">
                <DropdownMenuRadioItem value="system">System (Auto)</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="light">Light Mode</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">Dark Mode</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuPage>

            {/* Billing Sub-page */}
            <DropdownMenuPage id="billing">
              <DropdownMenuLabel>Current Plan</DropdownMenuLabel>
              <DropdownMenuItem className="opacity-80 pointer-events-none flex justify-between">
                <div className="flex items-center gap-2">
                  {plan === 'pro' ? <Crown className="h-4 w-4 text-primary" /> : <QrCode className="h-4 w-4" />}
                  <span className="capitalize font-semibold">{plan} Tier</span>
                </div>
                {plan === 'pro' && <span className="text-xs text-primary font-bold">ACTIVE</span>}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {plan !== 'pro' && (
                <DropdownMenuItem onClick={() => window.location.href = '/dashboard/billing'} className="text-primary font-semibold">
                  <span>Upgrade to Pro  ✨</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => window.location.href = '/dashboard/billing'}>
                <span>Manage Billing</span>
              </DropdownMenuItem>
            </DropdownMenuPage>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  )
}
