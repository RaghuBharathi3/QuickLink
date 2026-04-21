'use client'

import { useEffect, useState } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Plus, Edit, Trash2, QrCode, BarChart3, Crown, Loader2 } from 'lucide-react'
import Link from 'next/link'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">QR Codes</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your dynamic QR routing links</p>
        </div>
        <Link href="/dashboard/qrcodes/new" className={buttonVariants({ className: 'rounded-full shadow-md hover-lift' })}>
          <Plus className="mr-2 h-4 w-4" /> Create QR Code
        </Link>
      </div>

      {planInfo && (
        <motion.div
           initial={{ opacity: 0, y: -4 }}
           animate={{ opacity: 1, y: 0 }}
           className={`flex items-center justify-between border rounded-xl px-4 py-3 ${
             planInfo.plan === 'pro' 
               ? 'bg-primary/5 hover:bg-primary/10 border-primary/20 transition-colors' 
               : 'bg-amber-50 border-amber-200/70'
           }`}
         >
           <div className="flex items-center gap-2.5">
             <Crown className={`h-4 w-4 flex-shrink-0 ${planInfo.plan === 'pro' ? 'text-primary' : 'text-amber-500'}`} />
             <p className={`text-sm font-medium ${planInfo.plan === 'pro' ? 'text-primary' : 'text-amber-800'}`}>
               {planInfo.plan === 'pro' 
                 ? `Pro Plan Active: Unlimited limits (${planInfo.current} codes active)`
                 : `Free plan: ${planInfo.current} / ${planInfo.limit} QR codes used`}
             </p>
           </div>
           {planInfo.plan !== 'pro' && (
             <Link href="/dashboard/billing" className={buttonVariants({ size: 'sm', variant: 'outline', className: 'rounded-full border-amber-300 text-amber-700 hover:bg-amber-100 text-xs' })}>
               Upgrade
             </Link>
           )}
        </motion.div>
      )}

      <div className="w-full">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading...
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200/60 dark:border-white/[0.08] overflow-hidden glass-card">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-white/[0.02]">
                <TableRow className="border-b-slate-200/50 dark:border-b-white/[0.05] hover:bg-transparent">
                  <TableHead className="font-semibold text-muted-foreground py-4">Title</TableHead>
                  <TableHead className="font-semibold text-muted-foreground hidden sm:table-cell">Short ID</TableHead>
                  <TableHead className="font-semibold text-muted-foreground hidden lg:table-cell">Destination</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Scans</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right font-semibold text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.map((code) => (
                  <TableRow key={code.id} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-white/[0.01] border-b border-slate-200/30 dark:border-white/[0.05]">
                    <TableCell className="font-medium">
                      <div>
                        {code.title || 'Untitled'}
                        {code.password_hash && (
                          <span className="ml-2 text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full font-semibold">🔒 PWD</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-muted-foreground font-mono text-xs bg-gray-100 px-2 py-1 rounded-lg">{code.short_id}</span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell max-w-[180px] truncate text-muted-foreground text-sm" title={code.original_url}>
                      {code.original_url}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                        {code.scan_count}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        isExpired(code)
                          ? 'bg-red-100 text-red-600'
                          : code.is_active
                          ? 'bg-green-100/70 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          isExpired(code) ? 'bg-red-400' : code.is_active ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                        {isExpired(code) ? 'Expired' : code.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/dashboard/analytics/${code.id}`}
                          className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'hover:bg-blue-50 hover:text-blue-600 rounded-xl h-8 w-8' })}
                          title="View Analytics"
                        >
                          <BarChart3 className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                          href={`/dashboard/qrcodes/${code.id}`}
                          className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'hover:bg-gray-100 rounded-xl h-8 w-8' })}
                          title="Edit"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(code.id)}
                          className="hover:bg-red-50 hover:text-red-600 rounded-xl h-8 w-8 text-muted-foreground"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {codes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-16">
                      <div className="flex flex-col items-center justify-center gap-3 text-center">
                        <div className="bg-gray-100 p-4 rounded-2xl">
                          <QrCode className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-muted-foreground font-medium">No QR codes yet</p>
                        <Link href="/dashboard/qrcodes/new" className={buttonVariants({ size: 'sm', className: 'rounded-full mt-1' })}>
                          <Plus className="mr-1.5 h-3.5 w-3.5" /> Create your first QR code
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
