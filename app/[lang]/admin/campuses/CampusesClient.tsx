'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, MapPin, Search } from 'lucide-react'
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
import { toast } from 'sonner'

export default function CampusesClient({
  initialData,
  institutionId,
  lang,
}: {
  initialData: any[]
  institutionId: string
  lang: string
}) {
  const [campuses, setCampuses] = useState(initialData)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ name: '', address: '', contact_number: '' })
  
  const supabase = createClient()
  const router = useRouter()

  const handleCreate = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('campuses')
      .insert([{ 
        institution_id: institutionId,
        name: formData.name, 
        address: formData.address, 
        contact_number: formData.contact_number,
        is_active: true 
      }])
      .select()

    if (!error && data) {
      setCampuses([data[0], ...campuses])
      setOpen(false)
      setFormData({ name: '', address: '', contact_number: '' })
      toast.success("Campus added successfully!")
      router.refresh()
    } else {
      console.error(error)
      toast.error("Failed to add campus")
    }
    setLoading(false)
  }

  const filtered = campuses.filter(camp => 
    camp.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search Campuses..." 
            className="pl-9 bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto gap-2">
              <Plus className="h-4 w-4" />
              Add Campus
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register New Campus / Branch</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Campus Name</Label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Main Campus / Boys Branch"
                />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="e.g. 123 Education St, City"
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Number</Label>
                <Input 
                  value={formData.contact_number}
                  onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
                  placeholder="e.g. +92 300 1234567"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={loading || !formData.name}>
                {loading ? 'Adding...' : 'Add Campus'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(camp => (
          <Card key={camp.id} className="relative overflow-hidden group hover:border-primary/50 transition-colors">
            <div className={`absolute top-0 w-full h-1 ${camp.is_active ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <CardHeader className="pb-2 flex flex-row justify-between items-start">
              <div>
                <CardTitle className="text-lg font-bold">{camp.name}</CardTitle>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <MapPin className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm text-muted-foreground mt-2">
                <p>{camp.address || 'No address provided'}</p>
                <p>{camp.contact_number || 'No contact provided'}</p>
              </div>
              <div className="mt-4">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${camp.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {camp.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl">
            <MapPin className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No campuses found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
