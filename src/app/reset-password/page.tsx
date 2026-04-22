'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { ShaderAnimation } from '@/components/ui/shader-animation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.')
      setLoading(false)
      return
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error('Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a number, and a special character.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Password updated successfully!')
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
          <h1 className="text-3xl font-bold tracking-tight text-white">Reset Password</h1>
          <p className="text-sm text-gray-300">Enter your new secure password</p>
        </div>
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white font-medium">New Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 rounded-xl bg-white/10 text-white placeholder:text-white/40 border-white/20 focus:bg-white/20 transition-colors" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white font-medium">Confirm New Password</Label>
            <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="h-11 rounded-xl bg-white/10 text-white placeholder:text-white/40 border-white/20 focus:bg-white/20 transition-colors" />
          </div>
          <Button type="submit" className="w-full h-11 rounded-xl font-medium text-black bg-white hover:bg-gray-200 shadow-md hover:scale-[1.02] transition-transform" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </div>
    </div>
  )
}
