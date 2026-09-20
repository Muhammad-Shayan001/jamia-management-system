'use client'

import { useState, useActionState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { addExpense } from '@/lib/actions/donations'
import { CreditCard, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function ExpensesManager({ initialExpenses, isUr }: { initialExpenses: any[], isUr: boolean }) {
  const [isAdding, setIsAdding] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()

  const [state, formAction, pending] = useActionState(async (prevState: any, formData: FormData) => {
    const res = await addExpense(prevState, formData)
    if (res.error) {
      toast.error(res.error)
      return res
    }
    toast.success(isUr ? 'خرچہ درج کر لیا گیا' : 'Expense logged successfully')
    setIsAdding(false)
    router.refresh()
    return res
  }, null)

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{isUr ? 'اخراجات' : 'Expense Tracker'}</h1>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="w-4 h-4 mr-2" />
          {isUr ? 'نیا خرچہ' : 'Log Expense'}
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>{isUr ? 'خرچہ درج کریں' : 'Log New Expense'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form ref={formRef} action={formAction} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isUr ? 'زمرہ' : 'Category'}</Label>
                  <Select name="category" required>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salary">Salary</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="stationery">Stationery</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{isUr ? 'رقم (Rs)' : 'Amount (Rs)'}</Label>
                  <Input name="amount" type="number" required min="1" />
                </div>
                <div className="space-y-2">
                  <Label>{isUr ? 'تاریخ' : 'Date'}</Label>
                  <Input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>{isUr ? 'تفصیل' : 'Description'}</Label>
                  <Input name="description" required />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button type="submit" disabled={pending}>
                  {pending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isUr ? 'محفوظ کریں' : 'Save Expense'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="p-4">{isUr ? 'تاریخ' : 'Date'}</th>
                  <th className="p-4">{isUr ? 'زمرہ' : 'Category'}</th>
                  <th className="p-4">{isUr ? 'تفصیل' : 'Description'}</th>
                  <th className="p-4 text-right">{isUr ? 'رقم' : 'Amount'}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {initialExpenses.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No expenses found.</td></tr>
                ) : (
                  initialExpenses.map(e => (
                    <tr key={e.id} className="hover:bg-muted/50 transition-colors">
                      <td className="p-4">{e.date}</td>
                      <td className="p-4 capitalize">{e.category}</td>
                      <td className="p-4">{e.description}</td>
                      <td className="p-4 font-bold text-destructive text-right">Rs {e.amount.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
