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
import { ArrowLeft, ExternalLink, Download, BarChart3, Lock } from 'lucide-react'
import QRCode from 'qrcode'

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
  const [password, setPassword] = useState('')
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
            width: 300,
            margin: 2,
            color: { dark: data.fg_color || '#000000', light: data.bg_color || '#FFFFFF' },
          })
          setQrDataUrl(dataUrl)
        } else {
          toast.error('Failed to load QR code')
          router.push('/dashboard/qrcodes')
        }
      } catch {
        toast.error('An error occurred')
      } finally {
        setLoading(false)
      }
    }
    fetchCode()
  }, [id, router])

  // Regenerate QR preview on color change
  useEffect(() => {
    if (!code) return
    const generate = async () => {
      try {
        const redirectUrl = `${window.location.origin}/qr/${code.short_id}`
        const dataUrl = await QRCode.toDataURL(redirectUrl, {
          width: 300, margin: 2,
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
        new_password: password || null,  // server will hash
      }

      const res = await fetch(`/api/codes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (res.ok) {
        toast.success('QR Code updated!')
        setCode((prev) => prev ? { ...prev, ...updates } as QRData : null)
        setPassword('')
      } else {
        const error = await res.json()
        toast.error(error.message || 'Failed to update')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading...</div>
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/qrcodes" className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'hover:bg-gray-100 rounded-full' })}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold tracking-tight">{code?.title || 'QR Code Details'}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-muted-foreground text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">/{code?.short_id}</span>
            <span className="text-xs text-muted-foreground">{code?.scan_count} scans</span>
          </div>
        </div>
        <Link href={`/dashboard/analytics/${id}`} className={buttonVariants({ variant: 'outline', size: 'sm', className: 'rounded-xl gap-1.5' })}>
          <BarChart3 className="h-3.5 w-3.5" /> Analytics
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Edit form */}
        <Card className="glass-card border-none overflow-hidden rounded-2xl">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100/50 pb-5 pt-6 px-6">
            <CardTitle className="text-base">Edit Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleUpdate} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-11 rounded-xl bg-gray-50/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Destination URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  required
                  className="h-11 rounded-xl bg-gray-50/50"
                />
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fg">QR Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="fg"
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
                    />
                    <span className="text-xs font-mono text-muted-foreground">{fgColor}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bg">Background</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="bg"
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
                    />
                    <span className="text-xs font-mono text-muted-foreground">{bgColor}</span>
                  </div>
                </div>
              </div>

              {/* Scheduling */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="activeFrom">Active From</Label>
                  <Input
                    id="activeFrom"
                    type="datetime-local"
                    value={activeFrom}
                    onChange={(e) => setActiveFrom(e.target.value)}
                    className="h-11 rounded-xl bg-gray-50/50 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiresAt">Expires At</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="h-11 rounded-xl bg-gray-50/50 text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" /> Password Protection
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={code?.password_hash ? '••••••• (change password)' : 'Leave blank for no protection'}
                  className="h-11 rounded-xl bg-gray-50/50"
                />
                {code?.password_hash && (
                  <p className="text-xs text-amber-600">🔒 Password protection is active</p>
                )}
              </div>

              <div className="flex items-center space-x-3 pt-4 border-t border-gray-100/50">
                <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
                <Label htmlFor="active" className="font-medium text-sm">Active (redirects enabled)</Label>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={saving} className="rounded-xl px-6 shadow-md hover-lift">
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* QR Preview */}
        <Card className="glass-card border-none overflow-hidden rounded-2xl border-t border-t-primary/20">
          <CardHeader className="bg-primary/5 border-b border-gray-100/50 pb-5 pt-6 px-6">
            <CardTitle className="text-base text-primary">QR Code Preview</CardTitle>
            <CardDescription className="text-primary/70">Live preview updates with chosen colors</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-5 p-6">
            {qrDataUrl && (
              <div className="p-4 bg-white rounded-2xl border shadow-sm group hover-lift transition-all">
                <img src={qrDataUrl} alt="QR Code Preview" className="w-48 h-48 transition-transform group-hover:scale-105" />
              </div>
            )}
            <div className="flex gap-2 w-full justify-center">
              <a
                href={qrDataUrl}
                download={`qr-${code?.short_id}.png`}
                className={buttonVariants({ variant: 'outline', size: 'sm', className: 'rounded-xl' })}
              >
                <Download className="mr-1.5 h-3.5 w-3.5" /> PNG
              </a>
              <a
                href={`/qr/${code?.short_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ size: 'sm', className: 'rounded-xl' })}
              >
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Test
              </a>
            </div>
            <div className="text-xs text-center text-muted-foreground w-full p-3 bg-gray-50 rounded-xl break-all font-mono border border-gray-100">
              {typeof window !== 'undefined' ? window.location.origin : ''}/qr/{code?.short_id}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
