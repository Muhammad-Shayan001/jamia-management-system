'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, Megaphone } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type Announcement = {
  id: string
  title_en: string
  title_ur: string
  body_en: string
  body_ur: string
  created_at: string
}

export function AnnouncementFeed({ initialData, userRole, lang }: { initialData: Announcement[], userRole: string, lang: string }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialData)
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()
  const isUrdu = lang === 'ur'

  useEffect(() => {
    // Subscribe to new announcements
    const channel = supabase
      .channel('public:announcements')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'announcements',
          // Note: Real RLS filtering happens on server, but we can client-side filter here if needed
        },
        (payload) => {
          const newAnn = payload.new as Announcement
          setAnnouncements((prev) => [newAnn, ...prev])
          setUnreadCount((prev) => prev + 1)
          
          // Play a sound or show browser notification here if desired
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <Card className="border-primary/10 shadow-sm col-span-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Megaphone className="w-5 h-5 text-primary" />
          <CardTitle>Announcements</CardTitle>
        </div>
        {unreadCount > 0 && (
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            className="flex items-center bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-bold"
          >
            <Bell className="w-3 h-3 mr-1 rtl:ml-1 rtl:mr-0" />
            {unreadCount} New
          </motion.div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence>
          {announcements.length === 0 ? (
            <div className="text-center p-6 text-muted-foreground bg-muted/20 rounded-lg">
              No recent announcements.
            </div>
          ) : (
            announcements.map((ann) => (
              <motion.div
                key={ann.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                layout
                className="p-4 border border-border rounded-lg bg-card hover:shadow-md transition-shadow"
                onClick={() => setUnreadCount(0)}
              >
                <h4 className="font-bold text-lg text-primary">
                  {isUrdu && ann.title_ur ? ann.title_ur : ann.title_en}
                </h4>
                <p className="text-sm mt-2 text-foreground/80 whitespace-pre-wrap">
                  {isUrdu && ann.body_ur ? ann.body_ur : ann.body_en}
                </p>
                <div className="text-xs text-muted-foreground mt-4">
                  {new Date(ann.created_at).toLocaleDateString(lang === 'ur' ? 'ur-PK' : 'en-US', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
