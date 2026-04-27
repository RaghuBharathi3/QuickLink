'use client'

import { useEffect, useState } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Plus, Edit, Trash2, QrCode, BarChart3, Crown, Loader2, ExternalLink, ShieldCheck, Clock, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface QRCode {
  id: string
  title: string
  original_url: string
  short_id: string
  is_active: boolean
  scan_count: number
  expires_at?: string
  password_hash?: string
}

export default function QRCodesPage() {
  const [codes, setCodes] = useState<QRCode[]>([])
  const [loading, setLoading] = useState(true)
  const [planInfo, setPlanInfo] = useState<{ plan: string; limit: number; current: number } | null>(null)
  const [search, setSearch] = useState('')

  const fetchCodes = async () => {
    try {
      const res = await fetch('/api/codes')
      if (res.ok) {
        const data = await res.json()
        setCodes(data.codes || [])
        setPlanInfo(data.planInfo)
      }
    } catch {
      toast.error('Failed to load QR codes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCodes() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this QR code? It cannot be undone.')) return
    try {
      const res = await fetch(`/api/codes/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('QR Code deleted')
        fetchCodes()
      } else {
        toast.error('Failed to delete')
      }
    } catch {
      toast.error('An error occurred')
    }
  }

  const isExpired = (code: QRCode) => code.expires_at && new Date(code.expires_at) < new Date()

  const filteredCodes = codes.filter(c => 
    c.title?.toLowerCase().includes(search.toLowerCase()) || 
    c.short_id?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">QR Infrastructure</h1>
          <p className="text-muted-foreground text-base font-medium mt-1">Deploy and monitor your dynamic routing nodes.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search nodes..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none text-sm font-medium"
            />
          </div>
          <Link 
            href="/dashboard/qrcodes/new" 
            className={cn(
              buttonVariants({ size: 'lg' }),
              "rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 font-bold h-11 px-6"
            )}
          >
            <Plus className="mr-2 h-4 w-4" /> New Node
          </Link>
        </div>
      </div>

      {planInfo && (
        <motion.div
           initial={{ opacity: 0, y: -10 }}
           animate={{ opacity: 1, y: 0 }}
           className={cn(
             "relative flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-[2rem] border overflow-hidden group transition-all",
             planInfo.plan === 'pro' 
               ? 'bg-primary/[0.03] border-primary/20' 
               : 'bg-amber-500/[0.03] border-amber-500/20'
           )}
         >
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
           
           <div className="flex items-center gap-4 relative z-10">
              <div className={cn(
                "p-3 rounded-2xl",
                planInfo.plan === 'pro' ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-500'
              )}>
                <Crown className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-black tracking-tight">
                  {planInfo.plan === 'pro' ? 'Enterprise Access' : 'Starter Capacity'}
                </p>
                <p className="text-sm text-muted-foreground font-medium">
                  {planInfo.plan === 'pro' 
                    ? `Unlimited routing enabled. Active nodes: ${planInfo.current}`
                    : `Usage: ${planInfo.current} of ${planInfo.limit} nodes deployed.`}
                </p>
              </div>
           </div>

           {planInfo.plan !== 'pro' && (
             <Link 
              href="/dashboard/billing" 
              className={cn(
                buttonVariants({ variant: 'default' }),
                "rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold h-10 px-5 shadow-lg shadow-amber-500/20 relative z-10"
              )}
             >
               Unlock Unlimited
             </Link>
           )}
        </motion.div>
      )}

      <div className="w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 text-muted-foreground gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary/40" /> 
            <p className="text-sm font-bold tracking-widest uppercase opacity-50">Syncing Infrastructure...</p>
          </div>
        ) : (
          <div className="rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 overflow-hidden glass-card shadow-2xl shadow-black/5">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-white/[0.01]">
                <TableRow className="border-b-slate-200/50 dark:border-b-white/[0.05] hover:bg-transparent">
                  <TableHead className="font-bold text-muted-foreground py-6 pl-8 text-xs uppercase tracking-widest">Node Node</TableHead>
                  <TableHead className="font-bold text-muted-foreground text-xs uppercase tracking-widest hidden sm:table-cell">Identity</TableHead>
                  <TableHead className="font-bold text-muted-foreground text-xs uppercase tracking-widest">Traffic</TableHead>
                  <TableHead className="font-bold text-muted-foreground text-xs uppercase tracking-widest">Security</TableHead>
                  <TableHead className="font-bold text-muted-foreground text-xs uppercase tracking-widest">Status</TableHead>
                  <TableHead className="text-right font-bold text-muted-foreground py-6 pr-8 text-xs uppercase tracking-widest">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                {filteredCodes.map((code, index) => (
                  <motion.tr 
                    key={code.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group transition-colors hover:bg-primary/[0.02] dark:hover:bg-primary/[0.03] border-b border-slate-100 dark:border-white/[0.03]"
                  >
                    <TableCell className="py-5 pl-8">
                      <div className="flex flex-col">
                        <span className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                          {code.title || 'Production Link'}
                        </span>
                        <span className="text-[11px] text-muted-foreground flex items-center mt-1 truncate max-w-[200px]">
                          <Clock className="h-3 w-3 mr-1 opacity-50" />
                          Target: {code.original_url}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <code className="text-[11px] font-black text-primary/60 bg-primary/5 px-2 py-1 rounded-lg tracking-wider">
                        {code.short_id}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-black tabular-nums">{code.scan_count}</div>
                        <div className="h-1 w-8 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                           <div className="bg-primary h-full rounded-full" style={{ width: `${Math.min(code.scan_count / 10, 100)}%` }} />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2">
                          {code.password_hash ? (
                            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500" title="Password Protected">
                               <ShieldCheck className="h-4 w-4" />
                            </div>
                          ) : (
                            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400">
                               <ShieldCheck className="h-4 w-4" />
                            </div>
                          )}
                       </div>
                    </TableCell>
                    <TableCell>
                      <div className={cn(
                        "inline-flex items-center rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest border",
                        isExpired(code)
                          ? 'bg-red-500/10 text-red-500 border-red-500/20'
                          : code.is_active
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                      )}>
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full mr-2 animate-pulse",
                          isExpired(code) ? 'bg-red-500' : code.is_active ? 'bg-emerald-500' : 'bg-slate-500'
                        )} />
                        {isExpired(code) ? 'Terminated' : code.is_active ? 'Live' : 'Standby'}
                      </div>
                    </TableCell>
                    <TableCell className="py-5 pr-8">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/analytics/${code.id}`}
                          className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-blue-500/10 hover:text-blue-500 text-muted-foreground transition-all"
                          title="View Telemetry"
                        >
                          <BarChart3 className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/dashboard/qrcodes/${code.id}`}
                          className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-slate-500/10 hover:text-foreground text-muted-foreground transition-all"
                          title="Configure"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(code.id)}
                          className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-red-500/10 hover:text-red-500 text-muted-foreground transition-all"
                          title="Purge"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
                </AnimatePresence>
                {filteredCodes.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-32">
                      <div className="flex flex-col items-center justify-center gap-6 text-center">
                        <div className="p-8 rounded-[2.5rem] bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 relative">
                          <QrCode className="h-12 w-12 text-primary/40" />
                          <div className="absolute inset-0 bg-primary/10 blur-3xl -z-10 rounded-full" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xl font-black">No infrastructure detected.</p>
                          <p className="text-sm text-muted-foreground font-medium">Deploy your first dynamic routing node to start tracking scans.</p>
                        </div>
                        <Link 
                          href="/dashboard/qrcodes/new" 
                          className={cn(
                            buttonVariants({ size: 'lg' }),
                            "rounded-2xl font-bold px-8 shadow-xl shadow-primary/20"
                          )}
                        >
                          <Plus className="mr-2 h-4 w-4" /> Deploy First Node
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
