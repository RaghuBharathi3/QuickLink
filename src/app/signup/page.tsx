'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import Link from 'next/link'
import { ShaderAnimation } from '@/components/ui/shader-animation'
export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      toast.error('Supabase credentials are not configured in .env.local yet.')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Signed up successfully! Check your email to verify.')
        router.push('/login')
      }
    } catch (err) {
      const e = err as Error
      toast.error(e.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center relative overflow-hidden">
      <ShaderAnimation />
      
      <div className="w-full max-w-md p-8 sm:p-10 space-y-8 glass-card rounded-2xl relative z-10 m-4 bg-white/5 dark:bg-black/40 backdrop-blur-3xl border border-white/10 shadow-2xl">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">Create an account</h1>
          <p className="text-sm text-gray-300">Start creating dynamic QR codes in seconds</p>
        </div>
        <form onSubmit={handleSignup} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white font-medium">Email address</Label>
            <Input id="email" type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 rounded-xl bg-white/10 text-white placeholder:text-white/40 border-white/20 focus:bg-white/20 transition-colors" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white font-medium">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 rounded-xl bg-white/10 text-white placeholder:text-white/40 border-white/20 focus:bg-white/20 transition-colors" />
          </div>
          <Button type="submit" className="w-full h-11 rounded-xl font-medium text-black bg-white hover:bg-gray-200 shadow-md hover:scale-[1.02] transition-transform" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign up for free'}
          </Button>
        </form>
        <div className="text-center text-sm pt-2">
          <span className="text-gray-400">Already have an account? </span>
          <Link href="/login" className="text-white font-semibold hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  )
}
