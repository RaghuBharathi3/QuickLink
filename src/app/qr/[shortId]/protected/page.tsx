'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Lock, QrCode, Loader2, ShieldCheck, Zap, Globe } from 'lucide-react'
import { toast } from 'sonner'
import { AuroraBackground } from '@/components/ui/aurora-background'
import { cn } from '@/lib/utils'

export default function ProtectedQRPage() {
  const params = useParams()
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
        toast.success('Access Granted. Routing...')
        window.location.href = data.redirect_url
      } else {
        toast.error(data.error || 'Security breach: Invalid credentials')
        setPassword('')
      }
    } catch {
      toast.error('Signal connection error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuroraBackground>
      <div className="min-h-screen flex items-center justify-center px-4 relative z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-10">
            <motion.div 
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="mx-auto w-20 h-20 bg-primary/10 backdrop-blur-3xl rounded-[2.5rem] flex items-center justify-center mb-6 border border-primary/20 shadow-2xl shadow-primary/10"
            >
              <Lock className="h-10 w-10 text-primary" />
            </motion.div>
            <h1 className="text-4xl font-black tracking-tighter text-foreground">Secure Signal</h1>
            <p className="text-sm font-bold text-muted-foreground mt-2 uppercase tracking-[0.2em] opacity-60">Authentication Required</p>
          </div>

          <Card className="glass-card border-none rounded-[3rem] p-4 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] overflow-hidden">
            <CardContent className="p-8 space-y-8">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary/[0.03] border border-primary/10">
                 <ShieldCheck className="h-5 w-5 text-primary" />
                 <p className="text-xs font-bold leading-relaxed text-muted-foreground">
                    This node is protected by end-to-end signal encryption. Enter the access protocol to proceed.
                 </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Access Protocol</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter security key..."
                    required
                    autoFocus
                    className="h-14 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border-slate-200/50 dark:border-white/10 focus:ring-primary/20 text-lg font-bold px-6"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 gap-3 group" 
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5 transition-transform group-hover:scale-125" />}
                  {loading ? 'Decrypting...' : 'Authorize Access'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-12 flex flex-col items-center gap-6">
             <div className="flex items-center gap-4 opacity-40">
                <div className="h-px w-8 bg-foreground" />
                <div className="flex items-center gap-2">
                   <QrCode className="h-4 w-4" />
                   <span className="text-[10px] font-black uppercase tracking-[0.3em]">Quicklink Infrastructure</span>
                </div>
                <div className="h-px w-8 bg-foreground" />
             </div>
             <div className="flex items-center gap-6 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                   <Globe className="h-3 w-3" /> Edge Routing
                </div>
                <div className="flex items-center gap-1.5">
                   <ShieldCheck className="h-3 w-3" /> Secure Node
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </AuroraBackground>
  )
}
