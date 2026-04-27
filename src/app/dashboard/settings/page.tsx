'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Settings as SettingsIcon, User, Palette, Bell, Sun, Moon, Monitor, Save, Loader2, CreditCard, CheckCircle2, Shield, Activity, Fingerprint, Trash2, Mail, ExternalLink, Sparkles } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

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

      const { data: subData } = await supabase.from('subscriptions').select('*').eq('user_id', user.id).single()
      const metaPlan = user.user_metadata?.plan
      if (subData && subData.plan === 'pro') {
         setSubscription(subData)
      } else if (metaPlan) {
         setSubscription({ plan: metaPlan })
      }

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

  useEffect(() => { loadSettings() }, [loadSettings])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings, theme: theme }),
      })
      if (!res.ok) throw new Error('Failed to save')
      toast.success('Preferences synchronized successfully.')
    } catch {
      toast.error('Sync failed. Please check connection.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
        <p className="text-xs font-black tracking-widest text-muted-foreground uppercase">Syncing Cloud Profile...</p>
      </div>
    )
  }

  return (
    <div className="space-y-12 pb-20 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Control Center</h1>
          <p className="text-muted-foreground text-base font-medium mt-1">Orchestrate your account architecture and workspace dynamics.</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="rounded-2xl h-11 px-6 font-bold shadow-xl shadow-primary/20 gap-2"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Synchronizing...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Nav (Desktop) / Tab Bar (Mobile) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="glass-card border-none rounded-[2rem] p-6 shadow-xl shadow-black/5">
             <div className="flex flex-col items-center text-center pb-8 border-b border-slate-100 dark:border-white/5">
                <div className="relative group">
                   <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-3xl font-black shadow-2xl relative z-10">
                      {settings.display_name?.charAt(0) || userEmail.charAt(0).toUpperCase()}
                   </div>
                   <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 p-2 rounded-xl shadow-xl border border-slate-100 dark:border-white/10 z-20">
                      <Sparkles className="h-4 w-4 text-primary" />
                   </div>
                </div>
                <h3 className="mt-6 text-xl font-black tracking-tight">{settings.display_name || 'Production User'}</h3>
                <p className="text-sm text-muted-foreground font-medium truncate w-full px-4">{userEmail}</p>
                <div className="mt-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                   {subscription.plan === 'pro' ? 'Enterprise Node' : 'Basic Tier'}
                </div>
             </div>

             <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-muted-foreground px-2">
                   <span>Node Statistics</span>
                   <Activity className="h-3 w-3" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-50 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                      <p className="text-2xl font-black tracking-tighter">{stats.qrs}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Deployments</p>
                   </div>
                   <div className="bg-slate-50 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                      <p className="text-2xl font-black tracking-tighter">{stats.scans}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Signals</p>
                   </div>
                </div>
             </div>
          </Card>
          
          <Card className="glass-card border-none rounded-[2rem] p-6 shadow-xl shadow-black/5 bg-primary/[0.02]">
             <h4 className="text-sm font-black tracking-tight mb-2">Member Since</h4>
             <p className="text-xs text-muted-foreground font-medium mb-4">{createdDate}</p>
             <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 w-fit px-3 py-1.5 rounded-xl">
                <Fingerprint className="h-3 w-3" />
                ID: {userId?.split('-')[0]}
             </div>
          </Card>
        </div>

        {/* Main Settings Content */}
        <div className="lg:col-span-8 space-y-8">
          {/* Identity Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 px-4">
               <User className="h-5 w-5 text-primary" />
               <h2 className="text-lg font-black tracking-tight">Identity Framework</h2>
            </div>
            <Card className="glass-card border-none rounded-[2rem] p-8 shadow-xl shadow-black/5">
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Legal Entity Name</Label>
                  <Input 
                    id="name"
                    value={settings.display_name}
                    onChange={(e) => setSettings(s => ({ ...s, display_name: e.target.value }))}
                    placeholder="Enter production name..."
                    className="h-12 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border-slate-200/50 dark:border-white/5 focus:ring-primary/20 text-base font-bold"
                  />
                </div>
                <div className="space-y-2 opacity-60 grayscale">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Routing Email (Locked)</Label>
                  <div className="flex items-center gap-3 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 px-4 text-sm font-bold text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {userEmail}
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Visual Dynamics */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 px-4">
               <Palette className="h-5 w-5 text-primary" />
               <h2 className="text-lg font-black tracking-tight">Interface Dynamics</h2>
            </div>
            <Card className="glass-card border-none rounded-[2.5rem] p-8 shadow-xl shadow-black/5">
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { value: 'light', label: 'Light', icon: Sun },
                    { value: 'dark', label: 'Dark', icon: Moon },
                    { value: 'system', label: 'System', icon: Monitor },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSettings(s => ({ ...s, theme: opt.value as any }))
                        setTheme(opt.value)
                      }}
                      className={cn(
                        "flex flex-col items-center gap-3 p-5 rounded-3xl border-2 transition-all group",
                        theme === opt.value
                          ? "border-primary bg-primary/[0.03] shadow-lg shadow-primary/5"
                          : "border-slate-100 dark:border-white/5 hover:border-primary/30"
                      )}
                    >
                      <div className={cn(
                        "p-3 rounded-2xl transition-all",
                        theme === opt.value ? "bg-primary text-white scale-110 shadow-xl shadow-primary/30" : "bg-slate-100 dark:bg-white/5 text-muted-foreground group-hover:scale-105"
                      )}>
                        <opt.icon className="h-5 w-5" />
                      </div>
                      <span className={cn(
                        "text-xs font-black uppercase tracking-widest",
                        theme === opt.value ? "text-primary" : "text-muted-foreground"
                      )}>{opt.label}</span>
                    </button>
                  ))}
               </div>
            </Card>
          </section>

          {/* Comms Protocol */}
          <section className="space-y-4">
             <div className="flex items-center gap-3 px-4">
                <Bell className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-black tracking-tight">Signal Protocol</h2>
             </div>
             <Card className="glass-card border-none rounded-[2rem] p-8 shadow-xl shadow-black/5">
                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                      <p className="text-sm font-black tracking-tight">Deployment Alerts</p>
                      <p className="text-[11px] font-medium text-muted-foreground">Receive real-time signal activity and node health digests.</p>
                   </div>
                   <Switch 
                     checked={settings.email_notifications}
                     onCheckedChange={(v) => setSettings(s => ({ ...s, email_notifications: v }))}
                     className="data-[state=checked]:bg-primary"
                   />
                </div>
             </Card>
          </section>

          {/* Danger Zone */}
          <section className="space-y-4 pt-10">
             <div className="flex items-center gap-3 px-4">
                <Trash2 className="h-5 w-5 text-red-500" />
                <h2 className="text-lg font-black tracking-tight text-red-500">Danger Zone</h2>
             </div>
             <Card className="border-2 border-red-500/20 bg-red-500/[0.02] rounded-[2.5rem] p-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                   <div className="space-y-1 text-center sm:text-left">
                      <p className="text-sm font-black text-red-500">Purge Account Lifecycle</p>
                      <p className="text-[11px] font-medium text-red-500/60 max-w-sm">This action immediately terminates all dynamic routing nodes and deletes telemetry data.</p>
                   </div>
                   <Button variant="destructive" className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-10 px-6 shadow-xl shadow-red-500/20">
                      Terminate Account
                   </Button>
                </div>
             </Card>
          </section>
        </div>
      </div>
    </div>
  )
}
