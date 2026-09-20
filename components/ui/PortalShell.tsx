'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  LayoutDashboard,
  Users,
  UserCog,
  GraduationCap,
  Calendar,
  FileText,
  Wallet,
  CheckSquare,
  MessageSquare,
  CalendarCheck,
  Bell,
  Sparkles,
  BookOpen,
  Shield,
  Settings,
  History,
  UserCheck,
  CreditCard,
  Clock,
  AlertTriangle,
  Heart,
  PieChart,
  ClipboardList,
  Search,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { PageTransition } from '@/components/ui/PageTransition'
import { logout } from '@/lib/actions/auth'

export type PortalType = 'super_admin' | 'admin' | 'teacher' | 'student' | 'accountant' | 'receptionist'

// Bilingual Navigation Configs
const NAV_CONFIGS: Record<
  PortalType,
  (lang: string) => { name: string; href: string; icon: any }[]
> = {
  super_admin: (lang) => {
    const isUr = lang === 'ur'
    return [
      { name: isUr ? 'عمومی جائزہ' : 'Overview', href: `/${lang}/super-admin`, icon: LayoutDashboard },
      { name: isUr ? 'ناظمین / ایڈمنز' : 'Governance (Admins)', href: `/${lang}/super-admin/admins`, icon: Shield },
      { name: isUr ? 'منظوریاں' : 'Approvals', href: `/${lang}/super-admin/approvals`, icon: UserCheck },
      { name: isUr ? 'ادارہ کی ترتیبات' : 'Institution Settings', href: `/${lang}/super-admin/institution-settings`, icon: Settings },
      { name: isUr ? 'آڈٹ لاگ' : 'Audit Log', href: `/${lang}/super-admin/audit-log`, icon: History },
      { name: isUr ? 'اعلانات و نوٹیفیکیشن' : 'Broadcasts', href: `/${lang}/super-admin/notifications`, icon: Bell },
    ]
  },
  admin: (lang) => {
    // This is a fallback. The actual Admin nav is computed dynamically in PortalShell below based on pathname.
    return []
  },
  teacher: (lang) => {
    const isUr = lang === 'ur'
    return [
      { name: isUr ? 'ڈیش بورڈ' : 'Dashboard', href: `/${lang}/teacher/dashboard`, icon: LayoutDashboard },
      { name: isUr ? 'اپنی حاضری (کیوسک)' : 'Self Check-In', href: `/${lang}/teacher/attendance/self-checkin`, icon: Clock },
      { name: isUr ? 'اسائنمنٹس' : 'Assignments', href: `/${lang}/teacher/assignments`, icon: FileText },
      { name: isUr ? 'کوئز' : 'Quizzes', href: `/${lang}/teacher/quizzes`, icon: CheckSquare },
      { name: isUr ? 'حفظ / تجوید' : 'Hifz Tracker', href: `/${lang}/teacher/hifz`, icon: Sparkles },
      { name: isUr ? 'حاضری اسکین (طلباء)' : 'Scan Students', href: `/${lang}/teacher/attendance/scan-students`, icon: Calendar },
      { name: isUr ? 'نتائج' : 'Results', href: `/${lang}/teacher/results`, icon: FileText },
      { name: isUr ? 'نصاب و کتب' : 'Syllabus', href: `/${lang}/teacher/syllabus`, icon: BookOpen },
      { name: isUr ? 'ٹائم ٹیبل' : 'Timetable', href: `/${lang}/teacher/timetable`, icon: CalendarCheck },
      { name: isUr ? 'پیغامات' : 'Chat', href: `/${lang}/teacher/chat`, icon: MessageSquare },
    ]
  },
  student: (lang) => {
    const isUr = lang === 'ur'
    return [
      { name: isUr ? 'ڈیش بورڈ' : 'Dashboard', href: `/${lang}/student/dashboard`, icon: LayoutDashboard },
      { name: isUr ? 'اسائنمنٹس' : 'Assignments', href: `/${lang}/student/assignments`, icon: FileText },
      { name: isUr ? 'کوئز' : 'Quizzes', href: `/${lang}/student/quizzes`, icon: CheckSquare },
      { name: isUr ? 'حفظ / تجوید' : 'My Hifz', href: `/${lang}/student/hifz`, icon: Sparkles },
      { name: isUr ? 'کتب خانہ' : 'Library', href: `/${lang}/student/library`, icon: BookOpen },
      { name: isUr ? 'میرا شناختی کارڈ' : 'My ID Card', href: `/${lang}/student/id-card`, icon: CreditCard },
      { name: isUr ? 'میری حاضری' : 'Attendance', href: `/${lang}/student/attendance`, icon: Calendar },
      { name: isUr ? 'امتحانی کارکردگی' : 'Results', href: `/${lang}/student/results`, icon: FileText },
      { name: isUr ? 'فیس واؤچرز' : 'Fees', href: `/${lang}/student/fees`, icon: Wallet },
      { name: isUr ? 'ٹائم ٹیبل' : 'Timetable', href: `/${lang}/student/timetable`, icon: CalendarCheck },
      { name: isUr ? 'اسلامی تقویم' : 'Calendar', href: `/${lang}/student/calendar`, icon: CalendarCheck },
      { name: isUr ? 'فورم' : 'Forum', href: `/${lang}/student/forum`, icon: MessageSquare },
      { name: isUr ? 'گفتگو' : 'Chat', href: `/${lang}/student/chat`, icon: MessageSquare },
    ]
  },
  accountant: (lang) => {
    const isUr = lang === 'ur'
    return [
      { name: isUr ? 'ڈیش بورڈ' : 'Dashboard', href: `/${lang}/accountant/dashboard`, icon: LayoutDashboard },
      { name: isUr ? 'فیس اسٹرکچر' : 'Fee Structures', href: `/${lang}/accountant/fee-structures`, icon: Settings },
      { name: isUr ? 'واؤچرز' : 'Fee Vouchers', href: `/${lang}/accountant/vouchers`, icon: FileText },
      { name: isUr ? 'ڈیفالٹرز' : 'Defaulters', href: `/${lang}/accountant/defaulters`, icon: AlertTriangle },
      { name: isUr ? 'عطیات (زکوٰۃ و صدقات)' : 'Donations', href: `/${lang}/accountant/donations`, icon: Heart },
      { name: isUr ? 'اخراجات' : 'Expenses', href: `/${lang}/accountant/expenses`, icon: CreditCard },
      { name: isUr ? 'مالیاتی رپورٹس' : 'Financial Reports', href: `/${lang}/accountant/reports`, icon: PieChart },
    ]
  },
  receptionist: (lang) => {
    const isUr = lang === 'ur'
    return [
      { name: isUr ? 'ڈیش بورڈ' : 'Dashboard', href: `/${lang}/receptionist/dashboard`, icon: LayoutDashboard },
      { name: isUr ? 'مہمان' : 'Visitors Log', href: `/${lang}/receptionist/visitors`, icon: Users },
      { name: isUr ? 'داخلہ انکوائری' : 'Admission Inquiries', href: `/${lang}/receptionist/inquiries`, icon: ClipboardList },
      { name: isUr ? 'ملاقاتیں' : 'Appointments', href: `/${lang}/receptionist/appointments`, icon: Calendar },
      { name: isUr ? 'دستاویزات' : 'Document Handoff', href: `/${lang}/receptionist/documents`, icon: FileText },
      { name: isUr ? 'طلباء تلاش' : 'Student Lookup', href: `/${lang}/receptionist/lookup`, icon: Search },
    ]
  },
}

