"use client"

import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { QrCode, ArrowRight, BarChart3, Globe, Zap, Code2, Lock, Smartphone, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen text-slate-900 dark:text-slate-50 font-sans selection:bg-primary/30 bg-transparent">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 dark:border-white/[0.08] bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="bg-primary text-white p-1.5 rounded-md">
              <QrCode className="h-5 w-5" />
            </div>
            <span className="font-bold text-[17px] tracking-tight">Quicklink</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            {['Features', 'Pricing'].map((item) => (
              <Link key={item} href="#" className="text-[14px] font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                {item}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-[14px] font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors hidden sm:block">
              Log in
            </Link>
            <Link 
              href="/signup" 
              className="inline-flex h-9 items-center justify-center rounded-full bg-slate-900 dark:bg-white px-4 py-2 text-[14px] font-medium text-white dark:text-slate-900 shadow transition-colors hover:bg-slate-800 dark:hover:bg-slate-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 md:pt-32 md:pb-40">
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] dark:from-[#primary]/20 dark:to-[#4f46e5]/20 opacity-20 dark:opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
          </div>

          <div className="container mx-auto px-4 md:px-8 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <Link href="/signup" className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-medium mb-8 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                Quicklink Beta 2.0 is live <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto mb-6 leading-tight dark:text-white">
                The modern standard for <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-500">QR code infrastructure.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                Create dynamic routing, track real-time granular analytics, and seamlessly integrate via robust APIs. Built for global scale.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  href="/signup" 
                  className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-full bg-slate-900 dark:bg-white px-8 text-base font-medium text-white dark:text-slate-900 shadow-xl transition-all hover:bg-slate-800 dark:hover:bg-slate-200 hover:scale-105 active:scale-95"
                >
                  Start Building Free
                </Link>
                <Link 
                  href="#" 
                  className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-full bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 px-8 text-base font-medium text-slate-900 dark:text-white transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  Read Documentation
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Abstract Dashboard Mockup */}
        <section className="container mx-auto px-4 md:px-8 pb-32">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="rounded-[2.5rem] bg-slate-900 dark:bg-[#111] p-2 md:p-6 shadow-2xl border border-slate-800 dark:border-white/10 relative overflow-hidden ring-1 ring-white/10"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 dark:from-[#0A0A0A] to-transparent pointer-events-none z-10" />
            <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            
            <div className="rounded-[2rem] bg-[#0A0A0A] border border-white/5 overflow-hidden flex flex-col md:flex-row relative z-0 aspect-[16/10] md:aspect-[21/9]">
              {/* Fake Sidebar */}
              <div className="hidden md:flex w-64 border-r border-white/5 flex-col p-4 space-y-4">
                <div className="flex gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                </div>
                <div className="h-6 w-32 bg-white/5 rounded-md" />
                <div className="h-6 w-24 bg-white/5 rounded-md" />
                <div className="h-6 w-28 bg-white/5 rounded-md" />
              </div>
              
              {/* Fake Content area */}
              <div className="flex-1 p-8 flex flex-col gap-6 relative">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                   <div>
                     <div className="h-5 w-40 bg-white/10 rounded-md mb-2" />
                     <div className="h-3 w-64 bg-white/5 rounded-md" />
                   </div>
                   <div className="h-8 w-24 bg-primary/20 border border-primary/30 rounded-full" />
                </div>
                
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                      <div className="h-3 w-16 bg-white/5 rounded-sm mb-3" />
                      <div className="h-8 w-24 bg-white/10 rounded-md" />
                    </div>
                  ))}
                </div>

                {/* Graph Area */}
                <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-end gap-2">
                  {[40, 70, 45, 90, 65, 85, 30, 50, 100, 75, 40].map((h, i) => (
                    <div key={i} className="flex-1 bg-primary/40 rounded-t-sm transition-all duration-1000" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Feature Bento Grid */}
        <section className="container mx-auto px-4 md:px-8 py-24 border-t border-slate-200/50 dark:border-white/5">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Engineered for control.</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
              Everything you need to manage physical-to-digital routing at an enterprise scale.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="md:col-span-2 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-3xl p-8 hover:shadow-xl transition-all hover:border-primary/20">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-500">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Dynamic Routing Engine</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">
                Change link destinations instantly without reprinting codes. Route users based on their location, device type, or time of day.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-3xl p-8 hover:shadow-xl transition-all hover:border-primary/20">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 text-purple-500">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Granular Analytics</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Real-time tracking of scans, unique visitors, browser data, and geographic distribution.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-3xl p-8 hover:shadow-xl transition-all hover:border-primary/20">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-6 text-amber-500">
                <Code2 className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Developer API</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Generate codes and fetch analytics programmatically via our robust REST API and Webhooks.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="md:col-span-2 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-3xl p-8 hover:shadow-xl transition-all hover:border-primary/20 flex flex-col justify-end relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <QrCode className="h-40 w-40" />
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6 text-emerald-500 relative z-10">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold mb-2 relative z-10">Enterprise Security</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-md relative z-10">
                SSO integrations, deeply configurable RBAC, and strict SOC2 compliant infrastructure keeping your data immutable.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 md:px-8 py-32">
          <div className="rounded-[3rem] bg-slate-900 dark:bg-primary/10 border border-slate-800 dark:border-primary/20 p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-primary/20 to-transparent opacity-50 pointer-events-none" />
            
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 relative z-10">
              Ready to modernize your links?
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto relative z-10">
              Join thousands of forward-thinking companies building their physical-to-digital funnels with Quicklink.
            </p>
            <Link 
              href="/signup" 
              className="inline-flex h-12 items-center justify-center rounded-full bg-white dark:bg-primary px-8 text-base font-medium text-slate-900 dark:text-white shadow-xl transition-all hover:scale-105 active:scale-95 relative z-10"
            >
              Start Building Now
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 dark:border-white/5 bg-white dark:bg-[#0A0A0A] pt-16 pb-8">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <div className="bg-primary text-white p-1 rounded-sm">
                  <QrCode className="h-4 w-4" />
                </div>
                <span className="font-bold text-[16px] tracking-tight">Quicklink</span>
              </Link>
              <p className="text-slate-500 text-sm max-w-xs">
                The modern standard for QR code generation and dynamic routing infrastructure.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-sm">Product</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Integrations</Link></li>
                <li><Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Changelog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-sm">Resources</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">API Reference</Link></li>
                <li><Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Community</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-sm">Company</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Customers</Link></li>
                <li><Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-200/50 dark:border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} Quicklink Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
