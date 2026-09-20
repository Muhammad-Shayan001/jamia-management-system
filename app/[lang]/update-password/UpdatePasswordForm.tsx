'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2, Lock, ArrowRight, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { updatePassword } from '@/lib/actions/auth'
import Link from 'next/link'

export default function UpdatePasswordForm({ lang }: { lang: string }) {
  const isUrdu = lang === 'ur'
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Process any URL hash tokens or session from Supabase recovery redirect
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        setError(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!password || password.length < 8) {
      setError(isUrdu ? 'پاس ورڈ کم از کم 8 حروف پر مشتمل ہونا چاہیے۔' : 'Password must be at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError(isUrdu ? 'پاس ورڈ مماثل نہیں ہیں۔' : 'Passwords do not match.')
      return
    }

    setIsPending(true)

    // Method 1: Client-side update (handles hash fragment access tokens and active browser sessions)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { error: updateError } = await supabase.auth.updateUser({ password })
        if (!updateError) {
          setIsPending(false)
          setSuccess(true)
          setMessage(isUrdu ? 'پاس ورڈ کامیابی کے ساتھ تبدیل ہو گیا۔ اب آپ لاگ ان کر سکتے ہیں۔' : 'Password updated successfully! You can now log in.')
          return
        }
      }
    } catch (clientErr) {
      console.warn('Client update fallback:', clientErr)
    }

    // Method 2: Server action update (handles server session cookies from /api/auth/callback)
    try {
      const formData = new FormData()
      formData.set('password', password)
      formData.set('confirmPassword', confirmPassword)
      const res = await updatePassword(null, formData)
      setIsPending(false)

      if (res?.error) {
        setError(res.error)
      } else {
        setSuccess(true)
        setMessage(res?.message || (isUrdu ? 'پاس ورڈ کامیابی کے ساتھ تبدیل ہو گیا۔' : 'Password updated successfully! You can now log in.'))
      }
    } catch (serverErr: any) {
      setIsPending(false)
      setError(serverErr?.message || (isUrdu ? 'پاس ورڈ اپ ڈیٹ کرنے میں ناکامی۔' : 'Failed to update password. Please try again.'))
    }
  }

  return (
    <div className="w-full">
      <div className="mb-8 text-center space-y-2">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
          <ShieldCheck className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-black text-foreground tracking-tight">
          {isUrdu ? 'نیا پاس ورڈ درج کریں' : 'Set New Password'}
        </h1>
        <p className="text-muted-foreground text-sm font-medium px-4">
          {isUrdu 
            ? 'اپنے اکاؤنٹ کے لیے نیا محفوظ پاس ورڈ درج کریں۔' 
            : 'Please enter a new secure password for your account.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-4 bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start gap-3 animate-in fade-in zoom-in-95 duration-300">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {success ? (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">{message}</p>
            </div>
            <Link
              href={`/${lang}/login`}
              className="flex items-center justify-center w-full h-12 rounded-xl text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300"
            >
              {isUrdu ? 'لاگ ان کریں' : 'Go to Login'}
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-bold text-foreground/80">
                {isUrdu ? 'نیا پاس ورڈ' : 'New Password'}
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  disabled={isPending}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 rounded-xl border-border/50 bg-background/50 focus:bg-background transition-colors text-sm"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm font-bold text-foreground/80">
                {isUrdu ? 'پاس ورڈ کی تصدیق کریں' : 'Confirm New Password'}
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  disabled={isPending}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 h-12 rounded-xl border-border/50 bg-background/50 focus:bg-background transition-colors text-sm"
                  dir="ltr"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-12 rounded-xl text-base font-bold tracking-wide shadow-Jamia transition-all duration-300"
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{isUrdu ? 'محفوظ کر رہا ہے...' : 'Updating...'}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>{isUrdu ? 'پاس ورڈ اپ ڈیٹ کریں' : 'Update Password'}</span>
                  <ArrowRight className={`w-5 h-5 ${isUrdu ? 'rotate-180' : ''}`} />
                </div>
              )}
            </Button>
          </>
        )}
      </form>
    </div>
  )
}
