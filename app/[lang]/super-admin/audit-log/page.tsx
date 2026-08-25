'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { History, Shield, Filter, Search, User } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function SuperAdminAuditLogPage() {
  const [logs] = useState([
    {
      id: 'log-1',
      actor_email: 'admin@jamia.edu',
      actor_role: 'super_admin',
      action: 'CREATE_ADMIN',
      entity_type: 'profile',
      entity_id: 'usr-9281',
      details: 'Issued Nazim account to Mawlana Dr. Muhammad Saeed (nazim@jamia.edu)',
      ip_address: '192.168.0.105',
      timestamp: '2025-09-06 13:45:10',
    },
    {
      id: 'log-2',
      actor_email: 'admin@jamia.edu',
      actor_role: 'super_admin',
      action: 'UPDATE_SETTINGS',
      entity_type: 'institution_settings',
      entity_id: 'inst-01',
      details: 'Updated cutoff time to 09:00:00 AM',
      ip_address: '192.168.0.105',
      timestamp: '2025-09-06 12:10:04',
    },
    {
      id: 'log-3',
      actor_email: 'nazim@jamia.edu',
      actor_role: 'nazim',
      action: 'FEE_OVERRIDE',
      entity_type: 'fee_voucher',
      entity_id: 'v-102',
      details: 'Waived 50% tuition for orphan student (JAM-102)',
      ip_address: '192.168.1.44',
      timestamp: '2025-09-06 10:30:22',
    },
    {
      id: 'log-4',
      actor_email: 'admin@jamia.edu',
      actor_role: 'super_admin',
      action: 'APPROVE_USER',
      entity_type: 'profile',
      entity_id: 'usr-412',
      details: 'Approved Qari Hameedullah as Teacher (Tajweed Dept)',
      ip_address: '192.168.0.105',
      timestamp: '2025-09-05 16:15:00',
    },
  ])

  const [search, setSearch] = useState('')

  const filteredLogs = logs.filter(
    (l) =>
      l.actor_email.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
            <History className="w-6 h-6 text-accent" />
            Immutable Security Audit Log
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Read-only, tamper-evident feed of sensitive institutional actions, credential grants, and overrides.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search action or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-background/50 border-input"
          />
        </div>
      </div>

      <Card className="border-primary/15 shadow-sm">
        <CardHeader className="bg-primary/5 pb-3">
          <CardTitle className="text-base text-primary flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent" />
            Audit Records ({filteredLogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-xl border border-border bg-card/60 hover:bg-card transition-all space-y-2 shadow-sm"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs border-primary/20 text-primary">
                    {log.action}
                  </Badge>
                  <span className="text-sm font-semibold text-foreground flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-accent" />
                    {log.actor_email}
                  </span>
                  <Badge className="text-[10px] uppercase font-bold bg-primary/10 text-primary border-primary/20">
                    {log.actor_role}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground font-mono">{log.timestamp}</span>
              </div>

              <p className="text-sm text-foreground/90 pl-1">{log.details}</p>

              <div className="text-[11px] text-muted-foreground flex items-center gap-3 pl-1 font-mono">
                <span>Entity: {log.entity_type} ({log.entity_id})</span>
                <span>•</span>
                <span>Origin IP: {log.ip_address}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
