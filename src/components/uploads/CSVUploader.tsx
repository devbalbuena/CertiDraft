'use client'

import * as React from 'react'
import Papa from 'papaparse'
import { UploadCloud, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface CSVUploaderProps {
  onUpload: (data: any[], columns: string[]) => void
}

export function CSVUploader({ onUpload }: CSVUploaderProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  
  // Preview state
  const [previewData, setPreviewData] = React.useState<any[]>([])
  const [columns, setColumns] = React.useState<string[]>([])
  const [totalRows, setTotalRows] = React.useState(0)

  const handleFile = (file: File) => {
    setError(null)
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.')
      return
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError('Failed to parse CSV file. Please check its format.')
          return
        }
        
        const data = results.data as any[]
        if (data.length === 0) {
          setError('The CSV file is empty.')
          return
        }

        const cols = Object.keys(data[0] || {})
        setColumns(cols)
        setTotalRows(data.length)
        setPreviewData(data.slice(0, 5))
        
        // Pass full data up when confirmed, but we store it locally in preview
        // Actually, the prompt says "Show a 'Continue' button that calls an onUpload prop with the parsed data array and the detected column headers."
        // So we just store full data locally until "Continue" is clicked.
        _fullData.current = data
      },
      error: () => {
        setError('An error occurred while reading the file.')
      }
    })
  }

  const _fullData = React.useRef<any[]>([])

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = () => setIsDragging(false)

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0])
    }
  }

  const handleContinue = () => {
    if (_fullData.current.length > 0 && columns.length > 0) {
      onUpload(_fullData.current, columns)
    }
  }

  return (
    <div className="space-y-6">
      {!previewData.length ? (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer relative ${
            isDragging ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
          }`}
        >
          <input
            type="file"
            accept=".csv"
            onChange={onFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            title="Upload CSV"
          />
          <div className="flex flex-col items-center justify-center gap-4 pointer-events-none">
            <div className="p-4 bg-muted rounded-full">
              <UploadCloud className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Drag and drop your CSV file here or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports .csv files with headers
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col} className="font-semibold">{col}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.map((row, i) => (
                  <TableRow key={i}>
                    {columns.map((col) => (
                      <TableCell key={col} className="truncate max-w-[200px]">
                        {row[col] as string}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing 5 of {totalRows} rows
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPreviewData([])}>
                Upload Different File
              </Button>
              <Button onClick={handleContinue}>
                Continue to Mapping
              </Button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  )
}
