"use client"

import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { QrCode, ArrowRight, BarChart3, Globe, Zap, Code2, Lock, Smartphone, ChevronRight, Activity, ScanEye, ZapIcon } from 'lucide-react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'
import { AuroraBackground } from '@/components/ui/aurora-background'
import { PricingInteraction } from '@/components/ui/pricing-interaction'
import { useEffect } from 'react'

export default function LandingPage() {
  const { scrollYProgress } = useScroll()
  
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

  return (
    <div className="flex flex-col min-h-screen text-slate-900 dark:text-slate-50 font-sans selection:bg-primary/30 bg-transparent overflow-x-hidden">
      {/* Navigation */}
      <header className="fixed top-0 z-[100] w-full border-b border-white/5 bg-white/40 dark:bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="bg-primary text-white p-2 rounded-xl shadow-lg shadow-primary/20 transition-transform group-hover:scale-110 group-hover:rotate-3">
              <QrCode className="h-6 w-6" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">Quicklink</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-10">
            {['Features', 'Pricing', 'API'].map((item) => (
              <Link key={item} href={`#${item.toLowerCase()}`} className="text-[15px] font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-all relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            <Link href="/login" className="text-[15px] font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors hidden sm:block">
              Log in
            </Link>
            <Link 
              href="/signup" 
              className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 dark:bg-white px-6 text-[15px] font-semibold text-white dark:text-slate-950 shadow-2xl transition-all hover:scale-105 active:scale-95 hover:shadow-primary/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <AuroraBackground className="pt-20 pb-0">
          <motion.div 
            style={{ opacity, scale }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="container mx-auto px-4 md:px-8 text-center relative z-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 text-sm font-medium mb-10 backdrop-blur-md shadow-xl">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-ping"></span>
              <span className="text-slate-700 dark:text-slate-300">Quicklink v2.5 is now in public beta</span>
              <ChevronRight className="h-4 w-4 opacity-50" />
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tight max-w-5xl mx-auto mb-8 leading-[1.1] dark:text-white drop-shadow-sm">
              Physical links, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-indigo-600 dark:from-primary dark:via-blue-400 dark:to-indigo-300">infinite possibilities.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
              The premium infrastructure for dynamic QR routing, granular real-time analytics, and high-performance developer APIs.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link 
                href="/signup" 
                className="w-full sm:w-auto inline-flex h-14 items-center justify-center rounded-2xl bg-primary px-10 text-lg font-bold text-white shadow-[0_20px_50px_rgba(var(--primary),0.3)] transition-all hover:scale-105 active:scale-95 hover:brightness-110 group"
              >
                Create Your First Code
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link 
                href="#features" 
                className="w-full sm:w-auto inline-flex h-14 items-center justify-center rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-10 text-lg font-bold text-slate-900 dark:text-white backdrop-blur-md transition-all hover:bg-slate-50 dark:hover:bg-white/10 shadow-lg"
              >
                Explore Features
              </Link>
            </div>

            {/* Floaties */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-20 top-1/2 hidden lg:block p-6 rounded-3xl glass-card rotate-12"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-green-500/20 text-green-500"><ScanEye size={20} /></div>
                <div className="text-left font-bold text-sm">+2.4k Scans</div>
              </div>
              <div className="w-32 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-green-500" />
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -right-20 top-1/4 hidden lg:block p-6 rounded-3xl glass-card -rotate-6"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-500"><Activity size={20} /></div>
                <div className="text-left">
                  <div className="font-bold text-sm">99.9% Uptime</div>
                  <div className="text-[10px] opacity-50 uppercase tracking-widest font-black">Stable</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AuroraBackground>

        {/* Live Preview / Dashboard Demo */}
        <section className="container mx-auto px-4 md:px-8 -mt-20 relative z-20 mb-40">
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, type: "spring", bounce: 0.2 }}
            className="rounded-[3rem] p-1.5 bg-gradient-to-br from-slate-200 via-slate-400 to-slate-200 dark:from-white/20 dark:via-white/5 dark:to-white/20 shadow-[0_50px_100px_rgba(0,0,0,0.1)] dark:shadow-[0_50px_100px_rgba(0,0,0,0.5)]"
          >
            <div className="rounded-[2.8rem] bg-white dark:bg-[#050505] overflow-hidden aspect-[16/9] border border-white/10 flex">
              {/* Fake Sidebar */}
              <div className="hidden md:flex w-72 border-r border-slate-100 dark:border-white/5 flex-col p-8 space-y-8 bg-slate-50/30 dark:bg-white/[0.01]">
                <div className="flex gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-red-400/30 border border-red-400/50" />
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-400/30 border border-amber-400/50" />
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-400/30 border border-emerald-400/50" />
                </div>
                <div className="space-y-4 pt-10">
                  <div className="h-10 w-full bg-primary/10 rounded-2xl flex items-center px-4 gap-3">
                    <div className="w-4 h-4 bg-primary rounded-sm" />
                    <div className="h-4 w-24 bg-primary/20 rounded-md" />
                  </div>
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-10 w-full bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center px-4 gap-3 opacity-50">
                      <div className="w-4 h-4 bg-slate-300 dark:bg-white/10 rounded-sm" />
                      <div className="h-4 w-20 bg-slate-200 dark:bg-white/10 rounded-md" />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Fake Main Content */}
              <div className="flex-1 p-10 flex flex-col gap-10">
                <div className="flex justify-between items-end">
                  <div className="space-y-2">
                    <div className="h-8 w-48 bg-slate-900 dark:bg-white rounded-xl" />
                    <div className="h-4 w-72 bg-slate-200 dark:bg-white/10 rounded-lg" />
                  </div>
                  <div className="h-12 w-32 bg-primary rounded-2xl shadow-lg shadow-primary/20" />
                </div>
                
                <div className="grid grid-cols-3 gap-6">
                  {[1,2,3].map(i => (
                    <div key={i} className="p-6 rounded-3xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 space-y-4">
                      <div className="h-4 w-20 bg-slate-200 dark:bg-white/10 rounded-md" />
                      <div className="h-10 w-28 bg-slate-900 dark:bg-white rounded-xl" />
                    </div>
                  ))}
                </div>

                <div className="flex-1 rounded-[2rem] bg-slate-900 dark:bg-[#0A0A0A] border border-white/5 p-8 relative group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  <div className="h-full w-full flex items-end gap-3 pb-2 relative z-10">
                    {[40, 70, 45, 90, 65, 85, 30, 50, 100, 75, 40, 60, 80, 55, 95].map((h, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        transition={{ delay: i * 0.05, duration: 0.8 }}
                        className="flex-1 bg-primary/40 rounded-t-lg backdrop-blur-sm" 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Feature Bento Grid */}
        <section id="features" className="container mx-auto px-4 md:px-8 py-40">
          <div className="text-center mb-24 space-y-4">
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-primary font-bold tracking-[0.2em] uppercase text-xs"
            >
              Core Infrastructure
            </motion.span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Engineered for absolute control.</h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
              Everything you need to manage physical-to-digital routing at global scale.
            </p>
          </div>

          <div className="grid md:grid-cols-12 gap-8">
            {/* Feature 1 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-8 group bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-[3rem] p-12 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500">
                <Globe className="h-64 w-64" />
              </div>
              <div className="h-16 w-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-10 text-blue-500 group-hover:scale-110 transition-transform">
                <Globe className="h-8 w-8" />
              </div>
              <h3 className="text-3xl font-black mb-6">Dynamic Routing Engine</h3>
              <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl font-medium">
                Change link destinations instantly without reprinting codes. Route users based on their location, device type, or time of day with zero latency.
              </p>
              <div className="mt-12 flex gap-4">
                <div className="px-5 py-2 rounded-full bg-slate-100 dark:bg-white/5 text-sm font-bold">Edge Routing</div>
                <div className="px-5 py-2 rounded-full bg-slate-100 dark:bg-white/5 text-sm font-bold">Geo-Fencing</div>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-4 group bg-slate-900 dark:bg-primary/5 border border-slate-800 dark:border-primary/20 rounded-[3rem] p-12 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
              <div className="h-16 w-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-10 text-purple-500 group-hover:scale-110 transition-transform relative z-10">
                <BarChart3 className="h-8 w-8" />
              </div>
              <h3 className="text-3xl font-black mb-6 text-white relative z-10">Granular Analytics</h3>
              <p className="text-xl text-slate-400 leading-relaxed font-medium relative z-10">
                Real-time tracking of scans, unique visitors, and deep device fingerprinting.
              </p>
              <div className="mt-10 h-32 flex items-end gap-2 relative z-10">
                {[20, 40, 30, 60, 45, 80].map((h, i) => (
                   <div key={i} className="flex-1 bg-primary/30 rounded-t-lg" style={{ height: `${h}%` }} />
                ))}
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-4 group bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-[3rem] p-12"
            >
              <div className="h-16 w-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-10 text-amber-500 group-hover:scale-110 transition-transform">
                <Code2 className="h-8 w-8" />
              </div>
              <h3 className="text-3xl font-black mb-6">Developer First</h3>
              <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Generate codes and fetch insights via our robust REST API and real-time Webhooks.
              </p>
              <div className="mt-10 bg-slate-900 rounded-2xl p-6 font-mono text-[13px] text-primary/80 overflow-hidden shadow-2xl">
                 <span className="text-blue-400">POST</span> /api/codes <br />
                 <span className="text-slate-500">{"{"}</span> <br />
                 &nbsp;&nbsp;<span className="text-emerald-400">"url"</span>: <span className="text-amber-300">"https://..."</span> <br />
                 <span className="text-slate-500">{"}"}</span>
              </div>
            </motion.div>

            {/* Feature 4 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-8 group bg-gradient-to-br from-primary to-indigo-600 rounded-[3rem] p-12 relative overflow-hidden text-white"
            >
              <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                <Lock className="h-64 w-64" />
              </div>
              <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center mb-10 text-white group-hover:scale-110 transition-transform">
                <ZapIcon className="h-8 w-8" />
              </div>
              <h3 className="text-3xl font-black mb-6">Enterprise Grade</h3>
              <p className="text-xl text-white/80 leading-relaxed max-w-xl font-medium">
                SSO integrations, strict RBAC, and SOC2 compliant infrastructure designed to keep your physical routing immutable and secure.
              </p>
              <div className="mt-12 flex gap-4">
                <div className="px-6 py-3 rounded-2xl bg-white/10 text-sm font-black tracking-widest uppercase">99.99% SLA</div>
                <div className="px-6 py-3 rounded-2xl bg-white/10 text-sm font-black tracking-widest uppercase">Global CDN</div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="container mx-auto px-4 md:px-8 py-40 border-y border-white/5 relative overflow-hidden">
           <div className="absolute inset-0 bg-primary/5 blur-[120px] pointer-events-none" />
           
           <div className="flex flex-col lg:flex-row items-center justify-between gap-20">
              <div className="max-w-2xl text-center lg:text-left space-y-8">
                 <h2 className="text-5xl md:text-7xl font-black tracking-tighter">Simple pricing for <br /> global scale.</h2>
                 <p className="text-xl text-slate-600 dark:text-slate-400 font-medium">
                    Start for free and upgrade as you grow. No hidden fees, no complex tiers. Just high-performance infrastructure.
                 </p>
                 <div className="space-y-4">
                    {['Unlimited Dynamic Codes', 'Real-time Granular Analytics', 'Custom Branding & Styling', 'Developer API Access'].map(f => (
                      <div key={f} className="flex items-center gap-3 justify-center lg:justify-start">
                         <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Zap size={14} fill="currentColor" />
                         </div>
                         <span className="font-bold text-slate-700 dark:text-slate-300">{f}</span>
                      </div>
                    ))}
                 </div>
              </div>
              
              <div className="w-full flex justify-center lg:justify-end">
                 <PricingInteraction 
                    starterMonth={29}
                    starterAnnual={299}
                    proMonth={99}
                    proAnnual={999}
                    onSubscribe={(idx) => {
                      window.location.href = '/signup'
                    }}
                 />
              </div>
           </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 md:px-8 py-60">
          <motion.div 
            whileInView={{ scale: [0.9, 1], opacity: [0, 1] }}
            className="rounded-[4rem] bg-slate-950 p-20 text-center relative overflow-hidden group shadow-[0_100px_100px_rgba(0,0,0,0.5)]"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent opacity-20 pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
            
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-white mb-10 relative z-10 leading-none">
              Modernize your <br /> physical links.
            </h2>
            <p className="text-white/60 text-xl md:text-2xl mb-16 max-w-2xl mx-auto relative z-10 font-medium leading-relaxed">
              Join thousands of engineering teams building the future of physical-to-digital funnels.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
              <Link 
                href="/signup" 
                className="w-full sm:w-auto inline-flex h-16 items-center justify-center rounded-2xl bg-white px-12 text-xl font-black text-slate-950 shadow-2xl transition-all hover:scale-105 active:scale-95"
              >
                Start Building Now
              </Link>
              <Link 
                href="/login" 
                className="w-full sm:w-auto inline-flex h-16 items-center justify-center rounded-2xl bg-white/10 border border-white/20 px-12 text-xl font-black text-white backdrop-blur-md transition-all hover:bg-white/20"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-white dark:bg-[#050505] pt-32 pb-16 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-20 mb-32">
            <div className="col-span-2 space-y-8">
              <Link href="/" className="flex items-center gap-3 mb-6">
                <div className="bg-primary text-white p-2 rounded-xl shadow-lg">
                  <QrCode className="h-6 w-6" />
                </div>
                <span className="font-black text-2xl tracking-tighter">Quicklink</span>
              </Link>
              <p className="text-slate-500 text-lg max-w-sm font-medium leading-relaxed">
                The high-performance standard for QR code generation and dynamic routing infrastructure. Built for the modern web.
              </p>
              <div className="flex gap-6">
                 {/* Socials placeholders */}
                 {[1,2,3].map(i => <div key={i} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-white/5" />)}
              </div>
            </div>
            
            {['Product', 'Resources', 'Company'].map(title => (
              <div key={title}>
                <h4 className="font-black mb-8 text-sm uppercase tracking-[0.2em]">{title}</h4>
                <ul className="space-y-4 text-lg text-slate-500 font-medium">
                  <li><Link href="#" className="hover:text-primary transition-colors">Features</Link></li>
                  <li><Link href="#" className="hover:text-primary transition-colors">Pricing</Link></li>
                  <li><Link href="#" className="hover:text-primary transition-colors">Documentation</Link></li>
                  <li><Link href="#" className="hover:text-primary transition-colors">Changelog</Link></li>
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-white/5 pt-16 flex flex-col md:flex-row items-center justify-between gap-10">
            <p className="text-slate-500 font-bold">
              © {new Date().getFullYear()} Quicklink Infrastructure Inc.
            </p>
            <div className="flex items-center gap-10 font-bold text-slate-500">
              <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-primary transition-colors">Security</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

