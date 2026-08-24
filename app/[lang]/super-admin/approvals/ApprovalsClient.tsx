'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserCheck, Check, X, Mail, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { approveUser, rejectUser } from '@/lib/actions/admin'
import { useRouter } from 'next/navigation'

export type PendingUser = {
  id: string
  full_name_en: string
  full_name_ur: string | null
  email: string
  role: string
  created_at: string
}

export function ApprovalsClient({ initialUsers }: { initialUsers: PendingUser[] }) {
  const router = useRouter()
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>(initialUsers)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  const handleApprove = async (id: string, name: string) => {
    setIsProcessing(id)
    const res = (await approveUser(id)) as any
    setIsProcessing(null)
    
    if (res?.error) {
      toast.error(res.error)
    } else {
      setPendingUsers((prev) => prev.filter((u) => u.id !== id))
      toast.success(`Account approved for ${name}. Verification email dispatched.`, { icon: '✅' })
      router.refresh()
    }
  }

  const handleReject = async (id: string, name: string) => {
    setIsProcessing(id)
    const res = (await rejectUser(id)) as any
    setIsProcessing(null)
    
    if (res?.error) {
      toast.error(res.error)
    } else {
      setPendingUsers((prev) => prev.filter((u) => u.id !== id))
      toast.error(`Registration request rejected for ${name}.`, { icon: '❌' })
      router.refresh()
    }
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
                    <span className="font-bold text-base text-foreground">{user.full_name_en}</span>
                    {user.full_name_ur && (
                      <span className="text-xs text-muted-foreground">({user.full_name_ur})</span>
                    )}
                    <Badge variant="outline" className="text-xs capitalize border-primary/20">
                      {user.role}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Mail className="w-3 h-3 text-accent" />
                    {user.email}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Requested: {new Date(user.created_at).toLocaleString()}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    disabled={isProcessing === user.id}
                    onClick={() => handleApprove(user.id, user.full_name_en)}
                    className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isProcessing === user.id}
                    onClick={() => handleReject(user.id, user.full_name_en)}
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
