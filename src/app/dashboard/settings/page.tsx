'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Settings as SettingsIcon, User, Palette, Bell, Sun, Moon, Monitor, Save, Loader2, CreditCard, CheckCircle2, Shield, Activity, Fingerprint } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'
import Script from 'next/script'

interface UserSettings {
  display_name: string
  theme: 'light' | 'dark' | 'system'
  email_notifications: boolean
}

const defaultSettings: UserSettings = {
  display_name: '',
  theme: 'system',
  email_notifications: true,
}

export default function SettingsPage() {
  const supabase = createClient()
  const { setTheme, theme } = useTheme()

  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [subscription, setSubscription] = useState<any>({ plan: 'free' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')
  const [createdDate, setCreatedDate] = useState<string>('')
  const [stats, setStats] = useState({ qrs: 0, scans: 0 })

  // Fetch settings from Supabase
  const loadSettings = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      setUserEmail(user.email || '')

      const res = await fetch('/api/settings')
      if (res.ok) {
        const data: UserSettings = await res.json()
        setSettings({
          display_name: data.display_name ?? '',
          theme: data.theme ?? 'system',
          email_notifications: data.email_notifications ?? true,
        })
        if (data.theme) setTheme(data.theme)
      }

      // Fetch Subscriptions Data
      const { data: subData } = await supabase.from('subscriptions').select('*').eq('user_id', user.id).single()
      
      const metaPlan = user.user_metadata?.plan
      if (subData && subData.plan === 'pro') {
         setSubscription(subData)
      } else if (metaPlan) {
         setSubscription({ plan: metaPlan })
      }

      // Fetch QR Code Analytics Data
      const { data: qrData } = await supabase.from('qr_codes').select('*').eq('user_id', user.id)
      if (qrData) {
        setStats({
          qrs: qrData.length,
          scans: qrData.reduce((acc, curr) => acc + (curr.scan_count || 0), 0)
        })
      }
      
      setCreatedDate(new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }))

    } catch {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }, [supabase, setTheme])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  // Real-time subscription for settings
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`user_settings:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_settings',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as UserSettings & { user_id: string }
          if (row) {
            setSettings({
              display_name: row.display_name ?? '',
              theme: row.theme ?? 'system',
              email_notifications: row.email_notifications ?? true,
            })
            if (row.theme) setTheme(row.theme)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase, setTheme])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings, theme: theme }), // Keep sync
      })
      if (!res.ok) throw new Error('Failed to save')
      toast.success('Settings saved!')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const themeOptions = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'system' as const, label: 'System', icon: Monitor },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      <div className="space-y-8 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Account & Billing</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your account preferences, theme layout, and billing configuration.</p>
        </div>
        
        {/* Account Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Supabase Account Data */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }} className="w-full">
            <Card className="glass-card shadow-sm border border-slate-200/60 dark:border-white/[0.08] rounded-3xl overflow-hidden h-full">
              <CardHeader className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-200/50 dark:border-white/[0.05] p-5">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" /> Profile Metadata
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-sm text-muted-foreground flex items-center gap-2"><User className="h-3 w-3" /> Email</span>
                  <span className="text-sm font-medium">{userEmail}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-sm text-muted-foreground flex items-center gap-2"><Fingerprint className="h-3 w-3" /> Account ID</span>
                  <span className="text-xs font-mono bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded">{userId?.split('-')[0]}•••</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-sm text-muted-foreground flex items-center gap-2"><Activity className="h-3 w-3" /> Member Since</span>
                  <span className="text-sm font-medium">{createdDate}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-muted-foreground">Usage Stats</span>
                  <span className="text-sm font-medium">{stats.qrs} Tags • {stats.scans} Scans</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Profile Settings */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-card border border-slate-200/60 dark:border-white/[0.08] shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="px-6 pt-6 pb-4 border-b border-gray-100/50 dark:border-neutral-800/50 bg-gray-50/20 dark:bg-neutral-800/20">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-muted-foreground" /> Public Profile
              </CardTitle>
              <CardDescription>Update your public display name.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 max-w-md">
                <Label htmlFor="display_name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Display Name</Label>
                <Input
                  id="display_name"
                  value={settings.display_name}
                  placeholder="Your name"
                  onChange={(e) => setSettings(s => ({ ...s, display_name: e.target.value }))}
                  className="rounded-xl bg-slate-50 dark:bg-white/[0.02]"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Theme Settings */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="glass-card border border-slate-200/60 dark:border-white/[0.08] shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="px-6 pt-6 pb-4 border-b border-gray-100/50 dark:border-neutral-800/50 bg-gray-50/20 dark:bg-neutral-800/20">
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="h-4 w-4 text-muted-foreground" /> Appearance
              </CardTitle>
              <CardDescription>Choose your preferred colour theme. Synced immediately.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-3">
                {themeOptions.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => {
                      setSettings(s => ({ ...s, theme: value }))
                      setTheme(value)
                    }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                      theme === value
                        ? 'border-primary bg-primary/5 dark:bg-primary/10 scale-[1.02]'
                        : 'border-slate-200 dark:border-neutral-800 hover:border-primary/40 bg-white dark:bg-neutral-900/50'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${theme === value ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`text-sm font-medium ${theme === value ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Current theme: <span className="font-medium capitalize">{theme}</span>. Save to persist.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications Settings */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card border border-slate-200/60 dark:border-white/[0.08] shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="px-6 pt-6 pb-4 border-b border-gray-100/50 dark:border-neutral-800/50 bg-gray-50/20 dark:bg-neutral-800/20">
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-4 w-4 text-muted-foreground" /> Notifications
              </CardTitle>
              <CardDescription>Control what notifications you receive via email.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Email Notifications</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Receive scan activity digests and billing updates by email.</p>
                </div>
                <Switch
                  checked={settings.email_notifications}
                  onCheckedChange={(v) => setSettings(s => ({ ...s, email_notifications: v }))}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Save Button */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className="rounded-xl w-full sm:w-auto gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving…' : 'Save Settings'}
          </Button>
        </motion.div>
      </div>
    </>
  )
}