const PORTAL_TITLES: Record<PortalType, { en: string; ur: string }> = {
  super_admin: { en: 'Super Admin Portal', ur: 'سپر ایڈمنسٹریٹر پورٹل' },
  admin: { en: 'Nazim / Admin Portal', ur: 'ناظم اعلیٰ / ایڈمن پورٹل' },
  teacher: { en: 'Teacher Portal', ur: 'استاد پورٹل' },
  student: { en: 'Student Portal', ur: 'طالب علم پورٹل' },
  accountant: { en: 'Accountant Portal', ur: 'محاسب / فیس پورٹل' },
  receptionist: { en: 'Receptionist Portal', ur: 'ریسپشنسٹ پورٹل' },
}

export function PortalShell({
  children,
  lang,
  portalType,
}: {
  children: React.ReactNode
  lang: string
  portalType: PortalType
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const isRtl = lang === 'ur'

  useEffect(() => setMounted(true), [])

  let navItems = NAV_CONFIGS[portalType](lang)
  let portalName = PORTAL_TITLES[portalType][isRtl ? 'ur' : 'en']

  if (portalType === 'admin') {
    if (pathname.includes('/admin/campus')) {
      navItems = [
        { name: isRtl ? 'ڈیش بورڈ' : 'Overview', href: `/${lang}/admin/dashboard`, icon: LayoutDashboard },
        { name: isRtl ? 'فیس مینجمنٹ' : 'Fees', href: `/${lang}/admin/campus/fees`, icon: Wallet },
        { name: isRtl ? 'شناختی کارڈز' : 'ID Cards', href: `/${lang}/admin/campus/id-cards`, icon: CreditCard },
        { name: isRtl ? 'اعلانات' : 'Announcements', href: `/${lang}/admin/campus/announcements`, icon: MessageSquare },
        { name: isRtl ? 'اسٹاف مینجمنٹ' : 'Staff Accounts', href: `/${lang}/super-admin/admins`, icon: Shield },
      ]
      portalName = isRtl ? 'کیمپس مینجمنٹ' : 'Campus Management'
    } else if (pathname.includes('/admin/lms')) {
      navItems = [
        { name: isRtl ? 'ڈیش بورڈ' : 'Overview', href: `/${lang}/admin/dashboard`, icon: LayoutDashboard },
        { name: isRtl ? 'کلاسز' : 'Classes', href: `/${lang}/admin/lms/classes`, icon: GraduationCap },
        { name: isRtl ? 'طلباء' : 'Students', href: `/${lang}/admin/lms/students`, icon: Users },
        { name: isRtl ? 'اساتذہ' : 'Teachers', href: `/${lang}/admin/lms/teachers`, icon: UserCog },
        { name: isRtl ? 'حاضری' : 'Attendance', href: `/${lang}/admin/lms/attendance`, icon: Calendar },
        { name: isRtl ? 'ٹائم ٹیبل' : 'Timetable', href: `/${lang}/admin/lms/timetable`, icon: CalendarCheck },
        { name: isRtl ? 'نتائج' : 'Results', href: `/${lang}/admin/lms/results`, icon: FileText },
        { name: isRtl ? 'حفظ / تجوید' : 'Hifz Tracker', href: `/${lang}/admin/lms/hifz`, icon: Sparkles },
        { name: isRtl ? 'کتب خانہ' : 'Library', href: `/${lang}/admin/lms/library`, icon: BookOpen },
      ]
      portalName = isRtl ? 'تعلیمی نظام (LMS)' : 'LMS Portal'
    } else {
      navItems = [
        { name: isRtl ? 'ڈیش بورڈ' : 'Overview', href: `/${lang}/admin/dashboard`, icon: LayoutDashboard },
      ]
      portalName = isRtl ? 'ایڈمن پورٹل' : 'Admin Portal'
    }
  }

  const switchLocale = () => {
    const newLang = lang === 'en' ? 'ur' : 'en'
    const newPath = pathname.replace(`/${lang}/`, `/${newLang}/`)
    router.push(newPath)
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden text-foreground">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed lg:static inset-y-0 ${isRtl ? 'right-0' : 'left-0'} z-50
        w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-transform duration-300 ease-in-out shadow-xl
        ${
          isSidebarOpen
            ? 'translate-x-0'
            : isRtl
            ? 'translate-x-full lg:translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        }
        flex flex-col
      `}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border shrink-0 bg-sidebar/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent text-sidebar font-bold text-xl flex items-center justify-center shadow-md ring-2 ring-accent/30 font-serif">
              ج
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-sidebar-foreground block">
                جامعہ LMS
              </span>
              <span className="text-[10px] text-sidebar-foreground/60 uppercase tracking-widest block -mt-0.5">
                Jamia Portal
              </span>
            </div>
          </div>
          <button
            className="lg:hidden p-1.5 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-white/10"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Portal Type Pill */}
        <div className="px-3 py-2.5">
          <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
            <span suppressHydrationWarning className="text-xs font-medium text-sidebar-foreground/80">
              {portalName}
            </span>
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? `bg-accent/15 text-accent shadow-sm ${
                        isRtl ? 'border-r-4 border-accent' : 'border-l-4 border-accent'
                      }`
                    : 'text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-white/10'
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-accent' : 'text-sidebar-foreground/60'
                  } ${isRtl ? 'ml-3' : 'mr-3'}`}
                />
                <span className="truncate">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-sidebar-border shrink-0 bg-sidebar/30">
          <form action={() => logout(lang)}>
            <button
              type="submit"
              className="flex items-center w-full px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/70 hover:text-white hover:bg-red-500/20 hover:border-red-500/30 transition-all border border-transparent"
            >
              <LogOut className={`w-4 h-4 shrink-0 text-red-400 ${isRtl ? 'ml-3 -scale-x-100' : 'mr-3'}`} />
              <span>{isRtl ? 'لاگ آؤٹ' : 'Log Out'}</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        {/* Topbar */}
        <header className="h-16 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 lg:px-6 z-30 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-lg transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden lg:flex items-center gap-2">
              <span suppressHydrationWarning className="text-sm font-semibold text-primary">
                {portalName}
              </span>
              {mounted && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span suppressHydrationWarning className="text-xs text-muted-foreground">
                    {new Date().toLocaleDateString(isRtl ? 'ur-PK' : 'en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Language Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={switchLocale}
              className="text-xs font-semibold border-primary/20 hover:bg-primary/10 text-primary h-8 px-2.5 gap-1.5 shadow-sm"
            >
              <span className="text-accent font-bold">🌐</span>
              {lang === 'en' ? 'اردو' : 'English'}
            </Button>

            {/* Dark Mode Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-lg"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-accent" /> : <Moon className="w-4 h-4 text-primary" />}
              </Button>
            )}

            {/* User Avatar */}
            <div className="flex items-center gap-2 pl-2 rtl:pr-2 border-l rtl:border-r border-border">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-accent/20">
                {portalType[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 flex flex-col relative bg-background">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  )
}
