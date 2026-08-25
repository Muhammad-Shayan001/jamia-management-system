import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Upload, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getDictionary } from '@/lib/dictionaries'

export default async function TeachersPage({ params }: { params: Promise<{ lang: string }> }) {
  const supabase = await createClient()
  const { lang } = await params
  const dict = await getDictionary(lang)
  
  const { data: teachers, error } = (await supabase
    .from('teachers')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)) as any

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">{dict.nav.teachers}</h2>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button variant="outline" className="text-primary border-primary/20">
            <Upload className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
            Import CSV
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {dict.common.add_new}
          </Button>
        </div>
      </div>

      <Card className="border-primary/10 shadow-sm">
        <CardHeader className="py-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground rtl:left-auto rtl:right-2.5" />
              <Input
                type="search"
                placeholder={dict.common.search}
                className="pl-8 rtl:pl-3 rtl:pr-8 border-primary/20"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-primary/5">
              <TableRow>
                <TableHead>Emp No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {error || !teachers?.length ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No teachers found.
                  </TableCell>
                </TableRow>
              ) : (
                teachers.map((teacher: any) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">{teacher.employee_number}</TableCell>
                    <TableCell>
                      {lang === 'ur' && teacher.name_ur ? teacher.name_ur : teacher.name_en}
                    </TableCell>
                    <TableCell>{teacher.specialization || '-'}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${teacher.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {teacher.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-primary">
                        {dict.common.edit}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          <div className="flex items-center justify-end space-x-2 py-4 rtl:space-x-reverse">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
