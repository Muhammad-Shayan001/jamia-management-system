'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Building, Search, Activity, MoreVertical } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function InstitutionsClient({
  initialData,
  lang,
}: {
  initialData: any[]
  lang: string
}) {
  const [institutions, setInstitutions] = useState(initialData)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ name: '', urdu_name: '', domain: '' })
  
  const supabase = createClient()
  const router = useRouter()

  const handleCreate = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('institutions')
      .insert([{ 
        name: formData.name, 
        urdu_name: formData.urdu_name, 
        domain: formData.domain || null,
        status: 'active' 
      }])
      .select()

    if (!error && data) {
      setInstitutions([data[0], ...institutions])
      setOpen(false)
      setFormData({ name: '', urdu_name: '', domain: '' })
      router.refresh()
    } else {
      console.error(error)
      alert("Failed to create institution")
    }
    setLoading(false)
  }

  const filtered = institutions.filter(inst => 
    inst.name?.toLowerCase().includes(search.toLowerCase()) || 
    inst.urdu_name?.includes(search)
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search Jamias..." 
            className="pl-9 bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto gap-2">
              <Plus className="h-4 w-4" />
              Register New Jamia
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register New Institution</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Institution Name (English)</Label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Jamia Darul Uloom"
                />
              </div>
              <div className="space-y-2">
                <Label>Institution Name (Urdu)</Label>
                <Input 
                  value={formData.urdu_name}
                  onChange={(e) => setFormData({...formData, urdu_name: e.target.value})}
                  placeholder="e.g. جامعہ دارالعلوم"
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <Label>Subdomain (Optional)</Label>
                <Input 
                  value={formData.domain}
                  onChange={(e) => setFormData({...formData, domain: e.target.value})}
                  placeholder="e.g. darululoom.system.com"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={loading || !formData.name}>
                {loading ? 'Creating...' : 'Create Jamia'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(inst => (
          <Card key={inst.id} className="relative overflow-hidden group hover:border-primary/50 transition-colors">
            <div className={`absolute top-0 w-full h-1 ${inst.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <CardHeader className="pb-2 flex flex-row justify-between items-start">
              <div>
                <CardTitle className="text-lg font-bold">{inst.name}</CardTitle>
                <p className="text-sm text-muted-foreground font-arabic mt-1">{inst.urdu_name}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Building className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${inst.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-amber-100 text-amber-800'}`}>
                  {inst.status}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(inst.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl">
            <Building className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No institutions found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
