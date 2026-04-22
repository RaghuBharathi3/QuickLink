'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CreditCard, Shield, CheckCircle2, Loader2, Award } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import Script from 'next/script'
import { PricingInteraction } from '@/components/ui/pricing-interaction'

export default function BillingPage() {
  const supabase = createClient()
  const [subscription, setSubscription] = useState<any>({ plan: 'free' })
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')

  const loadBilling = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      setUserEmail(user.email || '')

      const { data: subData } = await supabase.from('subscriptions').select('*').eq('user_id', user.id).single()
      
      const metaPlan = user.user_metadata?.plan
      if (subData && subData.plan === 'pro') {
         setSubscription(subData)
      } else if (metaPlan) {
         setSubscription({ plan: metaPlan })
      }
    } catch {
      toast.error('Failed to load billing data')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadBilling()
  }, [loadBilling])

  const handlePayment = async (amountInRupees: number) => {
    setPaying(true)
    try {
      const orderRes = await fetch('/api/billing/create-order', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountInRupees })
      })
      const { orderId, amount, key } = await orderRes.json()

      if (!key) {
        console.error('CRITICAL: Razorpay Key was not returned by /api/billing/create-order');
        toast.error('Configuration Error: Razorpay Key is missing in Vercel environment variables.');
        setPaying(false);
        return;
      }

      const options = {
        key: key, 
        amount,
        currency: 'INR',
        name: 'Quicklink Pro',
        description: 'Premium Unlock',
        order_id: orderId,
        handler: async function (response: any) {
          const verifyRes = await fetch('/api/billing/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...response, userId })
          })

          if (verifyRes.ok) {
            toast.success('Payment successful! Welcome to Pro.')
            setSubscription((s: any) => ({ ...s, plan: 'pro' }))
          } else {
            toast.error('Payment verification failed.')
          }
        },
        prefill: { email: userEmail },
        theme: { color: '#000000' }
      }

      const razorpay = new (window as any).Razorpay(options)
      razorpay.open()
    } catch (e: any) {
      toast.error('Payment initiation failed')
    } finally {
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="space-y-8 max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Billing & Plans</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your active subscription and upgrade paths.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Active Plan Widget */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }} className="w-full">
              <Card className="glass-card shadow-sm border border-slate-200/60 dark:border-white/[0.08] rounded-3xl overflow-hidden h-full relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                <CardHeader className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-200/50 dark:border-white/[0.05] p-6">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Award className={`h-5 w-5 ${subscription.plan === 'pro' ? 'text-primary' : 'text-slate-500'}`} />
                    Current Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-extrabold capitalize">{subscription.plan || 'Free'}</span>
                    {subscription.plan === 'pro' && <span className="text-primary text-sm font-bold mb-1">Active</span>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {subscription.plan === 'pro' ? 'You have full access to all Quicklink Premium features, including unlimited edits.' : 'You are currently on the Free Tier and subject to scan limitations.'}
                  </p>
                  
                  {subscription.plan !== 'pro' && (
                    <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-2">
                      <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Included in Free:</p>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Basic Link Routing</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Standard QR Generation</li>
                        <li className="flex items-center gap-2 opacity-50"><Shield className="h-4 w-4" /> Limited Scans/Month</li>
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Pricing Component (Interactive Upgrade Path) */}
          <div className="lg:col-span-3 flex justify-center lg:justify-end w-full">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="w-full max-w-sm">
              <PricingInteraction 
                starterMonth={29} 
                starterAnnual={299} 
                proMonth={99} 
                proAnnual={999} 
                onSubscribe={(planIndex, period) => {
                  if (planIndex > 0) {
                    const amount = period === 'monthly' ? 29 : 299;
                    handlePayment(amount);
                  }
                }}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}
