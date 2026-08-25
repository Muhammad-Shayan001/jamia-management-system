'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import moment from 'moment-hijri'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(moment())
  
  // Basic mock events
  const events = [
    { date: moment().format('YYYY-MM-DD'), title: 'Monthly Exam Starts' },
    { date: moment().add(3, 'days').format('YYYY-MM-DD'), title: 'Jumuah Special Lecture' },
  ]

  const nextMonth = () => setCurrentDate(moment(currentDate).add(1, 'month'))
  const prevMonth = () => setCurrentDate(moment(currentDate).subtract(1, 'month'))

  const gregorianMonth = currentDate.format('MMMM YYYY')
  const hijriMonth = currentDate.format('iMMMM iYYYY') // e.g., Ramadan 1447

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Academic Calendar</h2>
      </div>

      <Card className="border-primary/10 shadow-sm max-w-4xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-center">
            <CardTitle className="text-xl">{gregorianMonth}</CardTitle>
            <p className="text-sm text-primary font-bold mt-1 text-urdu">{hijriMonth} (ہجری)</p>
          </div>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b bg-muted/20">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="p-2 text-center text-sm font-semibold border-r last:border-r-0">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 auto-rows-fr">
            {/* Simple mock grid generation */}
            {Array.from({ length: 35 }).map((_, i) => {
              const dayOffset = i - 3; // mock offset for start of month
              if (dayOffset < 0 || dayOffset > 30) {
                return <div key={i} className="min-h-[100px] border-r border-b bg-muted/5 p-2 last:border-r-0" />
              }
              const dayMoment = moment(currentDate).date(dayOffset + 1)
              const dateStr = dayMoment.format('YYYY-MM-DD')
              const dayEvents = events.filter(e => e.date === dateStr)
              
              return (
                <div key={i} className={`min-h-[100px] border-r border-b p-2 last:border-r-0 hover:bg-muted/10 transition-colors ${dayEvents.length ? 'bg-primary/5' : ''}`}>
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium">{dayOffset + 1}</span>
                    <span className="text-[10px] text-muted-foreground">{dayMoment.format('iD')}</span>
                  </div>
                  <div className="mt-2 space-y-1">
                    {dayEvents.map((evt, idx) => (
                      <div key={idx} className="text-[10px] bg-primary text-white p-1 rounded-sm leading-tight truncate">
                        {evt.title}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
