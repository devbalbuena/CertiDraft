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
  ChevronDown,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

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

  const addText = (text = 'Double click to edit') => {
    if (!canvas) return
    const textObj = new fabric.Textbox(text, {
      left: 421, top: 297, fontFamily: 'Inter', fontSize: 24,
      fill: '#000000', width: 300, textAlign: 'center',
      originX: 'center', originY: 'center',
    })
    canvas.add(textObj)
    canvas.setActiveObject(textObj)
    canvas.requestRenderAll()
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvas || !e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onload = (f) => {
      const data = f.target?.result as string
      fabric.FabricImage.fromURL(data, { crossOrigin: 'anonymous' }).then((img) => {
        img.set({ left: 421, top: 297, originX: 'center', originY: 'center' })
        img.scaleToWidth(200)
        canvas.add(img)
        canvas.setActiveObject(img)
        canvas.requestRenderAll()
      })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const addQRCode = () => {
    if (!canvas) return
    const rect = new fabric.Rect({ width: 100, height: 100, fill: '#ffffff', stroke: '#000000', strokeWidth: 2, originX: 'center', originY: 'center' })
    const text = new fabric.Textbox('QR Code', { fontSize: 14, textAlign: 'center', originX: 'center', originY: 'center', width: 90 })
    // @ts-ignore
    const group = new fabric.Group([rect, text], { left: 421, top: 297, originX: 'center', originY: 'center' })
    // @ts-ignore
    group.set('isQRCode', true)
    canvas.add(group)
    canvas.setActiveObject(group)
    canvas.requestRenderAll()
  }

  const handleSave = () => {
    if (!canvas) return
    const json = JSON.stringify((canvas as any).toJSON(['isQRCode']))
    onSave(json)
  }

  const handlePreview = () => {
    if (!canvas) return
    const originalZoom = canvas.getZoom()
    const originalVpt = [...canvas.viewportTransform!] as fabric.TMat2D
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0] as fabric.TMat2D)
    const dataURL = canvas.toDataURL({ format: 'png', quality: 1, multiplier: 1 })
    canvas.setViewportTransform(originalVpt)
    canvas.setZoom(originalZoom)
    const win = window.open('')
    if (win) {
      win.document.write(`<img src="${dataURL}" alt="Preview" style="max-width:100%;border:1px solid #ccc;box-shadow:0 0 10px rgba(0,0,0,.1);" />`)
    }
  }

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < canvasHistory.length - 1

  const toolButtons = [
    { id: 'select', icon: <MousePointer2 className="h-4 w-4" />, label: 'Select' },
    { id: 'text',   icon: <Type className="h-4 w-4" />,          label: 'Text',   action: () => addText() },
    { id: 'rect',   icon: <Square className="h-4 w-4" />,        label: 'Rect' },
    { id: 'circle', icon: <CircleIcon className="h-4 w-4" />,    label: 'Circle' },
  ]

  return (
    <div className="flex items-center gap-1 border-b border-slate-800 bg-[#1e293b] px-3 h-12 shrink-0 overflow-x-auto">

      {/* Tool Selector */}
      <div className="flex items-center gap-0.5 bg-slate-900/60 rounded-lg p-0.5">
        {toolButtons.map(({ id, icon, label, action }) => (
          <button
            key={id}
            title={label}
            onClick={() => { setActiveTool(id as any); action?.() }}
            className={cn(
              'p-2 rounded-md transition-all text-sm',
              activeTool === id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            )}
          >
            {icon}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-slate-700 mx-1" />

      {/* Media buttons */}
      <div className="flex items-center gap-1">
        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs font-medium transition-all"
          title="Add Image"
        >
          <ImageIcon className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Image</span>
        </button>
        <button
          onClick={addQRCode}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs font-medium transition-all"
          title="Add QR Code"
        >
          <QrCode className="h-3.5 w-3.5" />
          <span className="hidden md:inline">QR</span>
        </button>
      </div>

      <div className="w-px h-6 bg-slate-700 mx-1" />

      {/* Dynamic Variables */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 text-xs font-semibold transition-all">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Dynamic Variables</span>
            <ChevronDown className="h-3 w-3 ml-0.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#1e293b] border-slate-700 text-slate-300">
          {VARIABLES.map((v) => (
            <DropdownMenuItem
              key={v}
              onClick={() => addText(v)}
              className="font-mono text-xs hover:bg-slate-800 hover:text-indigo-300 cursor-pointer"
            >
              {v}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="w-px h-6 bg-slate-700 mx-1" />

      {/* History */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Undo"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Redo"
        >
          <Redo2 className="h-4 w-4" />
        </button>
      </div>

      <div className="w-px h-6 bg-slate-700 mx-1" />

      {/* Zoom */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => setZoom(Math.max(0.25, zoom - 0.1))}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="text-xs font-mono text-slate-400 w-10 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(Math.min(3, zoom + 0.1))}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={() => setZoom(1)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
          title="Reset Zoom"
        >
          <Maximize className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1" />

      {/* Preview + Save */}
      <div className="flex items-center gap-2">
        <button
          onClick={handlePreview}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white text-xs font-semibold transition-all"
        >
          <Eye className="h-3.5 w-3.5" />
          Preview
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-900/40 transition-all"
        >
          <Save className="h-3.5 w-3.5" />
          Save Design
        </button>
      </div>

    </div>
  )
}
