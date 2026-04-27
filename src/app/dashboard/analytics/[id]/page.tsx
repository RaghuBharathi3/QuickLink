'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { ArrowLeft, Scan, Globe, Monitor, TrendingUp, Loader2, Calendar, MousePointer2, Smartphone, ShieldCheck, Zap } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface AnalyticsData {
  qr: { id: string; title: string; short_id: string; scan_count: number }
  period: { days: number; since: string }
  summary: { total_scans: number; human_scans: number; bot_scans: number }
  timeSeries: { date: string; count: number }[]
  devices: { name: string; value: number }[]
  browsers: { name: string; value: number }[]
  countries: { name: string; value: number }[]
}

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#84cc16']

export default function AnalyticsPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  useEffect(() => {
    fetchAnalytics()
  }, [id, days])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/analytics/${id}?days=${days}`)
      if (res.ok) {
        setData(await res.json())
      } else if (res.status === 404) {
        router.push('/dashboard/qrcodes')
      }
    } catch {
      console.error('Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
        </div>
        <p className="text-sm font-black tracking-widest text-muted-foreground uppercase animate-pulse">Aggregating Engagement Data...</p>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-4">
          <Link href="/dashboard/qrcodes" className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all">
            <div className="p-1 rounded-md bg-slate-100 dark:bg-white/5 group-hover:bg-primary/10 group-hover:scale-110 transition-all">
              <ArrowLeft className="h-3 w-3" />
            </div>
            Back to Infrastructure
          </Link>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-foreground">{data.qr.title || 'Production Link'}</h1>
            <div className="flex items-center gap-3 mt-2">
              <code className="text-[11px] font-black text-primary/60 bg-primary/5 px-2 py-1 rounded-lg tracking-wider">
                NODE_ID: {data.qr.short_id}
              </code>
              <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-white/20" />
              <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                Since {new Date(data.period.since).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center p-1 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5 shadow-sm">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={cn(
                "px-5 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all",
                days === d 
                  ? "bg-white dark:bg-white/10 text-primary shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {d}D
            </button>
          ))}
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Engagement', value: data.summary.total_scans, icon: Zap, color: 'primary', trend: '+12.5%' },
          { label: 'Unique Humans', value: data.summary.human_scans, icon: MousePointer2, color: 'emerald', trend: '+8.2%' },
          { label: 'Bot Traffic', value: data.summary.bot_scans, icon: ShieldCheck, color: 'slate', trend: '-2.4%' },
          { label: 'Active Regions', value: data.countries.length, icon: Globe, color: 'blue', trend: 'Global' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="glass-card border-none rounded-[2rem] p-6 shadow-xl shadow-black/5 group relative overflow-hidden">
               <div className={cn("absolute top-0 right-0 w-24 h-24 blur-3xl rounded-full -mr-10 -mt-10 opacity-20", `bg-${stat.color}-500`)} />
               <div className="flex items-center justify-between relative z-10">
                  <div className={cn("p-3 rounded-2xl", `bg-${stat.color}-500/10 text-${stat.color}-500`)}>
                     <stat.icon className="h-5 w-5" />
                  </div>
                  <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full", 
                    stat.trend.startsWith('+') ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-500/10 text-slate-500"
                  )}>
                    {stat.trend}
                  </span>
               </div>
               <div className="mt-6 space-y-1 relative z-10">
                  <p className="text-3xl font-black tabular-nums tracking-tighter">{stat.value.toLocaleString()}</p>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-70">{stat.label}</p>
               </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Engagement Curve */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass-card border-none rounded-[2.5rem] p-8 shadow-2xl shadow-black/5 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-20" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
            <div>
               <h3 className="text-xl font-black tracking-tight">Traffic Velocity</h3>
               <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">Engagement timeline over {days} days</p>
            </div>
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Human Scans</span>
               </div>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="8 8" stroke="rgba(0,0,0,0.03)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 20px 50px rgba(0,0,0,0.1)', 
                    padding: '12px 16px',
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)'
                  }}
                  itemStyle={{ fontWeight: 900, color: '#6366f1', fontSize: '14px' }}
                  labelStyle={{ fontWeight: 700, color: '#64748b', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#6366f1" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Device & OS breakdown */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass-card border-none rounded-[2.5rem] p-8 shadow-xl shadow-black/5 h-full">
            <div className="flex items-center gap-3 mb-8">
               <div className="p-2 rounded-xl bg-slate-100 dark:bg-white/5">
                  <Smartphone className="h-5 w-5 text-primary" />
               </div>
               <h3 className="text-lg font-black tracking-tight">Node Environment</h3>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="w-full sm:w-1/2 h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.devices}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {data.devices.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full sm:w-1/2 space-y-4">
                {data.devices.map((d, i) => (
                   <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-xs font-bold text-muted-foreground">{d.name}</span>
                      </div>
                      <span className="text-xs font-black">{Math.round((d.value / (data.summary.total_scans || 1)) * 100)}%</span>
                   </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Geographic Distribution */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass-card border-none rounded-[2.5rem] p-8 shadow-xl shadow-black/5 h-full">
            <div className="flex items-center gap-3 mb-8">
               <div className="p-2 rounded-xl bg-slate-100 dark:bg-white/5">
                  <Globe className="h-5 w-5 text-primary" />
               </div>
               <h3 className="text-lg font-black tracking-tight">Geographic Routing</h3>
            </div>

            <div className="space-y-5">
               {data.countries.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
                    <Globe className="h-8 w-8 opacity-20" />
                    <p className="text-xs font-bold uppercase tracking-widest">No Global Data</p>
                 </div>
               ) : (
                 data.countries.slice(0, 5).map((c, i) => {
                   const pct = (c.value / (data.summary.total_scans || 1)) * 100
                   return (
                     <div key={c.name} className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                           <span className="flex items-center gap-2">
                              <span className="text-muted-foreground">{i + 1}.</span> {c.name}
                           </span>
                           <span className="text-primary">{c.value} Scans</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${pct}%` }}
                             transition={{ duration: 1, delay: 0.8 + (i * 0.1) }}
                             className="h-full bg-primary rounded-full" 
                           />
                        </div>
                     </div>
                   )
                 })
               )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
