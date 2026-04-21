'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Lock, QrCode, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ProtectedQRPage() {
  const params = useParams()
  const router = useRouter()
  const shortId = params.shortId as string
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/codes/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ short_id: shortId, password }),
      })

      const data = await res.json()

      if (res.ok && data.redirect_url) {
        window.location.href = data.redirect_url
      } else {
        toast.error(data.error || 'Incorrect password')
        setPassword('')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-xl font-extrabold">Password Protected</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter the password to access this QR code destination.</p>
        </div>

        <Card className="glass-card border-none rounded-2xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  autoFocus
                  className="h-11 rounded-xl"
                />
              </div>
              <Button type="submit" className="w-full rounded-xl" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                {loading ? 'Verifying...' : 'Continue'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-center gap-2 text-muted-foreground">
          <QrCode className="h-3.5 w-3.5" />
          <span className="text-xs">Powered by Quicklink</span>
        </div>
      </motion.div>
    </div>
  )
}
