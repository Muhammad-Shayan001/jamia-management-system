'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import { BulkImportModal } from './BulkImportModal'
import { useRouter } from 'next/navigation'

interface BulkImportButtonProps {
  type: 'students' | 'teachers'
}

export function BulkImportButton({ type }: BulkImportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      <Button variant="outline" className="text-primary border-primary/20" onClick={() => setIsOpen(true)}>
        <Upload className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
        Bulk Import
      </Button>

      {isOpen && (
        <BulkImportModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          type={type}
          onSuccess={() => {
            router.refresh()
          }}
        />
      )}
    </>
  )
}
