'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

type Message = {
  id: string
  sender_id: string
  content: string
  created_at: string
  is_mine?: boolean
}

export function ChatInterface({ currentUserId, chatPartnerName }: { currentUserId: string, chatPartnerName: string }) {
  // In a real app we would load history from DB
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender_id: 'other', content: 'Assalamu alaikum. Did you complete the Hifz assignment?', created_at: new Date().toISOString() }
  ])
  const [newMessage, setNewMessage] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  
  // Realtime subscription placeholder
  // useEffect(() => {
  //   const supabase = createClient()
  //   const channel = supabase.channel('chat_room_x')
  //     .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
  //        setMessages(prev => [...prev, payload.new as Message])
  //     }).subscribe()
  //   return () => { supabase.removeChannel(channel) }
  // }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    
    // Optimistic UI update
    const msg: Message = {
      id: Date.now().toString(),
      sender_id: currentUserId,
      content: newMessage,
      created_at: new Date().toISOString(),
      is_mine: true
    }
    
    setMessages(prev => [...prev, msg])
    setNewMessage('')
    
    // In real app: await supabase.from('messages').insert(...)
  }

  return (
    <Card className="border-primary/10 shadow-sm flex flex-col h-[600px]">
      <CardHeader className="border-b pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">{chatPartnerName}</CardTitle>
            <p className="text-xs text-green-600 font-medium">Online</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map(msg => {
            const isMine = msg.sender_id === currentUserId || msg.is_mine
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex flex-col max-w-[75%] ${isMine ? 'ml-auto items-end' : 'mr-auto items-start'}`}
              >
                <div className={`p-3 rounded-2xl ${isMine ? 'bg-primary text-white rounded-tr-none' : 'bg-muted rounded-tl-none text-foreground'}`}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 px-1">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </motion.div>
            )
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </CardContent>
      
      <CardFooter className="border-t p-3">
        <form onSubmit={handleSend} className="flex w-full space-x-2 rtl:space-x-reverse">
          <Input 
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border-primary/20 focus-visible:ring-primary"
          />
          <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90 shrink-0">
            <Send className="w-4 h-4 rtl:-scale-x-100" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
