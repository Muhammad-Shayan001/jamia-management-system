'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2, Lock, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type SessionState = 'loading' | 'ready' | 'invalid'

export default function UpdatePasswordForm({ lang }: { lang: string }) {
  const isUrdu = lang === 'ur'
  const [sessionState, setSessionState] = useState<SessionState>('loading')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    // Supabase sends the reset token as a URL hash fragment (#access_token=...&type=recovery)
    // The Supabase JS client automatically parses this on page load via onAuthStateChange.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Session established from the recovery link — form is ready
        setSessionState('ready')
        setError(null)
      } else if (event === 'SIGNED_IN' && session) {
        // Already signed-in session (e.g. they are already logged in)
        setSessionState('ready')
      } else if (event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
        // Check if we have an active session from a server-side cookie exchange
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        if (currentSession) {
          setSessionState('ready')
        } else {
          // No session — the link was already used or expired
          setSessionState('invalid')
        }
      }
    })

    return () => subscription.unsubscribe()
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

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({ password })

      if (updateError) {
        setError(updateError.message)
        setIsPending(false)
        return
      }

      setSuccess(true)
      // Sign out so they log in fresh with the new password
      await supabase.auth.signOut()
    } catch (err: any) {
      setError(err?.message || (isUrdu ? 'پاس ورڈ اپ ڈیٹ کرنے میں ناکامی۔' : 'Failed to update password. Please try again.'))
    } finally {
      setIsPending(false)
    }
  }

  // ── LOADING STATE ──
  if (sessionState === 'loading') {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm font-medium">
          {isUrdu ? 'لنک تصدیق ہو رہا ہے...' : 'Verifying your reset link...'}
        </p>
      </div>
    )
  }

  // ── INVALID / EXPIRED LINK ──
  if (sessionState === 'invalid') {
    return (
      <div className="w-full space-y-6">
        <div className="mb-8 text-center space-y-2">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/40 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200 dark:border-red-800">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            {isUrdu ? 'لنک ناکارہ ہے' : 'Link Expired or Already Used'}
          </h1>
          <p className="text-muted-foreground text-sm font-medium px-4">
            {isUrdu
              ? 'یہ پاس ورڈ ری سیٹ لنک یا تو میعاد ختم ہو گئی ہے یا پہلے ہی استعمال ہو چکا ہے۔ نیا لنک حاصل کریں۔'
              : 'This password reset link has either expired or already been used. Please request a new one.'}
          </p>
        </div>
        <Link
          href={`/${lang}/forgot-password`}
          className="flex items-center justify-center w-full h-12 rounded-xl text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300"
        >
          {isUrdu ? 'نیا لنک منگوائیں' : 'Request a New Reset Link'}
        </Link>
        <div className="text-center">
          <Link href={`/${lang}/login`} className="text-sm font-bold text-primary hover:text-accent transition-colors">
            {isUrdu ? 'لاگ ان صفحہ پر واپس جائیں' : 'Back to Login'}
          </Link>
        </div>
      </div>
    )
  }

  // ── SUCCESS ──
  if (success) {
    return (
      <div className="w-full space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="mb-8 text-center space-y-2">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/40 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            {isUrdu ? 'پاس ورڈ تبدیل ہو گیا' : 'Password Updated!'}
          </h1>
          <p className="text-muted-foreground text-sm font-medium px-4">
            {isUrdu
              ? 'آپ کا پاس ورڈ کامیابی کے ساتھ تبدیل ہو گیا ہے۔ اب نئے پاس ورڈ سے لاگ ان کریں۔'
              : 'Your password has been updated successfully. Please log in with your new password.'}
          </p>
        </div>
        <Link
          href={`/${lang}/login`}
          className="flex items-center justify-center gap-2 w-full h-12 rounded-xl text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300"
        >
          <span>{isUrdu ? 'لاگ ان کریں' : 'Go to Login'}</span>
          <ArrowRight className={`w-5 h-5 ${isUrdu ? 'rotate-180' : ''}`} />
        </Link>
      </div>
    )
  }

  // ── FORM ──
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
              placeholder="Min. 8 characters"
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
          className="w-full h-12 rounded-xl text-base font-bold tracking-wide transition-all duration-300"
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

        <div className="text-center mt-4">
          <Link href={`/${lang}/login`} className="text-sm font-bold text-primary hover:text-accent transition-colors">
            {isUrdu ? 'لاگ ان صفحہ پر واپس جائیں' : 'Back to Login'}
          </Link>
        </div>
      </form>
    </div>
  )
}
