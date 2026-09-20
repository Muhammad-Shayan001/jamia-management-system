'use client'

import { useActionState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2, ArrowRight, ShieldCheck, Mail } from 'lucide-react'
import { resetPassword } from '@/lib/actions/auth'
import Link from 'next/link'

export default function ForgotPasswordForm({ lang }: { lang: string }) {
  const isUrdu = lang === 'ur'
  const [state, formAction, isPending] = useActionState(resetPassword, null)
  const searchParams = useSearchParams()
  const linkExpired = searchParams.get('error') === 'link_expired'

  return (
    <div className="w-full">
      <div className="mb-8 text-center space-y-2">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
          <ShieldCheck className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-black text-foreground tracking-tight">
          {isUrdu ? 'پاس ورڈ بھول گئے' : 'Forgot Password'}
        </h1>
        <p className="text-muted-foreground text-sm font-medium px-4">
          {isUrdu 
            ? 'اپنا ای میل درج کریں اور ہم آپ کو پاس ورڈ ری سیٹ کرنے کا لنک بھیجیں گے۔' 
            : 'Enter your email address and we will send you a link to reset your password.'}
        </p>
      </div>

      <form action={formAction} className="space-y-5">
        {linkExpired && !state?.error && (
          <div className="p-4 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl flex items-start gap-3 animate-in fade-in zoom-in-95 duration-300">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              {isUrdu
                ? 'آپ کا پاس ورڈ ری سیٹ لنک میعاد ختم ہو گئی ہے۔ نیا لنک حاصل کریں۔'
                : 'Your password reset link has expired. Please request a new one below.'}
            </p>
          </div>
        )}

        {state?.error && (
          <div className="p-4 bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start gap-3 animate-in fade-in zoom-in-95 duration-300">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-red-800 dark:text-red-300">{state.error}</p>
          </div>
        )}

        {state?.success && (
          <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl flex items-start gap-3 animate-in fade-in zoom-in-95 duration-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">{state.message}</p>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-bold text-foreground/80">
            {isUrdu ? 'ای میل ایڈریس' : 'Email Address'}
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="e.g. abdullah@student.jamia.edu.pk"
              required
              disabled={isPending || state?.success}
              className="pl-10 h-12 rounded-xl border-border/50 bg-background/50 focus:bg-background transition-colors text-sm"
              dir="ltr"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending || state?.success}
          className="w-full h-12 rounded-xl text-base font-bold tracking-wide shadow-Jamia transition-all duration-300"
        >
          {isPending ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{isUrdu ? 'بھیج رہا ہے...' : 'Sending Link...'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>{isUrdu ? 'ری سیٹ لنک بھیجیں' : 'Send Reset Link'}</span>
              <ArrowRight className={`w-5 h-5 ${isUrdu ? 'rotate-180' : ''}`} />
            </div>
          )}
        </Button>

        <div className="text-center mt-6">
          <Link 
            href={`/${lang}/login`}
            className="text-sm font-bold text-primary hover:text-accent transition-colors"
          >
            {isUrdu ? 'لاگ ان صفحہ پر واپس جائیں' : 'Back to Login'}
          </Link>
        </div>
      </form>
    </div>
  )
}
