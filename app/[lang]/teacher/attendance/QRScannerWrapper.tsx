'use client'

import { QRScanner } from './QRScanner'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

export function QRScannerWrapper() {
  const [lastScanned, setLastScanned] = useState<string | null>(null)

  const handleScan = (decodedText: string) => {
    // Only process if it's a new scan to prevent spamming
    if (decodedText !== lastScanned) {
      setLastScanned(decodedText)
      
      // In a real app, we'd hit a Server Action here:
      // await markAttendance(decodedText)
      
      toast.success(`Attendance recorded for student ID: ${decodedText.slice(0,8)}...`, {
        icon: '✅',
        duration: 3000
      })
      
      // Reset after 3 seconds so they can be scanned again if needed
      setTimeout(() => setLastScanned(null), 3000)
    }
  }

  return (
    <div className="space-y-4">
      <QRScanner onScan={handleScan} />
      
      <AnimatePresence>
        {lastScanned && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg text-center"
          >
            <p className="font-semibold text-lg">Successfully Scanned!</p>
            <p className="text-sm opacity-80">{lastScanned}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
