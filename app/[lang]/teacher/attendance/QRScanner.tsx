'use client'

import { useState, useEffect } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { CheckCircle2, Scan } from 'lucide-react'

export function QRScanner({ onScan }: { onScan: (decodedText: string) => void }) {
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null
    
    if (scanning) {
      scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      )
      
      scanner.render(
        (decodedText) => {
          onScan(decodedText)
          // Don't pause, keep scanning for next student
        },
        (error) => {
          // ignore background errors
        }
      )
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error)
      }
    }
  }, [scanning, onScan])

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <Card className="border-primary/20 overflow-hidden shadow-lg">
        <div className="bg-primary p-4 text-primary-foreground text-center flex items-center justify-center space-x-2">
          <Scan className="w-5 h-5" />
          <h3 className="font-semibold">Scanner Active</h3>
        </div>
        <CardContent className="p-0">
          {scanning ? (
            <div id="qr-reader" className="w-full min-h-[300px]" />
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] bg-muted/20">
              <Button onClick={() => setScanning(true)} size="lg" className="bg-primary text-white">
                Start Camera
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {scanning && (
        <Button variant="outline" className="w-full" onClick={() => setScanning(false)}>
          Stop Camera
        </Button>
      )}
    </div>
  )
}
