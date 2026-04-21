import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QrCode, ScanEye, Activity } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Try to fetch stats, ignore errors if DB isn't fully set up yet
  const { data: qrcodes, error } = await supabase.from('qr_codes').select('*')
  
  const totalCodes = qrcodes?.length || 0
  const totalScans = qrcodes?.reduce((acc, curr) => acc + (curr.scan_count || 0), 0) || 0
  const activeCodes = qrcodes?.filter(c => c.is_active).length || 0

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Overview</h1>
        <p className="text-muted-foreground mt-1 text-sm">Welcome back to your Quicklink dashboard.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm border border-slate-200/60 dark:border-white/[0.08] rounded-3xl overflow-hidden glass-card transition-all hover:border-primary/20 hover:shadow-md">
          <CardHeader className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-200/50 dark:border-white/[0.05] p-5 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total QR Codes</CardTitle>
            <div className="p-1.5 bg-blue-500/10 rounded-lg">
              <QrCode className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-4xl font-extrabold text-foreground">{totalCodes}</div>
            <p className="text-xs text-muted-foreground mt-2 tracking-wide uppercase">All time tags created</p>
            {error && <p className="text-xs text-red-500 mt-2 font-medium">Database connection error</p>}
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border border-slate-200/60 dark:border-white/[0.08] rounded-3xl overflow-hidden glass-card transition-all hover:border-primary/20 hover:shadow-md">
          <CardHeader className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-200/50 dark:border-white/[0.05] p-5 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Scans</CardTitle>
            <div className="p-1.5 bg-green-500/10 rounded-lg">
              <ScanEye className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-4xl font-extrabold text-foreground">{totalScans}</div>
            <p className="text-xs text-muted-foreground mt-2 tracking-wide uppercase">All time hits</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-slate-200/60 dark:border-white/[0.08] rounded-3xl overflow-hidden glass-card transition-all hover:border-primary/20 hover:shadow-md relative">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-purple-500/5 to-transparent pointer-events-none" />
          <CardHeader className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-200/50 dark:border-white/[0.05] p-5 flex flex-row items-center justify-between relative z-10">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Active Links</CardTitle>
            <div className="p-1.5 bg-purple-500/10 rounded-lg">
              <Activity className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent className="p-6 relative z-10">
            <div className="text-4xl font-extrabold text-foreground">{activeCodes}</div>
            <div className="w-full bg-slate-100 dark:bg-white/5 h-1.5 rounded-full mt-4 overflow-hidden">
               <div className="bg-purple-500 h-full rounded-full" style={{ width: totalCodes > 0 ? `${(activeCodes/totalCodes)*100}%` : '0%' }} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
