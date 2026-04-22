import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Users, Activity, QrCode } from 'lucide-react'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== 'admin') {
    return redirect('/dashboard')
  }

  // Uses Service Role Key to fetch all users data and stats securely
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    { cookies: { getAll() { return [] }, setAll() {} } }
  )

  const { data: qrCodes } = await supabaseAdmin.from('qr_codes').select('*')
  const { data: subs } = await supabaseAdmin.from('subscriptions').select('*')
  
  // Note: listing users requires service role
  const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers()

  const totalUsers = users?.length || 0
  const totalCodes = qrCodes?.length || 0
  const activePro = subs?.filter(s => s.plan === 'pro').length || 0

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <Shield className="h-8 w-8 text-indigo-500" /> Admin Control Center
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">System-wide monitoring and user management.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm border border-slate-200/60 dark:border-white/[0.08] rounded-3xl overflow-hidden glass-card transition-all">
          <CardHeader className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-200/50 dark:border-white/[0.05] p-5 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Users</CardTitle>
            <div className="p-1.5 bg-blue-500/10 rounded-lg">
              <Users className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-4xl font-extrabold text-foreground">{totalUsers}</div>
            {usersError && <p className="text-xs text-red-500 mt-2 font-medium">Require Service Role Key to list</p>}
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border border-slate-200/60 dark:border-white/[0.08] rounded-3xl overflow-hidden glass-card transition-all">
          <CardHeader className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-200/50 dark:border-white/[0.05] p-5 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total QR Codes</CardTitle>
            <div className="p-1.5 bg-purple-500/10 rounded-lg">
              <QrCode className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-4xl font-extrabold text-foreground">{totalCodes}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-slate-200/60 dark:border-white/[0.08] rounded-3xl overflow-hidden glass-card transition-all">
          <CardHeader className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-200/50 dark:border-white/[0.05] p-5 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Pro Subscribers</CardTitle>
            <div className="p-1.5 bg-green-500/10 rounded-lg">
              <Activity className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-4xl font-extrabold text-foreground">{activePro}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
         <h2 className="text-xl font-bold mb-4">Recent Users</h2>
         <div className="bg-white dark:bg-black/20 border border-slate-200/60 dark:border-white/[0.08] rounded-2xl p-4 overflow-hidden shadow-sm">
            {users && users.length > 0 ? (
              <div className="space-y-4">
                {users.slice(0, 10).map((u: any) => (
                  <div key={u.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                    <div className="flex flex-col">
                      <span className="font-semibold">{u.email}</span>
                      <span className="text-xs text-muted-foreground mr-2 text-mono font-mono">{u.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${u.user_metadata?.plan === 'pro' ? 'bg-primary/20 text-primary' : 'bg-slate-200 dark:bg-slate-800'}`}>{u.user_metadata?.plan || 'Free'}</span>
                       {u.user_metadata?.role === 'admin' && <span className="px-2 py-1 rounded text-xs font-bold uppercase bg-indigo-500/20 text-indigo-500">Admin</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No user data available. Try adding SUPABASE_SERVICE_ROLE_KEY to environment variables.</p>
            )}
         </div>
      </div>
    </div>
  )
}
