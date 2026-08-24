'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { History, Shield, Search, User, FileX } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

interface AuditLog {
  id: string
  actor_email: string
  actor_role: string
  action: string
  entity_type: string
  entity_id: string
  details: string
  ip_address: string
  created_at: string
}

export default function SuperAdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchLogs() {
      try {
        const supabase = createClient()
        const { data, error } = await (supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100)) as any

        if (!error && data) {
          setLogs(data.map((log: any) => ({
            id: log.id,
            actor_email: log.actor_email || 'Unknown',
            actor_role: log.actor_role || 'unknown',
            action: log.action || 'UNKNOWN',
            entity_type: log.entity_type || '',
            entity_id: log.entity_id || '',
            details: typeof log.details === 'object' ? JSON.stringify(log.details) : (log.details || ''),
            ip_address: log.ip_address || '',
            created_at: log.created_at || '',
          })))
        }
      } catch (err) {
        console.error('Failed to fetch audit logs:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [])

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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="ml-3 text-sm text-muted-foreground">Loading audit records...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileX className="w-12 h-12 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                {search ? 'No audit records match your search.' : 'No audit records yet.'}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Actions like creating accounts, changing settings, and overrides will appear here automatically.
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => (
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
                  <span className="text-xs text-muted-foreground font-mono">
                    {log.created_at ? new Date(log.created_at).toLocaleString() : ''}
                  </span>
                </div>

                <p className="text-sm text-foreground/90 pl-1">{log.details}</p>

                <div className="text-[11px] text-muted-foreground flex items-center gap-3 pl-1 font-mono">
                  <span>Entity: {log.entity_type} ({log.entity_id})</span>
                  {log.ip_address && (
                    <>
                      <span>•</span>
                      <span>Origin IP: {log.ip_address}</span>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
