'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Shield, Plus, Mail, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createAdminBySuperAdmin } from '@/lib/actions/auth'
import { deactivateAdmin } from '@/lib/actions/admin'
import { useRouter } from 'next/navigation'

export type AdminRow = {
  id: string
  full_name_en: string
  full_name_ur: string | null
  email: string
  role: string
  is_active: boolean
  created_at: string
}

export function AdminsClient({ initialAdmins }: { initialAdmins: AdminRow[] }) {
  const router = useRouter()
  const [admins, setAdmins] = useState<AdminRow[]>(initialAdmins)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [nameUr, setNameUr] = useState('')
  const [role, setRole] = useState<'nazim' | 'admin'>('nazim')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)

    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)
    formData.append('fullNameEn', nameEn)
    formData.append('fullNameUr', nameUr)
    formData.append('role', role)

    const res = await createAdminBySuperAdmin(formData)
    setIsPending(false)

    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success(
        role === 'nazim'
          ? 'Nazim (Principal) account created successfully!'
          : 'Admin account created successfully!'
      )
      setAdmins([
        {
          id: `tmp-${Date.now()}`,
          full_name_en: nameEn,
          full_name_ur: nameUr || null,
          email,
          role,
          is_active: true,
          created_at: new Date().toISOString(),
        },
        ...admins,
      ])
      setIsDialogOpen(false)
      setEmail('')
      setPassword('')
      setNameEn('')
      setNameUr('')
      router.refresh()
    }
  }

  const handleDeactivate = async (id: string, name: string) => {
    const res = (await deactivateAdmin(id)) as any
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success(`${name} account deactivated.`)
      setAdmins((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_active: false } : a))
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
            <Shield className="w-6 h-6 text-accent" />
            Governance — Nazim &amp; Administrator Accounts
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Only the Super Admin may create or deactivate administrator accounts.
          </p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4 text-accent" />
          Create Nazim / Admin
        </Button>
      </div>

      {/* Admin List */}
      <div className="rounded-2xl border border-primary/15 shadow-sm overflow-hidden">
        <div className="bg-primary/5 px-5 py-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-accent" />
          <span className="text-sm font-bold text-primary">
            Seminary Principals &amp; Administrators ({admins.length})
          </span>
        </div>
        <div className="divide-y divide-border">
          {admins.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Shield className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="font-semibold text-sm">No administrator accounts yet</p>
              <p className="text-xs mt-1">Create the first Nazim or Admin above.</p>
            </div>
          ) : (
            admins.map((adm) => (
              <div
                key={adm.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-card/60 hover:bg-card transition-all gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-base text-foreground">{adm.full_name_en}</span>
                    {adm.full_name_ur && (
                      <span className="text-xs text-muted-foreground">({adm.full_name_ur})</span>
                    )}
                    <Badge
                      className={`text-[10px] font-bold uppercase ${
                        adm.role === 'nazim'
                          ? 'bg-accent/20 text-primary dark:text-accent border-accent/40'
                          : 'bg-primary/10 text-primary border-primary/20'
                      }`}
                    >
                      {adm.role === 'nazim' ? 'Nazim (Principal)' : 'Administrator'}
                    </Badge>
                    {adm.is_active ? (
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-xs">
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-rose-500/15 text-rose-600 border-rose-500/20 text-xs">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Mail className="w-3 h-3 text-accent" />
                    {adm.email} &bull; Created:{' '}
                    {new Date(adm.created_at).toLocaleDateString('en-PK')}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {adm.is_active && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeactivate(adm.id, adm.full_name_en)}
                      className="h-8 text-xs font-semibold border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Deactivate
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-primary/20 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent" />
                Issue New Administrator Account
              </h3>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="rl" className="text-xs font-semibold">
                  Administrator Tier
                </Label>
                <select
                  id="rl"
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm font-medium"
                >
                  <option value="nazim">Nazim (Head / Principal - Complete Seminary Authority)</option>
                  <option value="admin">Administrator (Deputy / Office Nazim)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nen" className="text-xs font-semibold">Full Name (English)</Label>
                <Input
                  id="nen"
                  placeholder="e.g. Mawlana Muhammad Saeed"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  required
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nur" className="text-xs font-semibold">Full Name (Urdu)</Label>
                <Input
                  id="nur"
                  placeholder="مثلاً مولانا محمد سعید"
                  value={nameUr}
                  onChange={(e) => setNameUr(e.target.value)}
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="em" className="text-xs font-semibold">Official Email</Label>
                <Input
                  id="em"
                  type="email"
                  placeholder="nazim@yourjamia.edu.pk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pw" className="text-xs font-semibold">Temporary Access Password</Label>
                <Input
                  id="pw"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="h-10"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
                  {isPending ? 'Provisioning...' : 'Provision Account'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
