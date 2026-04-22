'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewQRCodePage() {
  const [title, setTitle] = useState('')
  const [originalUrl, setOriginalUrl] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          original_url: originalUrl,
          password: password || null
        })
      })

      if (res.ok) {
        toast.success('QR Code created!')
        router.push('/dashboard/qrcodes')
      } else {
        const error = await res.json()
        toast.error(error.message || 'Failed to create QR code')
      }
    } catch (e) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/qrcodes" className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'hover:bg-gray-100 rounded-full' })}>
            <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight">Create QR Code</h1>
      </div>

      <Card className="glass-card border-none overflow-hidden rounded-2xl">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100/50 pb-6 pt-6 px-8">
          <CardTitle className="text-lg">QR Details</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Enter the destination link for your new dynamic QR code.</p>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="title" className="font-semibold text-foreground">Title (Optional)</Label>
              <Input 
                id="title" 
                placeholder="Marketing Campaign A" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="h-11 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="url" className="font-semibold text-foreground">Destination URL</Label>
              <Input 
                id="url" 
                type="url" 
                placeholder="https://example.com/promo" 
                value={originalUrl} 
                onChange={(e) => setOriginalUrl(e.target.value)} 
                required 
                className="h-11 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="password" title="Optional: require a password to view the destination">Password Protection (Optional)</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Leave blank for none" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="h-11 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
              />
            </div>
            <div className="pt-6 flex justify-end gap-3 mt-4 border-t border-gray-100 pt-6">
              <Link href="/dashboard/qrcodes" className={buttonVariants({ variant: 'ghost', className: 'rounded-xl' })}>Cancel</Link>
              <Button type="submit" disabled={loading} className="rounded-xl px-6 shadow-md hover-lift">
                {loading ? 'Creating...' : 'Create QR Code'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
