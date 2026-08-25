'use client'

import { useActionState, useState } from 'react'
import { login } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useSearchParams } from 'next/navigation'
import { KeyRound, Mail, ShieldCheck, Sparkles, BookOpen } from 'lucide-react'

export function LoginForm({ dict, lang }: { dict: any; lang: string }) {
  const [state, formAction, isPending] = useActionState(login, null)
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || ''

  const [email, setEmail] = useState('admin@jamia.edu')
  const [password, setPassword] = useState('Admin1234!')

  const setDemoCredentials = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail)
    setPassword(rolePass)
  }

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

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-accent" />
              {dict.auth.email}
            </Label>
            <div className="relative">
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@jamia.edu"
                required
                disabled={isPending}
                dir="ltr"
                className="bg-background/50 border-input focus-visible:ring-primary focus-visible:border-primary pl-3 pr-3 text-sm h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-semibold flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-accent" />
                {dict.auth.password}
              </Label>
              <a href="#" className="text-xs text-primary font-medium hover:underline">
                {dict.auth.forgot}
              </a>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          {/* Quick Demo Fill Buttons */}
          <div className="pt-2">
            <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-accent" />
              {isRtl ? 'آزمائشی اکاؤنٹ منتخب کریں:' : 'Quick Demo Credentials:'}
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setDemoCredentials('admin@jamia.edu', 'Admin1234!')}
                className="text-xs py-1.5 px-2 rounded-md bg-secondary/80 hover:bg-secondary text-secondary-foreground border border-primary/10 transition-colors font-medium text-center"
              >
                {isRtl ? 'ایڈمن' : 'Admin'}
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('teacher@jamia.edu', 'Teacher1234!')}
                className="text-xs py-1.5 px-2 rounded-md bg-secondary/80 hover:bg-secondary text-secondary-foreground border border-primary/10 transition-colors font-medium text-center"
              >
                {isRtl ? 'استاد' : 'Teacher'}
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('student@jamia.edu', 'Student1234!')}
                className="text-xs py-1.5 px-2 rounded-md bg-secondary/80 hover:bg-secondary text-secondary-foreground border border-primary/10 transition-colors font-medium text-center"
              >
                {isRtl ? 'طالب علم' : 'Student'}
              </button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-2 pb-6">
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
        </CardFooter>
      </form>
    </Card>
  )
}
