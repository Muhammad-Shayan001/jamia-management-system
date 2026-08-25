'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserCheck, Check, X, Mail, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'

export default function SuperAdminApprovalsPage() {
  const [pendingUsers, setPendingUsers] = useState([
    {
      id: 'req-1',
      name_en: 'Qari Hameedullah',
      name_ur: 'قاری حمید اللہ',
      email: 'hameed@jamia.edu',
      role: 'teacher',
      requested_at: '2025-09-05 14:30',
      details: 'Department of Tajweed & Qiraat',
    },
    {
      id: 'req-2',
      name_en: 'Muhammad Zaid',
      name_ur: 'محمد زید',
      email: 'zaid@student.jamia.edu',
      role: 'student',
      requested_at: '2025-09-06 09:12',
      details: 'Class: Ibtidai Awwal (B-Form: 35201-xxxxxxx-1)',
    },
    {
      id: 'req-3',
      name_en: 'Abdur Rahim',
      name_ur: 'عبد الرحیم',
      email: 'rahim@student.jamia.edu',
      role: 'student',
      requested_at: '2025-09-06 10:05',
      details: 'Class: Hifz Section',
    },
  ])

  const handleApprove = (id: string, name: string) => {
    setPendingUsers((prev) => prev.filter((u) => u.id !== id))
    toast.success(`Account approved for ${name}. Verification email dispatched.`, { icon: '✅' })
  }

  const handleReject = (id: string, name: string) => {
    setPendingUsers((prev) => prev.filter((u) => u.id !== id))
    toast.error(`Registration request rejected for ${name}.`, { icon: '❌' })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-accent" />
          Account Approval Queue
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Review and authorize pending student and teacher self-registrations.
        </p>
      </div>

      <Card className="border-primary/15 shadow-sm">
        <CardHeader className="bg-primary/5 pb-3">
          <CardTitle className="text-base text-primary flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-accent" />
            Pending Signups Awaiting Super Admin Authorization ({pendingUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          {pendingUsers.length > 0 ? (
            pendingUsers.map((user) => (
              <div
                key={user.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-card/60 hover:bg-card transition-all gap-4 shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-base text-foreground">{user.name_en}</span>
                    <span className="text-xs text-muted-foreground">({user.name_ur})</span>
                    <Badge variant="outline" className="text-xs capitalize border-primary/20">
                      {user.role}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Mail className="w-3 h-3 text-accent" />
                    {user.email} • {user.details}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Requested: {user.requested_at}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(user.id, user.name_en)}
                    className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(user.id, user.name_en)}
                    className="h-9 border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <UserCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="font-semibold text-sm">Approval Queue is Clear</p>
              <p className="text-xs mt-1">All teacher and student registrations are up to date.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
