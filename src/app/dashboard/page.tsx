'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QrCode, ScanEye, Activity, TrendingUp, Users, ArrowUpRight, Zap } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts'
import { motion } from 'framer-motion'
import { Crown, BarChart3, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

// Sample data for the chart
const data = [
  { name: 'Mon', scans: 40, active: 24 },
  { name: 'Tue', scans: 30, active: 13 },
  { name: 'Wed', scans: 98, active: 22 },
  { name: 'Thu', scans: 39, active: 15 },
  { name: 'Fri', scans: 48, active: 32 },
  { name: 'Sat', scans: 120, active: 45 },
  { name: 'Sun', scans: 150, active: 56 },
]

export default function DashboardPage() {
  const [stats, setStats] = React.useState({
    totalCodes: 0,
    totalScans: 0,
    activeCodes: 0,
    loading: true
  })

  React.useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient()
      const { data: qrcodes } = await supabase.from('qr_codes').select('*')
      
      const totalCodes = qrcodes?.length || 0
      const totalScans = qrcodes?.reduce((acc, curr) => acc + (curr.scan_count || 0), 0) || 0
      const activeCodes = qrcodes?.filter(c => c.is_active).length || 0
      
      setStats({ totalCodes, totalScans, activeCodes, loading: false })
    }
    fetchStats()
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  }

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-base font-medium">Real-time infrastructure overview.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 text-primary text-sm font-bold shadow-sm">
           <Zap className="h-4 w-4 fill-primary" />
           System Healthy
        </div>
      </div>
      
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-3"
      >
        <motion.div variants={item}>
          <Card className="glass-card border-slate-200/50 dark:border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-primary/30 transition-all duration-500">
            <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-muted-foreground tracking-widest uppercase">Total Codes</CardTitle>
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 group-hover:scale-110 transition-transform">
                <QrCode className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="flex items-baseline gap-3">
                <div className="text-5xl font-black text-foreground tabular-nums">
                  {stats.loading ? '...' : stats.totalCodes}
                </div>
                <div className="flex items-center text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">
                   <ArrowUpRight className="h-3 w-3 mr-1" />
                   12%
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 font-semibold uppercase tracking-wider">Across all campaigns</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={item}>
          <Card className="glass-card border-slate-200/50 dark:border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-primary/30 transition-all duration-500">
            <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-muted-foreground tracking-widest uppercase">Total Scans</CardTitle>
              <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 group-hover:scale-110 transition-transform">
                <ScanEye className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
               <div className="flex items-baseline gap-3">
                <div className="text-5xl font-black text-foreground tabular-nums">
                  {stats.loading ? '...' : stats.totalScans}
                </div>
                <div className="flex items-center text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">
                   <ArrowUpRight className="h-3 w-3 mr-1" />
                   24%
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 font-semibold uppercase tracking-wider">Global traffic volume</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="glass-card border-slate-200/50 dark:border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-primary/30 transition-all duration-500 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
            <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between relative z-10">
              <CardTitle className="text-sm font-bold text-muted-foreground tracking-widest uppercase">Conversion</CardTitle>
              <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0 relative z-10">
               <div className="flex items-baseline gap-3">
                <div className="text-5xl font-black text-foreground tabular-nums">
                  {stats.loading ? '0' : Math.round((stats.activeCodes / (stats.totalCodes || 1)) * 100)}%
                </div>
                <div className="flex items-center text-xs font-bold text-slate-500 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-lg">
                   Active Ratio
                </div>
              </div>
              <div className="w-full bg-slate-100 dark:bg-white/5 h-2 rounded-full mt-6 overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: stats.totalCodes > 0 ? `${(stats.activeCodes/stats.totalCodes)*100}%` : '0%' }}
                   transition={{ duration: 1, ease: "easeOut" }}
                   className="bg-primary h-full rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" 
                 />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Main Chart Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass-card border-slate-200/50 dark:border-white/5 rounded-[3rem] overflow-hidden">
          <CardHeader className="p-10 pb-0 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-black tracking-tight">Performance Flow</CardTitle>
              <p className="text-sm text-muted-foreground font-medium mt-1">Activity over the last 7 days.</p>
            </div>
            <div className="flex gap-2">
               <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  Scans
               </div>
               <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 text-muted-foreground text-[11px] font-bold uppercase tracking-wider">
                  <div className="w-2 h-2 rounded-full bg-slate-400" />
                  Activity
               </div>
            </div>
          </CardHeader>
          <CardContent className="p-10 pt-10">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#888', fontSize: 12, fontWeight: 600 }}
                    dy={15}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#888', fontSize: 12, fontWeight: 600 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      backdropFilter: 'blur(10px)',
                      border: 'none', 
                      borderRadius: '20px',
                      color: '#fff',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                    }}
                    itemStyle={{ color: '#fff', fontWeight: 700 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="scans" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorScans)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
         <motion.div 
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.5 }}
         >
           <Card className="glass-card border-slate-200/50 dark:border-white/5 rounded-[2.5rem] p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                 <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                    <Zap className="h-4 w-4" />
                 </div>
                 Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-4">
                 {[
                   { label: 'Create QR', icon: QrCode, href: '/dashboard/qrcodes', color: 'bg-blue-500' },
                   { label: 'View Analytics', icon: BarChart3, href: '/dashboard/analytics', color: 'bg-purple-500' },
                   { label: 'Upgrade Plan', icon: Crown, href: '/dashboard/billing', color: 'bg-amber-500' },
                   { label: 'Settings', icon: Settings, href: '/dashboard/settings', color: 'bg-slate-500' },
                 ].map((action, i) => (
                    <button 
                      key={i}
                      onClick={() => window.location.href = action.href}
                      className="group p-4 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] hover:border-primary/30 hover:bg-primary/5 transition-all text-left space-y-3"
                    >
                       <div className={cn("p-2 rounded-lg text-white w-fit", action.color)}>
                          <action.icon className="h-4 w-4" />
                       </div>
                       <p className="font-bold text-sm">{action.label}</p>
                    </button>
                 ))}
              </div>
           </Card>
         </motion.div>

         <motion.div 
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.6 }}
         >
           <Card className="glass-card border-slate-200/50 dark:border-white/5 rounded-[2.5rem] p-8">
              <h3 className="text-xl font-bold mb-6">Recent Distribution</h3>
              <div className="h-[180px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                       <Bar dataKey="active" radius={[4, 4, 0, 0]}>
                          {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 6 ? 'hsl(var(--primary))' : 'rgba(100,116,139,0.2)'} />
                          ))}
                       </Bar>
                       <XAxis dataKey="name" axisLine={false} tickLine={false} hide />
                       <Tooltip cursor={{ fill: 'transparent' }} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
              <div className="mt-6 flex items-center justify-between">
                 <div className="space-y-1">
                    <p className="text-sm font-bold">Top Performing</p>
                    <p className="text-xs text-muted-foreground font-medium">Sunday, June 24th</p>
                 </div>
                 <div className="text-right">
                    <p className="text-lg font-black text-primary">56 Active</p>
                    <p className="text-[10px] uppercase font-black tracking-widest text-emerald-500">+12% Peak</p>
                 </div>
              </div>
           </Card>
         </motion.div>
      </div>
    </div>
  )
}


