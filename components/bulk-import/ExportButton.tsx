'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { useState } from 'react'
import { exportToExcel } from '@/lib/export-utils'

interface ExportButtonProps {
  filename: string
  fetchData: () => Promise<any[]>
}

export function ExportButton({ filename, fetchData }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const data = await fetchData()
      exportToExcel(data, filename)
    } catch (err) {
      console.error(err)
      alert("Failed to export data")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button variant="outline" className="text-primary border-primary/20" onClick={handleExport} disabled={isExporting}>
      <Download className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
      {isExporting ? 'Exporting...' : 'Export'}
    </Button>
  )
}
