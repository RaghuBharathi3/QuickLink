'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { BarChart3, ArrowRight, QrCode, Lock, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

export default function AnalyticsIndexPage() {
  const [isPro, setIsPro] = useState<boolean>(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      const plan = user?.user_metadata?.plan || 'free'
      if (plan !== 'pro') {
        setIsPro(false)
      }
    })
  }, [supabase])

  if (!isPro) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Unlock detailed insights and engagement metrics.</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-card border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl">
            <CardContent className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="bg-primary/10 p-5 rounded-full mb-2">
                <Lock className="h-10 w-10 text-primary" />
              </div>
              <div className="text-center max-w-sm">
                <p className="font-bold text-lg text-foreground mb-1 flex justify-center items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" /> Pro Feature
                </p>
                <p className="text-sm text-muted-foreground">
                  Upgrade to Quicklink Pro to access comprehensive analytics, track daily scans, geographic data, and engagement trends.
                </p>
              </div>
              <Link href="/dashboard/billing">
                <Button className="rounded-xl mt-4 gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                  Upgrade to Pro <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Select a QR code to view its detailed analytics.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass-card border-none rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="bg-primary/5 p-5 rounded-2xl">
              <BarChart3 className="h-12 w-12 text-primary/40" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground mb-1">No QR code selected</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Go to your QR Codes list and click the <BarChart3 className="inline h-3.5 w-3.5 mx-0.5" /> icon to view analytics for a specific code.
              </p>
            </div>
            <Link href="/dashboard/qrcodes">
              <Button className="rounded-xl mt-2 gap-1.5">
                <QrCode className="h-4 w-4" /> View QR Codes <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
