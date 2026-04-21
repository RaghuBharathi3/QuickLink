'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, Menu, QrCode, Bell, Sun, Moon, Monitor } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, BarChart3, CreditCard, Settings
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'

const mobileNavItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, exact: true },
  { name: 'QR Codes', href: '/dashboard/qrcodes', icon: QrCode },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const themes = [
    { value: 'light', icon: Sun },
    { value: 'dark', icon: Moon },
    { value: 'system', icon: Monitor },
  ] as const

  const current = themes.find(t => t.value === theme) ?? themes[2]
  const Icon = current.icon

  const cycleTheme = () => {
    const idx = themes.findIndex(t => t.value === theme)
    const next = themes[(idx + 1) % themes.length]
    setTheme(next.value)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full text-muted-foreground hover:text-foreground"
      onClick={cycleTheme}
      title={`Theme: ${current.value}`}
    >
      <Icon className="h-4 w-4" />
    </Button>
  )
}

export function Navbar() {
  const router = useRouter()
  const supabase = createClient()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isActive = (item: typeof mobileNavItems[0]) => {
    if (item.exact) return pathname === item.href
    return pathname === item.href || pathname.startsWith(item.href + '/')
  }

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md sticky top-0 z-40 px-4 md:px-6 border-gray-100 dark:border-neutral-800">
        {/* Mobile logo */}
        <Link href="/dashboard" className="flex md:hidden items-center gap-2 font-bold text-lg">
          <div className="bg-primary/10 p-1.5 rounded-lg">
            <QrCode className="h-4 w-4 text-primary" />
          </div>
          <span>Quicklink</span>
        </Link>

        {/* Desktop spacer */}
        <div className="hidden md:block" />

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
            <Bell className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full px-3 hidden sm:flex"
          >
            <LogOut className="mr-1.5 h-3.5 w-3.5" />
            Log out
          </Button>
          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-xl"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Mobile nav drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="md:hidden fixed top-16 left-0 right-0 z-30 bg-white dark:bg-neutral-900 border-b border-gray-100 dark:border-neutral-800 shadow-lg px-4 py-3 space-y-1"
          >
            {mobileNavItems.map((item) => {
              const active = isActive(item)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-gray-50 dark:hover:bg-neutral-800 hover:text-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
            <div className="pt-2 border-t border-gray-100 dark:border-neutral-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
              >
                <LogOut className="mr-2 h-4 w-4" /> Log out
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
