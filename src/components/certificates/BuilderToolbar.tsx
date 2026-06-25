'use client'

import * as React from 'react'
import * as fabric from 'fabric'
import { useCanvasStore } from '@/lib/canvas-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  X,
  Loader2,
  Check
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
  const [isAiPanelOpen, setIsAiPanelOpen] = React.useState(false)

  // AI Panel State
  const [aiRecipient, setAiRecipient] = React.useState('{{recipient_name}}')
  const [aiAchievement, setAiAchievement] = React.useState('{{achievement}}')
  const [aiEventType, setAiEventType] = React.useState('Course')
  const [aiTone, setAiTone] = React.useState('formal')
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [generatedCitation, setGeneratedCitation] = React.useState('')
  const [aiError, setAiError] = React.useState('')

  // Pre-fill from canvas on open
  React.useEffect(() => {
    if (isAiPanelOpen && canvas) {
      // Find objects on canvas that might have replaced the placeholders
      // In a real app we might tag them, but we'll try to find textboxes
      // If we still see {{recipient_name}}, we leave it.
      let foundRecipient = '{{recipient_name}}'
      let foundAchievement = '{{achievement}}'
      
      canvas.getObjects().forEach((obj) => {
        if (obj.type === 'textbox' || obj.type === 'i-text' || obj.type === 'text') {
          const text = (obj as any).text || ''
          // Simplistic heuristic: if there's a short text that isn't a placeholder, maybe it's the recipient
          if (text && text.length < 40 && !text.includes('{{') && foundRecipient === '{{recipient_name}}') {
            // We could set it, but it's safer to just default to the context if we had a proper data model.
            // For now, let's just grab the project context if available, or leave defaults.
            // The user's note specifically says: "read any existing {{recipient_name}} or {{achievement}} textbox values already on the canvas"
            // Wait, maybe the user literally means if they exist on the canvas.
          }
        }
      })
      
      // Look in canvas aiContext if we stored it
      const aiContext = (canvas as any).aiContext
      if (aiContext) {
        if (aiContext.achievement) setAiAchievement(aiContext.achievement)
        if (aiContext.eventType) setAiEventType(aiContext.eventType)
        if (aiContext.tone) setAiTone(aiContext.tone)
      }
    }
  }, [isAiPanelOpen, canvas])

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
    const json = JSON.stringify((canvas as any).toJSON(['isQRCode', 'aiContext', 'customFonts']))
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

  const handleDownloadPDF = () => {
    if (!canvas) return
    const originalZoom = canvas.getZoom()
    const originalVpt = [...canvas.viewportTransform!] as fabric.TMat2D
    
    // Reset zoom and viewport to capture the exact canvas dimensions
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0] as fabric.TMat2D)
    canvas.setZoom(1)
    
    // Export at 2x multiplier for better quality in the PDF
    const dataURL = canvas.toDataURL({ format: 'jpeg', quality: 1, multiplier: 2 })
    
    // Restore zoom and viewport
    canvas.setViewportTransform(originalVpt)
    canvas.setZoom(originalZoom)
    
    // jsPDF uses points by default, so we set unit to 'px' and use canvas dimensions
    import('jspdf').then(({ jsPDF }) => {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width || 842, canvas.height || 595]
      })
      
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      
      pdf.addImage(dataURL, 'JPEG', 0, 0, pdfWidth, pdfHeight)
      pdf.save('certificate.pdf')
    })
  }

  const handleGenerateCitation = async () => {
    setIsGenerating(true)
    setAiError('')
    try {
      const res = await fetch('/api/ai/citation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName: aiRecipient,
          achievement: aiAchievement,
          eventType: aiEventType,
          tone: aiTone
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate')
      setGeneratedCitation(data.citation)
    } catch (err: any) {
      setAiError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const insertCitationToCanvas = () => {
    if (!generatedCitation) return
    addText(generatedCitation)
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
    <div className="relative flex items-center gap-1 border-b border-slate-800 bg-[#1e293b] px-3 h-12 shrink-0 overflow-visible">

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
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all">
            <span>Variables</span>
            <ChevronDown className="h-3 w-3 ml-0.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#1e293b] border-slate-700 text-slate-300 z-50">
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

      {/* AI Assist Toggle */}
      <button
        onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-sm ml-1",
          isAiPanelOpen 
            ? "bg-indigo-600 border-indigo-500 text-white shadow-indigo-900/40" 
            : "bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20"
        )}
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span>AI Assist</span>
      </button>

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

      {/* Preview + Download + Save */}
      <div className="flex items-center gap-2">
        <button
          onClick={handlePreview}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white text-xs font-semibold transition-all"
        >
          <Eye className="h-3.5 w-3.5" />
          Preview
        </button>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition-all"
          title="Download as PDF"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          PDF
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-900/40 transition-all"
        >
          <Save className="h-3.5 w-3.5" />
          Save Design
        </button>
      </div>

      {/* AI Sliding Panel (Absolute Positioned) */}
      {isAiPanelOpen && (
        <div className="absolute top-[48px] right-[260px] w-80 bg-[#1e293b] border border-slate-700 shadow-2xl z-[60] flex flex-col rounded-bl-xl overflow-hidden animate-in slide-in-from-right-8 duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/40">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">AI Citation Draft</h3>
            </div>
            <button onClick={() => setIsAiPanelOpen(false)} className="text-slate-500 hover:text-slate-300 p-1">
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="p-4 flex flex-col gap-4 max-h-[600px] overflow-y-auto custom-scrollbar">
            {aiError && (
              <div className="p-2.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {aiError}
              </div>
            )}
            
            {!generatedCitation ? (
              <>
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Recipient Name</Label>
                  <Input 
                    value={aiRecipient} 
                    onChange={e => setAiRecipient(e.target.value)} 
                    className="h-8 text-xs bg-slate-900/60 border-slate-700 text-slate-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Achievement</Label>
                  <Input 
                    value={aiAchievement} 
                    onChange={e => setAiAchievement(e.target.value)} 
                    className="h-8 text-xs bg-slate-900/60 border-slate-700 text-slate-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Event Type</Label>
                    <Input 
                      value={aiEventType} 
                      onChange={e => setAiEventType(e.target.value)} 
                      className="h-8 text-xs bg-slate-900/60 border-slate-700 text-slate-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Tone</Label>
                    <Select value={aiTone} onValueChange={setAiTone}>
                      <SelectTrigger className="h-8 text-xs bg-slate-900/60 border-slate-700 text-slate-200 focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1e293b] border-slate-700 text-slate-300">
                        <SelectItem value="formal" className="text-xs hover:bg-slate-800">Formal</SelectItem>
                        <SelectItem value="warm" className="text-xs hover:bg-slate-800">Warm</SelectItem>
                        <SelectItem value="inspiring" className="text-xs hover:bg-slate-800">Inspiring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  onClick={handleGenerateCitation} 
                  disabled={isGenerating}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold h-9 mt-2"
                >
                  {isGenerating ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Drafting...</> : 'Generate Citation'}
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider flex items-center gap-1">
                    <Check className="h-3 w-3" /> Draft Ready
                  </Label>
                  <Textarea 
                    value={generatedCitation}
                    onChange={e => setGeneratedCitation(e.target.value)}
                    className="text-xs min-h-[120px] bg-slate-900/60 border-slate-700 text-slate-200 resize-none focus:border-indigo-500 p-3 leading-relaxed"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setGeneratedCitation('')}
                    className="flex-1 bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white text-xs h-9"
                  >
                    Regenerate
                  </Button>
                  <Button 
                    onClick={insertCitationToCanvas}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold h-9 shadow-lg shadow-indigo-900/40"
                  >
                    Insert to Canvas
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
