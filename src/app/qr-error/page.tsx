'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { QrCode, AlertTriangle, Clock, WifiOff, Home, Plus, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuroraBackground } from '@/components/ui/aurora-background'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const reasons: Record<string, { icon: React.ElementType; title: string; desc: string; color: string; bgColor: string }> = {
  not_found: {
    icon: QrCode,
    title: 'Node Unreachable',
    desc: 'The requested routing node does not exist or has been permanently decommissioned.',
    color: 'text-slate-500',
    bgColor: 'bg-slate-500/10'
  },
  inactive: {
    icon: ShieldAlert,
    title: 'Signal Terminated',
    desc: 'This routing signal has been manually deactivated by the node administrator.',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10'
  },
  expired: {
    icon: Clock,
    title: 'Node Expired',
    desc: 'The temporal lifecycle of this node has concluded. The signal is no longer active.',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10'
  },
  not_started: {
    icon: Clock,
    title: 'Initialization Pending',
    desc: 'This node is scheduled for a future deployment and is not yet receiving traffic.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  rate_limited: {
    icon: WifiOff,
    title: 'Traffic Threshold Exceeded',
    desc: 'Too many requests from your current IP. Rate limiting has been applied to preserve infrastructure health.',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  },
}

function QRErrorContent() {
  const searchParams = useSearchParams()
  const reason = searchParams.get('reason') || 'not_found'
  const info = reasons[reason] || reasons.not_found
  const Icon = info.icon

  return (
    <AuroraBackground>
      <div className="min-h-screen flex items-center justify-center px-4 relative z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-lg"
        >
          <div className="text-center mb-10">
            <motion.div 
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className={cn("mx-auto w-24 h-24 backdrop-blur-3xl rounded-[2.5rem] flex items-center justify-center mb-6 border border-white/10 shadow-2xl shadow-black/20", info.bgColor)}
            >
              <Icon className={cn("h-12 w-12", info.color)} />
            </motion.div>
            <h1 className="text-4xl font-black tracking-tighter text-foreground">{info.title}</h1>
            <p className="text-[10px] font-black text-muted-foreground mt-2 uppercase tracking-[0.2em] opacity-60">Connection Interrupted</p>
          </div>

          <Card className="glass-card border-none rounded-[3rem] p-4 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] overflow-hidden">
            <CardContent className="p-8 space-y-8 flex flex-col items-center text-center">
              <div className="flex flex-col items-center gap-4">
                 <p className="text-sm font-bold leading-relaxed text-muted-foreground max-w-sm">
                    {info.desc}
                 </p>
              </div>

              <div className="w-full pt-6 border-t border-slate-100 dark:border-white/5 flex flex-col gap-3">
                <Link href="/" className="w-full">
                  <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs gap-3">
                    <Home className="h-4 w-4" /> Go to Homepage
                  </Button>
                </Link>
                <Link href="/signup" className="w-full">
                  <Button className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 gap-3 group">
                    <Plus className="h-4 w-4 transition-transform group-hover:scale-125" /> Deploy Your Own Node
                  </Button>
                </Link>
              </div>
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
          </div>
        </motion.div>
      </div>
    </AuroraBackground>
  )
}

export default function QRErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-[10px] font-black uppercase tracking-widest">Checking Routing Status...</div>
      </div>
    }>
      <QRErrorContent />
    </Suspense>
  )
}
