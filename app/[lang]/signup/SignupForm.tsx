'use client'

import { useActionState, useState } from 'react'
import { signup } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2, Mail, KeyRound, User, Phone, Users, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function SignupForm({ lang }: { lang: string }) {
  const isUrdu = lang === 'ur'
  const [state, formAction, isPending] = useActionState(signup, null)
  const [role, setRole] = useState<'student' | 'teacher'>('student')

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="mb-8 text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg ring-4 ring-accent/30 mx-auto mb-4">
          <span className="font-bold text-3xl font-serif text-accent">ج</span>
        </div>
        <h1 className="text-3xl font-black text-foreground tracking-tight">
          {isUrdu ? 'نیا اکاؤنٹ بنائیں' : 'Create Account'}
        </h1>
        <p className="text-muted-foreground text-sm font-medium px-4">
          {isUrdu
            ? 'رجسٹریشن کے بعد ایڈمن آپ کی درخواست منظور کرے گا'
            : 'Submit your registration — admin will approve your account.'}
        </p>
      </div>

      {/* Success State */}
      {state?.success ? (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="p-6 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            <h2 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
              {isUrdu ? 'درخواست جمع ہو گئی!' : 'Registration Submitted!'}
            </h2>
            <p className="text-sm text-emerald-700 dark:text-emerald-400">{state.message}</p>
          </div>
          <Link
            href={`/${lang}/login`}
            className="flex items-center justify-center gap-2 w-full h-12 rounded-xl text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
          >
            {isUrdu ? 'لاگ ان پیج پر جائیں' : 'Go to Login'}
            <ArrowRight className={`w-5 h-5 ${isUrdu ? 'rotate-180' : ''}`} />
          </Link>
        </div>
      ) : (
        <form action={formAction} className="space-y-5">
          {state?.error && (
            <div className="p-4 bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start gap-3 animate-in fade-in zoom-in-95 duration-300">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm font-semibold text-red-800 dark:text-red-300">{state.error}</p>
            </div>
          )}

          {/* Role Toggle */}
          <div className="space-y-1.5">
            <Label className="text-sm font-bold text-foreground/80">
              {isUrdu ? 'آپ کون ہیں؟' : 'I am registering as'}
            </Label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl">
              {(['student', 'teacher'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                    role === r
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {r === 'student'
                    ? (isUrdu ? 'طالب علم' : 'Student')
                    : (isUrdu ? 'استاد' : 'Teacher')}
                </button>
              ))}
            </div>
            <input type="hidden" name="role" value={role} />
          </div>

          {/* Full Name (English) */}
          <div className="space-y-1.5">
            <Label htmlFor="fullNameEn" className="text-sm font-bold text-foreground/80">
              {isUrdu ? 'پورا نام (انگریزی میں)' : 'Full Name (English)'} <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input name="fullNameEn" id="fullNameEn" placeholder="e.g. Muhammad Abdullah" required disabled={isPending} className="pl-10 h-12 rounded-xl" dir="ltr" />
            </div>
          </div>

          {/* Full Name (Urdu) */}
          <div className="space-y-1.5">
            <Label htmlFor="fullNameUr" className="text-sm font-bold text-foreground/80">
              {isUrdu ? 'پورا نام (اردو میں)' : 'Full Name (Urdu)'}
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input name="fullNameUr" id="fullNameUr" placeholder="مثلاً: محمد عبداللہ" disabled={isPending} className="pl-10 h-12 rounded-xl" dir="rtl" />
            </div>
          </div>

          {/* Father Name (students only) */}
          {role === 'student' && (
            <div className="space-y-1.5">
              <Label htmlFor="fatherNameEn" className="text-sm font-bold text-foreground/80">
                {isUrdu ? 'والد کا نام (انگریزی)' : "Father's Name (English)"}
              </Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input name="fatherNameEn" id="fatherNameEn" placeholder="e.g. Muhammad Tariq" disabled={isPending} className="pl-10 h-12 rounded-xl" dir="ltr" />
              </div>
            </div>
          )}

          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm font-bold text-foreground/80">
              {isUrdu ? 'فون نمبر' : 'Phone Number'}
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input name="phone" id="phone" type="tel" placeholder="+92 300 0000000" disabled={isPending} className="pl-10 h-12 rounded-xl" dir="ltr" />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-bold text-foreground/80">
              {isUrdu ? 'ای میل ایڈریس' : 'Email Address'} <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input name="email" id="email" type="email" placeholder="you@example.com" required disabled={isPending} className="pl-10 h-12 rounded-xl" dir="ltr" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-bold text-foreground/80">
              {isUrdu ? 'پاس ورڈ' : 'Password'} <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input name="password" id="password" type="password" placeholder="Min. 6 characters" required disabled={isPending} className="pl-10 h-12 rounded-xl" dir="ltr" />
            </div>
          </div>

          {/* Notice */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl">
            <p className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
              {isUrdu
                ? '⚠️ آپ کا اکاؤنٹ ایڈمن کی منظوری کے بعد ہی فعال ہوگا۔ براہ کرم انتظار کریں۔'
                : '⚠️ Your account will only become active after admin approval. Please wait after submitting.'}
            </p>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-12 rounded-xl text-base font-bold tracking-wide transition-all duration-300"
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{isUrdu ? 'جمع ہو رہا ہے...' : 'Submitting...'}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>{isUrdu ? 'درخواست جمع کریں' : 'Submit Registration'}</span>
                <ArrowRight className={`w-5 h-5 ${isUrdu ? 'rotate-180' : ''}`} />
              </div>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            {isUrdu ? 'پہلے سے اکاؤنٹ ہے؟' : 'Already have an account?'}{' '}
            <Link href={`/${lang}/login`} className="font-bold text-primary hover:text-accent transition-colors">
              {isUrdu ? 'لاگ ان کریں' : 'Log in'}
            </Link>
          </p>
        </form>
      )}
    </div>
  )
}
