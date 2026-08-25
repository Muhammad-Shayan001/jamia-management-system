import { ChatInterface } from '@/components/ui/ChatInterface'

export default function StudentChatPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Messages</h2>
      
      <div className="grid md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-2">
          {/* Contact List */}
          <div className="p-3 bg-primary/10 border-l-4 border-primary rounded-r-md cursor-pointer font-medium">
            Ust. Ahmad (Quran)
          </div>
          <div className="p-3 hover:bg-muted rounded-md cursor-pointer text-muted-foreground transition-colors">
            Ust. Bilal (Arabic)
          </div>
        </div>
        
        <div className="md:col-span-3">
          <ChatInterface currentUserId="student_123" chatPartnerName="Ust. Ahmad" />
        </div>
      </div>
    </div>
  )
}
