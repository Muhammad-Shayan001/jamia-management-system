'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Shield, Plus, Mail, Lock, UserCheck, Key, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { createAdminBySuperAdmin } from '@/lib/actions/auth'

export default function SuperAdminAdminsPage({ params }: { params: any }) {
  const [admins, setAdmins] = useState([
    {
      id: 'adm-1',
      name_en: 'Mawlana Dr. Muhammad Saeed',
      name_ur: 'مولانا ڈاکٹر محمد سعید',
      email: 'nazim@jamia.edu',
      role: 'nazim',
      status: 'active',
      created_at: '2025-01-15',
    },
    {
      id: 'adm-2',
      name_en: 'Qari Muhammad Zubair',
      name_ur: 'قاری محمد زبیر',
      email: 'admin.zubair@jamia.edu',
      role: 'admin',
      status: 'active',
      created_at: '2025-02-01',
    },
  ])

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
          id: `adm-${Date.now()}`,
          name_en: nameEn,
          name_ur: nameUr || nameEn,
          email,
          role,
          status: 'active',
          created_at: new Date().toISOString().split('T')[0],
        },
        ...admins,
      ])
      setIsDialogOpen(false)
      setEmail('')
      setPassword('')
      setNameEn('')
      setNameUr('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
            <Shield className="w-6 h-6 text-accent" />
            Governance — Nazim & Administrator Accounts
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Strict Policy: Administrators and Nazim accounts can ONLY be created by the Super Admin.
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
      <Card className="border-primary/15 shadow-sm">
        <CardHeader className="bg-primary/5 pb-3">
          <CardTitle className="text-base text-primary flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent" />
            Active Seminary Principals & Administrators ({admins.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          {admins.map((adm) => (
            <div
              key={adm.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-card/60 hover:bg-card transition-all gap-4 shadow-sm"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-base text-foreground">{adm.name_en}</span>
                  <span className="text-xs text-muted-foreground">({adm.name_ur})</span>
                  <Badge
                    className={`text-[10px] font-bold uppercase ${
                      adm.role === 'nazim'
                        ? 'bg-accent/20 text-primary dark:text-accent border-accent/40'
                        : 'bg-primary/10 text-primary border-primary/20'
                    }`}
                  >
                    {adm.role === 'nazim' ? 'Nazim (Principal)' : 'Administrator'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Mail className="w-3 h-3 text-accent" />
                  {adm.email} • Created: {adm.created_at}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-xs">
                  Active
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.success(`Password reset link dispatched to ${adm.email}`, { icon: '🔑' })}
                  className="h-8 text-xs font-semibold border-primary/20 text-primary hover:bg-primary/5"
                >
                  Reset Key
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

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
                <Label htmlFor="nen" className="text-xs font-semibold">
                  Full Name (English)
                </Label>
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
                <Label htmlFor="nur" className="text-xs font-semibold">
                  Full Name (Urdu)
                </Label>
                <Input
                  id="nur"
                  placeholder="مثلاً مولانا محمد سعید"
                  value={nameUr}
                  onChange={(e) => setNameUr(e.target.value)}
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="em" className="text-xs font-semibold">
                  Official Email
                </Label>
                <Input
                  id="em"
                  type="email"
                  placeholder="nazim@jamia.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pw" className="text-xs font-semibold">
                  Temporary Access Password
                </Label>
                <Input
                  id="pw"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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
