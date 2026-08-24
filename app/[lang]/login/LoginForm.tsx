'use client'

import { useActionState, useState } from 'react'
import { login } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useSearchParams } from 'next/navigation'
import { KeyRound, Mail, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export function LoginForm({ dict, lang }: { dict: any; lang: string }) {
  const [state, formAction, isPending] = useActionState(login, null)
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || ''

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const isRtl = lang === 'ur'

  return (
    <Card className="w-full shadow-2xl border border-primary/20 bg-card/95 backdrop-blur-md overflow-hidden transition-all">
      {/* Decorative Gold Header Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-accent/40 via-accent to-accent/40" />

      <CardHeader className="space-y-2 text-center pb-4 pt-6">
        <div className="flex justify-center mb-2">
          <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg ring-4 ring-accent/30 transform transition-transform hover:scale-105">
            <span className="font-bold text-3xl font-serif text-accent">ج</span>
          </div>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-primary">
          {dict.auth.login}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground max-w-xs mx-auto">
          {isRtl
            ? 'جامعہ مینجمنٹ پورٹل میں لاگ ان کریں'
            : 'Sign in to access your Jamia academic & administrative portal'}
        </CardDescription>
      </CardHeader>

      <form action={formAction}>
        <CardContent className="space-y-4 pt-2">
          <input type="hidden" name="redirectTo" value={redirectTo} />

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-accent" />
              {dict.auth.email}
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isRtl ? 'ای میل درج کریں' : 'Enter your email'}
              required
              disabled={isPending}
              dir="ltr"
              className="bg-background/50 border-input focus-visible:ring-primary focus-visible:border-primary pl-3 pr-3 text-sm h-11"
            />
          </div>

          {/* Password with Forgot link (only once) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-semibold flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-accent" />
                {dict.auth.password}
              </Label>
              <Link
                href={`/${lang}/forgot-password`}
                className="text-xs text-primary font-medium hover:text-accent hover:underline transition-colors"
              >
                {isRtl ? 'پاس ورڈ بھول گئے؟' : 'Forgot password?'}
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isRtl ? 'پاس ورڈ درج کریں' : 'Enter your password'}
              required
              disabled={isPending}
              dir="ltr"
              className="bg-background/50 border-input focus-visible:ring-primary focus-visible:border-primary pl-3 pr-3 text-sm h-11"
            />
          </div>

          {state?.error && (
            <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2 pb-6">
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 shadow-md transition-all active:scale-[0.99]"
            disabled={isPending}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {isRtl ? 'تصدیق جاری ہے...' : 'Authenticating...'}
              </span>
            ) : (
              dict.auth.submit
            )}
          </Button>

          {/* Sign up link */}
          <p className="text-center text-xs text-muted-foreground">
            {isRtl ? 'نیا اکاؤنٹ بنانا ہے؟' : "Don't have an account?"}{' '}
            <Link
              href={`/${lang}/signup`}
              className="font-bold text-primary hover:text-accent transition-colors"
            >
              {isRtl ? 'رجسٹر کریں' : 'Sign up'}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
