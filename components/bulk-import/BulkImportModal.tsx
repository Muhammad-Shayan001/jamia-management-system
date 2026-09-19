'use client'

import React, { useState } from 'react'
import Papa from 'papaparse'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { downloadTemplate } from '@/lib/export-utils'
import { bulkImportStudents, bulkImportTeachers, BulkImportResult } from '@/lib/actions/bulk-import'
import { Upload, Download, CheckCircle, XCircle } from 'lucide-react'

type ImportType = 'students' | 'teachers'

interface BulkImportModalProps {
  isOpen: boolean
  onClose: () => void
  type: ImportType
  onSuccess?: () => void
}

export function BulkImportModal({ isOpen, onClose, type, onSuccess }: BulkImportModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [parsedData, setParsedData] = useState<any[]>([])
  const [validationErrors, setValidationErrors] = useState<any[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const [result, setResult] = useState<BulkImportResult | null>(null)

  const expectedHeaders = type === 'students' 
    ? ['email', 'fullNameEn', 'fullNameUr', 'fatherNameEn', 'phone', 'password', 'classId']
    : ['email', 'fullNameEn', 'fullNameUr', 'phone', 'password']

  const handleDownloadTemplate = () => {
    downloadTemplate(expectedHeaders, type === 'students' ? 'Students' : 'Teachers')
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setParsedData(results.data)
        validateData(results.data)
        setStep(2)
      },
      error: (err) => {
        alert('Error parsing CSV: ' + err.message)
      }
    })
  }

  const validateData = (data: any[]) => {
    const errors: any[] = []
    data.forEach((row, index) => {
      if (!row.email) errors.push({ row: index + 1, message: 'Missing email' })
      if (!row.fullNameEn) errors.push({ row: index + 1, message: 'Missing fullNameEn' })
      if (type === 'students' && !row.fatherNameEn) {
        errors.push({ row: index + 1, message: 'Missing fatherNameEn' })
      }
    })
    setValidationErrors(errors)
  }

  const handleImport = async () => {
    setIsImporting(true)
    let res: BulkImportResult
    
    if (type === 'students') {
      res = await bulkImportStudents(parsedData as any)
    } else {
      res = await bulkImportTeachers(parsedData as any)
    }
    
    setResult(res)
    setIsImporting(false)
    setStep(3)
  }

  const reset = () => {
    setStep(1)
    setParsedData([])
    setValidationErrors([])
    setResult(null)
  }

  const handleClose = () => {
    reset()
    if (result && result.success > 0 && onSuccess) {
      onSuccess()
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import {type === 'students' ? 'Students' : 'Teachers'}</DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6 py-4">
            <div className="flex justify-between items-center bg-muted/50 p-4 rounded-lg">
              <div>
                <h4 className="font-medium">1. Download Template</h4>
                <p className="text-sm text-muted-foreground">Use this template to format your data correctly.</p>
              </div>
              <Button onClick={handleDownloadTemplate} variant="outline">
                <Download className="w-4 h-4 mr-2" /> Download
              </Button>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg space-y-4">
              <div>
                <h4 className="font-medium">2. Upload Data</h4>
                <p className="text-sm text-muted-foreground">Upload your filled CSV file here.</p>
              </div>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/70">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload CSV</p>
                  </div>
                  <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 py-4">
            <h4 className="font-medium">Validation Preview</h4>
            <p className="text-sm text-muted-foreground">
              {parsedData.length} rows detected. {validationErrors.length} validation errors.
            </p>
            
            {validationErrors.length > 0 && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                <strong>Please fix these errors in your CSV and re-upload:</strong>
                <ul className="list-disc pl-5 mt-2">
                  {validationErrors.slice(0, 5).map((e, i) => (
                    <li key={i}>Row {e.row}: {e.message}</li>
                  ))}
                  {validationErrors.length > 5 && <li>...and {validationErrors.length - 5} more</li>}
                </ul>
              </div>
            )}

            <div className="border rounded-md max-h-[400px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {expectedHeaders.map(h => <TableHead key={h}>{h}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.slice(0, 10).map((row, i) => {
                    const rowErrors = validationErrors.filter(e => e.row === i + 1)
                    return (
                      <TableRow key={i} className={rowErrors.length > 0 ? "bg-red-50" : "bg-green-50"}>
                        {expectedHeaders.map(h => (
                          <TableCell key={h}>{row[h] || '-'}</TableCell>
                        ))}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              {parsedData.length > 10 && <div className="p-2 text-center text-sm text-muted-foreground">Showing 10 of {parsedData.length} rows</div>}
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={reset}>Cancel / Re-upload</Button>
              <Button onClick={handleImport} disabled={validationErrors.length > 0 || isImporting}>
                {isImporting ? 'Importing...' : 'Start Import'}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && result && (
          <div className="space-y-6 py-4 text-center">
            {result.failed === 0 ? (
              <div className="flex flex-col items-center">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-xl font-bold">Import Successful!</h3>
                <p className="text-muted-foreground mt-2">Successfully imported {result.success} records.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <XCircle className="w-16 h-16 text-yellow-500 mb-4" />
                <h3 className="text-xl font-bold">Import Completed with Errors</h3>
                <p className="text-muted-foreground mt-2">
                  Successfully imported {result.success} records. Failed: {result.failed}.
                </p>
                <div className="mt-4 text-left w-full bg-muted p-4 rounded-md overflow-auto max-h-[200px] text-sm">
                  <ul className="list-disc pl-5">
                    {result.errors.map((e, i) => (
                      <li key={i}>Row {e.row} ({e.email}): {e.error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            <Button onClick={handleClose}>Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
