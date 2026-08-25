'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Check, X, Clock, UserCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Student {
  id: string
  name_en: string
  name_ur?: string
  admission_number: string
}

export function ManualAttendanceList({
  students,
  lang,
}: {
  students: Student[]
  lang: string
}) {
  const [statusMap, setStatusMap] = useState<Record<string, 'present' | 'absent' | 'late'>>({})
  const isRtl = lang === 'ur'

  const markStatus = (id: string, name: string, status: 'present' | 'absent' | 'late') => {
    setStatusMap((prev) => ({ ...prev, [id]: status }))
    const statusLabel = {
      present: isRtl ? 'حاضر' : 'Present',
      absent: isRtl ? 'غیر حاضر' : 'Absent',
      late: isRtl ? 'تاخیر' : 'Late',
    }[status]

    if (status === 'present') {
      toast.success(`${name}: ${statusLabel}`, { icon: '✅' })
    } else if (status === 'absent') {
      toast.error(`${name}: ${statusLabel}`, { icon: '❌' })
    } else {
      toast.warning(`${name}: ${statusLabel}`, { icon: '⏰' })
    }
  }

  // Fallback demo students if database is not yet seeded
  const list = students && students.length > 0 ? students : [
    { id: '1', name_en: 'Muhammad Abdullah', name_ur: 'محمد عبداللہ', admission_number: 'JAM-2025-001' },
    { id: '2', name_en: 'Ahmad Hassan', name_ur: 'احمد حسن', admission_number: 'JAM-2025-002' },
    { id: '3', name_en: 'Usman Ali', name_ur: 'عثمان علی', admission_number: 'JAM-2025-003' },
    { id: '4', name_en: 'Zubair Tariq', name_ur: 'زبیر طارق', admission_number: 'JAM-2025-004' },
    { id: '5', name_en: 'Bilal Khan', name_ur: 'بلال خان', admission_number: 'JAM-2025-005' },
  ]

  return (
    <div className="space-y-3">
      {list.map((s) => {
        const currentStatus = statusMap[s.id]
        const displayName = isRtl && s.name_ur ? s.name_ur : s.name_en

        return (
          <div
            key={s.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-border bg-card/60 hover:bg-card transition-all gap-3 shadow-sm"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm text-foreground">{displayName}</p>
                {currentStatus && (
                  <Badge
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 ${
                      currentStatus === 'present'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                        : currentStatus === 'absent'
                        ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/20'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20'
                    }`}
                  >
                    {currentStatus}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{s.admission_number}</p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => markStatus(s.id, displayName, 'present')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${
                  currentStatus === 'present'
                    ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/30'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-600/20'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                {isRtl ? 'حاضر' : 'Present'}
              </button>

              <button
                onClick={() => markStatus(s.id, displayName, 'absent')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${
                  currentStatus === 'absent'
                    ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-400/30'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 border border-rose-600/20'
                }`}
              >
                <X className="w-3.5 h-3.5" />
                {isRtl ? 'غیر حاضر' : 'Absent'}
              </button>

              <button
                onClick={() => markStatus(s.id, displayName, 'late')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${
                  currentStatus === 'late'
                    ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-400/30'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 border border-amber-600/20'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                {isRtl ? 'تاخیر' : 'Late'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
