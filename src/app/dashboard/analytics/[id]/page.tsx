'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { ArrowLeft, Scan, Globe, Monitor, TrendingUp, Loader2 } from 'lucide-react'
import Link from 'next/link'

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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-8 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link href="/dashboard/qrcodes" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to QR Codes
        </Link>
        <div className="sm:ml-4">
          <h1 className="text-2xl font-extrabold tracking-tight">{data.qr.title || 'QR Code Analytics'}</h1>
          <p className="text-muted-foreground text-sm font-mono">/{data.qr.short_id}</p>
        </div>
        <div className="sm:ml-auto flex gap-2">
          {[7, 30].map((d) => (
            <Button
              key={d}
              variant={days === d ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDays(d)}
              className="rounded-xl"
            >
              {d}d
            </Button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 sm:grid-cols-3"
      >
        {[
          { label: 'Total Scans', value: data.summary.total_scans, icon: Scan, color: 'blue' },
          { label: 'Human Scans', value: data.summary.human_scans, icon: TrendingUp, color: 'green' },
          { label: 'Bot Scans', value: data.summary.bot_scans, icon: Globe, color: 'purple' },
        ].map((stat) => (
          <Card key={stat.label} className="glass-card border-none rounded-2xl overflow-hidden relative">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <div className={`p-2 bg-${stat.color}-50 rounded-xl`}>
                  <stat.icon className={`h-4 w-4 text-${stat.color}-500`} />
                </div>
              </div>
              <p className="text-3xl font-black">{stat.value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Time series chart */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="glass-card border-none rounded-2xl">
          <CardHeader className="px-6 pt-6 pb-2">
            <CardTitle className="text-base">Scans Over Time</CardTitle>
          </CardHeader>
          <CardContent className="pb-6 px-4">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.timeSeries} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={(d) => d.slice(5)}
                />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: '#6366f1' }}
                  name="Scans"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Device breakdown */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="glass-card border-none rounded-2xl h-full">
            <CardHeader className="px-6 pt-6 pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Monitor className="h-4 w-4 text-muted-foreground" /> Device Types
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-6 flex items-center justify-center">
              {data.devices.length === 0 ? (
                <p className="text-sm text-muted-foreground py-12">No scan data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={data.devices}
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {data.devices.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top countries */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card border-none rounded-2xl h-full">
            <CardHeader className="px-6 pt-6 pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" /> Top Countries
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              {data.countries.length === 0 ? (
                <p className="text-sm text-muted-foreground py-12 text-center">No scan data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.countries.slice(0, 6)} layout="vertical" margin={{ left: 10, right: 10 }}>
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} width={55} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px' }} />
                    <Bar dataKey="value" name="Scans" radius={[0, 4, 4, 0]}>
                      {data.countries.slice(0, 6).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top browsers */}
      {data.browsers.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="glass-card border-none rounded-2xl">
            <CardHeader className="px-6 pt-6 pb-2">
              <CardTitle className="text-base">Browsers</CardTitle>
            </CardHeader>
            <CardContent className="pb-6 space-y-3 px-6">
              {data.browsers.slice(0, 6).map((b, i) => {
                const pct = data.summary.human_scans > 0
                  ? Math.round((b.value / data.summary.human_scans) * 100)
                  : 0
                return (
                  <div key={b.name} className="flex items-center gap-3">
                    <div className="w-24 text-sm font-medium text-foreground truncate">{b.name}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground w-12 text-right">{b.value}</div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
