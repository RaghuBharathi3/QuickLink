'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Download, BarChart3, Lock, Zap, Save, Loader2, Globe, Palette, Calendar, QrCode as QrIcon } from 'lucide-react'
import QRCode from 'qrcode'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface QRData {
  id: string
  title: string
  original_url: string
  short_id: string
  is_active: boolean
  scan_count: number
  fg_color?: string
  bg_color?: string
  style_type?: string
  active_from?: string
  expires_at?: string
  password_hash?: string
}

export default function QRCodeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [code, setCode] = useState<QRData | null>(null)
  const [title, setTitle] = useState('')
  const [originalUrl, setOriginalUrl] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#FFFFFF')
  const [activeFrom, setActiveFrom] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchCode = async () => {
      try {
        const res = await fetch(`/api/codes/${id}`)
        if (res.ok) {
          const data: QRData = await res.json()
          setCode(data)
          setTitle(data.title || '')
          setOriginalUrl(data.original_url || '')
          setIsActive(data.is_active)
          setFgColor(data.fg_color || '#000000')
          setBgColor(data.bg_color || '#FFFFFF')
          setActiveFrom(data.active_from ? data.active_from.slice(0, 16) : '')
          setExpiresAt(data.expires_at ? data.expires_at.slice(0, 16) : '')

          const redirectUrl = `${window.location.origin}/qr/${data.short_id}`
          const dataUrl = await QRCode.toDataURL(redirectUrl, {
            width: 600,
            margin: 2,
            color: { dark: data.fg_color || '#000000', light: data.bg_color || '#FFFFFF' },
          })
          setQrDataUrl(dataUrl)
        } else {
          toast.error('Failed to load node configuration')
          router.push('/dashboard/qrcodes')
        }
      } catch {
        toast.error('Infrastructure timeout')
      } finally {
        setLoading(false)
      }
    }
    fetchCode()
  }, [id, router])

  useEffect(() => {
    if (!code) return
    const generate = async () => {
      try {
        const redirectUrl = `${window.location.origin}/qr/${code.short_id}`
        const dataUrl = await QRCode.toDataURL(redirectUrl, {
          width: 600, margin: 2,
          color: { dark: fgColor, light: bgColor },
        })
        setQrDataUrl(dataUrl)
      } catch { /* ignore */ }
    }
    generate()
  }, [fgColor, bgColor, code])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const updates: Record<string, unknown> = {
        title,
        original_url: originalUrl,
        is_active: isActive,
        fg_color: fgColor,
        bg_color: bgColor,
        active_from: activeFrom ? new Date(activeFrom).toISOString() : null,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      }

      const res = await fetch(`/api/codes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (res.ok) {
        toast.success('Configuration synchronized.')
        setCode((prev) => prev ? { ...prev, ...updates } as QRData : null)
      } else {
        const error = await res.json()
        toast.error(error.message || 'Sync failed')
      }
    } catch {
      toast.error('Sync error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
        <p className="text-xs font-black tracking-widest text-muted-foreground uppercase">Scanning Node Parameters...</p>
      </div>
    )
  }

  return (
    <div className="space-y-12 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/qrcodes" className="group p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-primary/10 transition-all">
            <ArrowLeft className="h-5 w-5 group-hover:text-primary transition-colors" />
          </Link>
          <div>
            <h1 className="text-4xl font-black tracking-tight">{code?.title || 'Node Detail'}</h1>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-2 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/10">
                 <span className="text-primary text-[10px] font-black uppercase tracking-widest">ID: {code?.short_id}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                 <Zap className="h-3 w-3 text-emerald-500" />
                 {code?.scan_count} Signals Received
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Link 
             href={`/dashboard/analytics/${id}`} 
             className="h-11 px-6 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-primary/10 text-sm font-bold flex items-center gap-2 transition-all"
           >
             <BarChart3 className="h-4 w-4" /> Telemetry
           </Link>
           <Button 
             onClick={handleUpdate} 
             disabled={saving}
             className="h-11 px-6 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 gap-2"
           >
             {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
             {saving ? 'Syncing...' : 'Sync Config'}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Configuration */}
        <div className="lg:col-span-7 space-y-8">
           <Card className="glass-card border-none rounded-[2.5rem] p-8 shadow-xl shadow-black/5">
              <form onSubmit={handleUpdate} className="space-y-8">
                 <div className="space-y-6">
                    <div className="space-y-4">
                       <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Identity Profile</Label>
                       <Input
                         value={title}
                         onChange={(e) => setTitle(e.target.value)}
                         className="h-12 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border-slate-200/50 dark:border-white/5 focus:ring-primary/20 text-base font-bold"
                       />
                    </div>
                    <div className="space-y-4">
                       <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Routing Target</Label>
                       <Input
                         type="url"
                         value={originalUrl}
                         onChange={(e) => setOriginalUrl(e.target.value)}
                         required
                         className="h-12 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border-slate-200/50 dark:border-white/5 focus:ring-primary/20 text-base font-bold"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6 pt-4">
                    <div className="space-y-4">
                       <div className="flex items-center gap-2">
                          <Palette className="h-3 w-3 text-primary" />
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Signal Color</Label>
                       </div>
                       <div className="flex items-center gap-3 p-2 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                          <input
                            type="color"
                            value={fgColor}
                            onChange={(e) => setFgColor(e.target.value)}
                            className="w-10 h-10 rounded-xl cursor-pointer border-none bg-transparent"
                          />
                          <span className="text-xs font-mono font-bold text-muted-foreground">{fgColor}</span>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <div className="flex items-center gap-2">
                          <Palette className="h-3 w-3 text-muted-foreground" />
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Base Layer</Label>
                       </div>
                       <div className="flex items-center gap-3 p-2 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                          <input
                            type="color"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="w-10 h-10 rounded-xl cursor-pointer border-none bg-transparent"
                          />
                          <span className="text-xs font-mono font-bold text-muted-foreground">{bgColor}</span>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6 pt-4">
                    <div className="space-y-4">
                       <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-primary" />
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Window</Label>
                       </div>
                       <Input
                         type="datetime-local"
                         value={activeFrom}
                         onChange={(e) => setActiveFrom(e.target.value)}
                         className="h-11 rounded-xl bg-slate-50 dark:bg-white/[0.02] border-slate-200/50 dark:border-white/5 text-xs font-bold"
                       />
                    </div>
                    <div className="space-y-4">
                       <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-red-500" />
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sunset Date</Label>
                       </div>
                       <Input
                         type="datetime-local"
                         value={expiresAt}
                         onChange={(e) => setExpiresAt(e.target.value)}
                         className="h-11 rounded-xl bg-slate-50 dark:bg-white/[0.02] border-slate-200/50 dark:border-white/5 text-xs font-bold"
                       />
                    </div>
                 </div>



                 <div className="flex items-center justify-between p-6 rounded-3xl bg-primary/[0.03] border border-primary/10 mt-6">
                    <div className="space-y-1">
                       <p className="text-sm font-black tracking-tight">Signal Status</p>
                       <p className="text-[11px] font-medium text-muted-foreground">Toggle node routing availability.</p>
                    </div>
                    <Switch 
                      checked={isActive} 
                      onCheckedChange={setIsActive} 
                      className="data-[state=checked]:bg-primary shadow-lg shadow-primary/20"
                    />
                 </div>
              </form>
           </Card>
        </div>

        {/* Node Preview */}
        <div className="lg:col-span-5 space-y-8">
           <Card className="glass-card border-none rounded-[3rem] p-10 flex flex-col items-center bg-white dark:bg-slate-900/40 shadow-2xl shadow-black/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/[0.02] pointer-events-none" />
              <div className="relative group mb-8">
                 <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700" />
                 <div className="relative p-6 bg-white rounded-[2.5rem] border shadow-2xl shadow-black/5 group-hover:scale-[1.02] transition-all duration-500 overflow-hidden">
                    {qrDataUrl && (
                       <img src={qrDataUrl} alt="Node Visual" className="w-64 h-64" />
                    )}
                    <div className="absolute inset-0 border-4 border-primary/10 rounded-[2.5rem] pointer-events-none" />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full">
                 <a
                   href={qrDataUrl}
                   download={`node-${code?.short_id}.png`}
                   className="h-12 flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] hover:border-primary/30 hover:bg-primary/5 transition-all text-sm font-black uppercase tracking-widest"
                 >
                   <Download className="h-4 w-4" /> PNG
                 </a>
                 <a
                   href={`/qr/${code?.short_id}`}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="h-12 flex items-center justify-center gap-2 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105 transition-all text-sm font-black uppercase tracking-widest"
                 >
                   <ExternalLink className="h-4 w-4" /> Test
                 </a>
              </div>

              <div className="mt-8 w-full p-6 rounded-3xl bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Public Access Point</span>
                    <Globe className="h-3 w-3 text-primary" />
                 </div>
                 <p className="text-xs font-mono font-bold break-all text-foreground text-center">
                    {typeof window !== 'undefined' ? window.location.origin : ''}/qr/{code?.short_id}
                 </p>
                 <Button 
                   variant="ghost" 
                   size="sm" 
                   className="w-full text-[10px] font-black uppercase tracking-widest h-8"
                   onClick={() => {
                     navigator.clipboard.writeText(`${window.location.origin}/qr/${code?.short_id}`)
                     toast.success('Access point copied.')
                   }}
                 >
                   Copy Link
                 </Button>
              </div>
           </Card>

           <Card className="glass-card border-none rounded-[2rem] p-8 bg-orange-500/[0.03] border border-orange-500/10">
              <div className="flex items-center gap-3 mb-2">
                 <QrIcon className="h-4 w-4 text-orange-500" />
                 <h4 className="text-sm font-black tracking-tight uppercase">High Fidelity Nodes</h4>
              </div>
              <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
                 Signal intensity and base layer contrast are optimized for legacy scanners and low-light environments.
              </p>
           </Card>
        </div>
      </div>
    </div>
  )
}
