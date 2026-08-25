'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, LayoutDashboard, Users, UserCog, GraduationCap, Calendar, FileText, Wallet, Settings, Menu, X, Moon, Sun } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export function AdminShell({ children, dict, lang }: { children: React.ReactNode, dict: any, lang: string }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const isRtl = lang === 'ur'

  useEffect(() => setMounted(true), [])

  const navItems = [
    { name: dict.nav.dashboard, href: `/${lang}/admin/dashboard`, icon: LayoutDashboard },
    { name: dict.nav.students, href: `/${lang}/admin/students`, icon: Users },
    { name: dict.nav.teachers, href: `/${lang}/admin/teachers`, icon: UserCog },
    { name: dict.nav.classes, href: `/${lang}/admin/classes`, icon: GraduationCap },
    { name: dict.nav.attendance, href: `/${lang}/admin/attendance`, icon: Calendar },
    { name: dict.nav.results, href: `/${lang}/admin/results`, icon: FileText },
    { name: dict.nav.fees, href: `/${lang}/admin/fees`, icon: Wallet },
  ]

  const switchLocale = () => {
    const newLang = lang === 'en' ? 'ur' : 'en'
    const newPath = pathname.replace(`/${lang}`, `/${newLang}`)
    router.push(newPath)
  }

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 ${isRtl ? 'right-0' : 'left-0'} z-50
        w-64 bg-primary text-primary-foreground transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : (isRtl ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0')}
        flex flex-col
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-primary-light">
          <span className="text-xl font-bold">Jamia LMS</span>
          <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center px-4 py-3 mx-2 rounded-md transition-colors ${
                  isActive ? 'bg-primary-light text-white' : 'text-primary-foreground/80 hover:bg-primary-light/50 hover:text-white'
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Icon className={`w-5 h-5 ${isRtl ? 'ml-3' : 'mr-3'} ${isRtl ? 'rtl-flip' : ''}`} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-primary-light">
          <form action={`/api/auth/logout`} method="POST">
             {/* Note: In a real app we'd use a server action here directly or a route handler */}
            <Button variant="ghost" className="w-full justify-start text-primary-foreground/80 hover:text-white hover:bg-primary-light/50">
              <LogOut className={`w-5 h-5 ${isRtl ? 'ml-3 rtl-flip' : 'mr-3'}`} />
              {dict.nav.logout}
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-card border-b flex items-center justify-between px-4 lg:px-8 z-30 shadow-sm">
          <div className="flex items-center">
            <button className="lg:hidden p-2 -ml-2 mr-2 text-muted-foreground hover:text-foreground rounded-md" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold hidden lg:block text-primary">Admin Portal</h1>
          </div>
          
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Button variant="outline" size="sm" onClick={switchLocale} className="font-semibold text-xs border-primary/20 text-primary hover:bg-primary/5">
              {lang === 'en' ? 'اردو' : 'English'}
            </Button>
            
            {mounted && (
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="text-primary hover:bg-primary/5">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            )}
            
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold ml-2">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-surface p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
