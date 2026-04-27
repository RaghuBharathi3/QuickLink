'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CreditCard, Shield, CheckCircle2, Loader2, Award, Zap, Crown, Sparkles, ArrowUpRight } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import Script from 'next/script'
import { PricingInteraction } from '@/components/ui/pricing-interaction'
import { cn } from '@/lib/utils'

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
        toast.error('Configuration Error: Razorpay Key is missing.');
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
        theme: { color: '#6366f1' }
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
        <p className="text-xs font-black tracking-widest text-muted-foreground uppercase">Accessing Billing Gateway...</p>
      </div>
    )
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="space-y-12 pb-20 max-w-7xl mx-auto">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Plan & Subs</h1>
          <p className="text-muted-foreground text-base font-medium mt-1">Manage your active subscription and resource allocation.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Active Status Card */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className={cn(
                "glass-card border-none rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group",
                subscription.plan === 'pro' ? "bg-primary/[0.03]" : "bg-slate-50 dark:bg-white/[0.01]"
              )}>
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-3xl rounded-full -mr-20 -mt-20 opacity-40 group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full -ml-10 -mb-10 opacity-30" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-10">
                    <div className={cn(
                      "p-4 rounded-2xl",
                      subscription.plan === 'pro' ? "bg-primary text-white shadow-xl shadow-primary/30" : "bg-slate-200 dark:bg-white/10 text-slate-500"
                    )}>
                      {subscription.plan === 'pro' ? <Crown className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
                    </div>
                    {subscription.plan === 'pro' && (
                      <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                         Active Node
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                     <p className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-60">Current Allocation</p>
                     <h2 className="text-5xl font-black tracking-tighter capitalize">
                        {subscription.plan || 'Free'} Tier
                     </h2>
                  </div>

                  <div className="mt-10 pt-10 border-t border-slate-200/50 dark:border-white/5 space-y-6">
                    <p className="text-sm font-bold text-foreground">Plan Capabilities:</p>
                    <ul className="space-y-4">
                      {[
                        { text: 'Dynamic QR Routing', active: true },
                        { text: 'Global Telemetry', active: subscription.plan === 'pro' },
                        { text: 'Unlimited Node Capacity', active: subscription.plan === 'pro' },
                        { text: 'Enterprise API Access', active: subscription.plan === 'pro' },
                      ].map((feature, i) => (
                        <li key={i} className={cn(
                          "flex items-center gap-3 text-sm font-medium",
                          feature.active ? "text-foreground" : "text-muted-foreground opacity-40"
                        )}>
                          <div className={cn(
                            "h-5 w-5 rounded-full flex items-center justify-center",
                            feature.active ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-100 dark:bg-white/5 text-slate-400"
                          )}>
                            <CheckCircle2 className="h-3 w-3" />
                          </div>
                          {feature.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>

            <div className="px-8 flex items-center gap-4 text-muted-foreground">
               <Shield className="h-5 w-5 opacity-40" />
               <p className="text-[11px] font-bold leading-relaxed uppercase tracking-wider opacity-60">
                  Transactions are secured with 256-bit SSL encryption. Processed by Razorpay.
               </p>
            </div>
          </div>

          {/* Pricing Component */}
          <div className="lg:col-span-7">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="w-full max-w-lg">
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
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}
