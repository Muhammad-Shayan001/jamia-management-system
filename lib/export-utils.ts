import * as XLSX from 'xlsx'

export function exportToExcel(data: any[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')
  
  // Generate buffer and trigger download
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

// For generating templates
export function downloadTemplate(headers: string[], filename: string) {
  const worksheet = XLSX.utils.aoa_to_sheet([headers])
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template')
  XLSX.writeFile(workbook, `${filename}_Template.xlsx`)
}
