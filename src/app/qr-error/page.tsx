'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { QrCode, AlertTriangle, Clock, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

const reasons: Record<string, { icon: React.ElementType; title: string; desc: string; color: string }> = {
  not_found: {
    icon: QrCode,
    title: 'QR Code Not Found',
    desc: 'This QR code does not exist or has been removed.',
    color: 'text-gray-400',
  },
  inactive: {
    icon: AlertTriangle,
    title: 'QR Code Inactive',
    desc: 'This QR code has been deactivated by its owner.',
    color: 'text-orange-400',
  },
  expired: {
    icon: Clock,
    title: 'QR Code Expired',
    desc: 'This QR code has passed its expiration date.',
    color: 'text-red-400',
  },
  not_started: {
    icon: Clock,
    title: 'Not Active Yet',
    desc: 'This QR code has not started yet. Please try again later.',
    color: 'text-blue-400',
  },
  rate_limited: {
    icon: WifiOff,
    title: 'Too Many Requests',
    desc: 'Too many requests from your device. Please wait and try again.',
    color: 'text-purple-400',
  },
}

function QRErrorContent() {
  const searchParams = useSearchParams()
  const reason = searchParams.get('reason') || 'not_found'
  const info = reasons[reason] || reasons.not_found
  const Icon = info.icon

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center max-w-md"
      >
        <div className="mx-auto w-20 h-20 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-6">
          <Icon className={`h-10 w-10 ${info.color}`} />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-2">{info.title}</h1>
        <p className="text-muted-foreground text-sm mb-8">{info.desc}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button variant="outline" className="rounded-xl">Go to Homepage</Button>
          </Link>
          <Link href="/signup">
            <Button className="rounded-xl">Create Your Own QR Code</Button>
          </Link>
        </div>
        <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground">
          <QrCode className="h-4 w-4" />
          <span className="text-xs font-medium">Powered by Quicklink</span>
        </div>
      </motion.div>
    </div>
  )
}

export default function QRErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    }>
      <QRErrorContent />
    </Suspense>
  )
}
