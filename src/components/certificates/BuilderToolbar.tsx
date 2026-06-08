'use client'

import * as React from 'react'
import * as fabric from 'fabric'
import { useCanvasStore } from '@/lib/canvas-store'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MousePointer2,
  Type,
  Square,
  Circle as CircleIcon,
  Image as ImageIcon,
  QrCode,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Save,
  Eye,
  ChevronDown
} from 'lucide-react'

const VARIABLES = [
  '{{recipient_name}}',
  '{{achievement}}',
  '{{citation_text}}',
  '{{issued_date}}',
  '{{grade}}',
  '{{issuer_name}}',
]

export function BuilderToolbar({ onSave }: { onSave: (json: string) => void }) {
  const { 
    canvas, 
    activeTool, 
    setActiveTool, 
    undo, 
    redo, 
    historyIndex, 
    canvasHistory, 
    zoom, 
    setZoom 
  } = useCanvasStore()
  
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // ── Add Elements ────────────────────────────────────────────────────────
  const addText = (text = 'Enter text') => {
    if (!canvas) return
    const textObj = new fabric.FabricText(text, {
      left: 421,
      top: 297,
      fontFamily: 'Inter',
      fontSize: 32,
      fill: '#000000',
      originX: 'center',
      originY: 'center',
    })
    canvas.add(textObj)
    canvas.setActiveObject(textObj)
    canvas.requestRenderAll()
  }

  const addRect = () => {
    if (!canvas) return
    const rect = new fabric.Rect({
      left: 421,
      top: 297,
      width: 100,
      height: 100,
      fill: '#e2e8f0',
      stroke: '#94a3b8',
      strokeWidth: 2,
      originX: 'center',
      originY: 'center',
    })
    canvas.add(rect)
    canvas.setActiveObject(rect)
    canvas.requestRenderAll()
  }

  const addCircle = () => {
    if (!canvas) return
    const circle = new fabric.Circle({
      left: 421,
      top: 297,
      radius: 50,
      fill: '#e2e8f0',
      stroke: '#94a3b8',
      strokeWidth: 2,
      originX: 'center',
      originY: 'center',
    })
    canvas.add(circle)
    canvas.setActiveObject(circle)
    canvas.requestRenderAll()
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvas || !e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onload = (f) => {
      const data = f.target?.result as string
      fabric.FabricImage.fromURL(data, { crossOrigin: 'anonymous' }).then((img) => {
        img.set({
          left: 421,
          top: 297,
          originX: 'center',
          originY: 'center',
        })
        img.scaleToWidth(200)
        canvas.add(img)
        canvas.setActiveObject(img)
        canvas.requestRenderAll()
      })
    }
    reader.readAsDataURL(file)
    e.target.value = '' // reset
  }

  const addQRCode = () => {
    if (!canvas) return
    // Create a group acting as a placeholder
    const rect = new fabric.Rect({
      width: 100,
      height: 100,
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2,
      originX: 'center',
      originY: 'center',
    })
    const text = new fabric.FabricText('QR Code', {
      fontSize: 16,
      originX: 'center',
      originY: 'center',
    })
    // @ts-ignore
    const group = new fabric.Group([rect, text], {
      left: 421,
      top: 297,
      originX: 'center',
      originY: 'center',
    })
    // Mark it specifically so we know it's a QR placeholder later
    // @ts-ignore
    group.set('isQRCode', true)
    canvas.add(group)
    canvas.setActiveObject(group)
    canvas.requestRenderAll()
  }

  // ── Actions ─────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!canvas) return
    const json = JSON.stringify(canvas.toJSON(['isQRCode']))
    onSave(json)
  }

  const handlePreview = () => {
    if (!canvas) return
    // Reset zoom and viewport temporarily to get a clean export
    const originalZoom = canvas.getZoom()
    const originalVpt = [...canvas.viewportTransform!]
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0])
    
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1,
    })
    
    canvas.setViewportTransform(originalVpt)
    canvas.setZoom(originalZoom)
    
    const win = window.open('')
    if (win) {
      win.document.write(`<img src="${dataURL}" alt="Preview" style="max-width: 100%; border: 1px solid #ccc; box-shadow: 0 0 10px rgba(0,0,0,0.1);" />`)
    }
  }

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < canvasHistory.length - 1

  return (
    <div className="flex items-center gap-4 border-b border-border bg-card px-4 h-14 shrink-0 overflow-x-auto">
      
      {/* Tool Selector */}
      <div className="flex items-center gap-1">
        <Button 
          variant={activeTool === 'select' ? 'default' : 'ghost'} 
          size="icon" 
          onClick={() => setActiveTool('select')}
          title="Select"
        >
          <MousePointer2 className="h-4 w-4" />
        </Button>
        <Button 
          variant={activeTool === 'text' ? 'default' : 'ghost'} 
          size="icon" 
          onClick={() => { setActiveTool('text'); addText(); }}
          title="Text"
        >
          <Type className="h-4 w-4" />
        </Button>
        <Button 
          variant={activeTool === 'rect' ? 'default' : 'ghost'} 
          size="icon" 
          onClick={() => { setActiveTool('rect'); addRect(); }}
          title="Rectangle"
        >
          <Square className="h-4 w-4" />
        </Button>
        <Button 
          variant={activeTool === 'circle' ? 'default' : 'ghost'} 
          size="icon" 
          onClick={() => { setActiveTool('circle'); addCircle(); }}
          title="Circle"
        >
          <CircleIcon className="h-4 w-4" />
        </Button>
      </div>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Add Elements */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => addText()}>
          <Type className="mr-2 h-4 w-4" /> Add Text
        </Button>
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleImageUpload} 
        />
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          <ImageIcon className="mr-2 h-4 w-4" /> Add Image
        </Button>
        <Button variant="outline" size="sm" onClick={addQRCode}>
          <QrCode className="mr-2 h-4 w-4" /> Add QR
        </Button>
      </div>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Variables */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Variables <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {VARIABLES.map((v) => (
            <DropdownMenuItem key={v} onClick={() => addText(v)}>
              {v}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="w-px h-6 bg-border mx-1" />

      {/* History */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo} title="Undo">
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo} title="Redo">
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Zoom */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} title="Zoom Out">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-xs font-medium w-12 text-center text-muted-foreground">
          {Math.round(zoom * 100)}%
        </span>
        <Button variant="ghost" size="icon" onClick={() => setZoom(Math.min(3, zoom + 0.1))} title="Zoom In">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setZoom(1)} title="Fit to Screen">
          <Maximize className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1" />

      {/* Export */}
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={handlePreview}>
          <Eye className="mr-2 h-4 w-4" /> Preview
        </Button>
        <Button size="sm" onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" /> Save Design
        </Button>
      </div>

    </div>
  )
}
