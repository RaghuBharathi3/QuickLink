'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { BarChart3, ArrowRight, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function AnalyticsIndexPage() {
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
