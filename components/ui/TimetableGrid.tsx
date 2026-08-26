'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

// Dummy data for visual grid
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const periods = ['08:00 - 08:45', '08:45 - 09:30', '09:30 - 10:15', 'Break', '10:45 - 11:30', '11:30 - 12:15']

export function TimetableGrid({ role = 'admin' }: { role?: 'admin' | 'teacher' | 'student' }) {
  return (
    <Card className="border-primary/10 shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 bg-primary/5">
        <CardTitle className="text-lg">Weekly Schedule</CardTitle>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" />
          Print / PDF
        </Button>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="p-3 font-semibold w-24 border-r text-center">Time</th>
              {days.map(day => (
                <th key={day} className="p-3 font-semibold text-center border-r last:border-r-0 min-w-[120px]">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map((period, i) => (
              <tr key={period} className="border-b last:border-b-0">
                <td className="p-3 font-medium border-r text-center bg-muted/20 whitespace-nowrap">{period}</td>
                {period === 'Break' ? (
                  <td colSpan={6} className="p-3 text-center bg-muted/30 font-semibold text-muted-foreground tracking-widest">
                    B R E A K
                  </td>
                ) : (
                  days.map(day => (
                    <td key={`${day}-${i}`} className="p-2 border-r last:border-r-0 text-center relative group">
                      {/* Placeholder content for grid */}
                      <div className="p-2 bg-primary/5 rounded-md border border-primary/10 min-h-[60px] flex flex-col justify-center">
                        <span className="font-bold text-primary block">Quran</span>
                        <span className="text-xs text-muted-foreground block">Ust. Ahmad</span>
                      </div>
                      
                      {role === 'admin' && (
                        <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="secondary" className="h-7 text-xs">Edit</Button>
                        </div>
                      )}
                    </td>
                  ))
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
