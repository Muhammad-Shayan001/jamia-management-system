'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function ClassSelector({ classes, selectedId }: { classes: any[], selectedId: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleSelect = (id: string | null) => {
    if (!id) return
    const params = new URLSearchParams(searchParams.toString())
    params.set('classId', id)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <Select value={selectedId} onValueChange={handleSelect}>
      <SelectTrigger className="w-[200px] h-9 border-primary/20">
        <SelectValue placeholder="Select Class" />
      </SelectTrigger>
      <SelectContent>
        {classes.map((c) => (
          <SelectItem key={c.id} value={c.id}>{c.name_en}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
