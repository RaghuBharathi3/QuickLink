'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import Link from 'next/link'
import { ArrowLeft, Zap, Globe, Lock, Sparkles, Plus, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

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
        toast.success('Node deployed successfully!')
        router.push('/dashboard/qrcodes')
      } else {
        const errorData = await res.json()
        toast.error(errorData.error || errorData.message || 'Deployment failed')
      }
    } catch (e) {
      toast.error('Connection interrupt during deployment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-12 max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/qrcodes" className="group p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-primary/10 transition-all">
            <ArrowLeft className="h-5 w-5 group-hover:text-primary transition-colors" />
        </Link>
        <div>
          <h1 className="text-4xl font-black tracking-tight">Deploy Node</h1>
          <p className="text-muted-foreground text-sm font-medium mt-1 uppercase tracking-widest">Initialization Protocol</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="glass-card border-none rounded-[2.5rem] p-10 shadow-2xl shadow-black/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-10 -mt-10" />
              
              <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Node Identity</Label>
                  </div>
                  <Input 
                    id="title" 
                    placeholder="E.g. Summer Campaign 2024" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    className="h-14 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border-slate-200/50 dark:border-white/5 focus:ring-primary/20 text-base font-bold px-6"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-2">
                    <Globe className="h-4 w-4 text-primary" />
                    <Label htmlFor="url" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Routing Target (URL)</Label>
                  </div>
                  <Input 
                    id="url" 
                    type="url" 
                    placeholder="https://your-destination.com" 
                    value={originalUrl} 
                    onChange={(e) => setOriginalUrl(e.target.value)} 
                    required 
                    className="h-14 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border-slate-200/50 dark:border-white/5 focus:ring-primary/20 text-base font-bold px-6"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-2">
                    <Lock className="h-4 w-4 text-primary" />
                    <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Signal Security (Optional Password)</Label>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Encryption key..." 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="h-14 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border-slate-200/50 dark:border-white/5 focus:ring-primary/20 text-base font-bold px-6"
                  />
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-6">
                  <Link href="/dashboard/qrcodes" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors px-4">Cancel</Link>
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="h-14 rounded-2xl px-10 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 gap-3 group"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 transition-transform group-hover:scale-125" />}
                    {loading ? 'Initializing...' : 'Deploy Node'}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>

        <div className="lg:col-span-5 space-y-8">
           <Card className="glass-card border-none rounded-[2rem] p-8 bg-primary/[0.03] relative overflow-hidden">
              <div className="flex items-center gap-4 mb-6">
                 <div className="p-3 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                    <Zap className="h-5 w-5" />
                 </div>
                 <h3 className="font-black tracking-tight">Infrastructure Info</h3>
              </div>
              <ul className="space-y-4">
                 {[
                   'Instant global deployment',
                   'Real-time traffic telemetry',
                   'Dynamic routing persistence',
                   'Edge-cached signal processing'
                 ].map((text, i) => (
                   <li key={i} className="flex items-center gap-3 text-sm font-bold text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {text}
                   </li>
                 ))}
              </ul>
           </Card>

           <div className="px-8 flex items-center gap-4 text-muted-foreground opacity-40">
              <Globe className="h-5 w-5" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">
                 All nodes are deployed to a global edge network for sub-100ms routing.
              </p>
           </div>
        </div>
      </div>
    </div>
  )
}
