'use client'

import * as React from 'react'
import * as fabric from 'fabric'
import { useCanvasStore } from '@/lib/canvas-store'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Paintbrush,
  Move,
} from 'lucide-react'
import { cn } from '@/lib/utils'

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{children}</h4>
      <div className="flex-1 h-px bg-slate-800" />
    </div>
  )
}

export function BuilderPropertiesPanel() {
  const { canvas, selectedElement, pushHistory } = useCanvasStore()
  const [, setTick] = React.useState(0)

  React.useEffect(() => {
    if (!canvas) return
    const update = () => setTick(t => t + 1)
    canvas.on('object:modified', update)
    canvas.on('selection:updated', update)
    canvas.on('selection:created', update)
    return () => {
      canvas.off('object:modified', update)
      canvas.off('selection:updated', update)
      canvas.off('selection:created', update)
    }
  }, [canvas])

  const updateProp = (key: string, value: any) => {
    if (!canvas || !selectedElement) return
    selectedElement.set(key as any, value)
    canvas.requestRenderAll()
    setTimeout(() => {
      pushHistory(JSON.stringify((canvas as any).toJSON(['isQRCode'])))
    }, 50)
  }

  // -- Empty state (Canvas properties) ------------------------------------
  if (!selectedElement) {
    return (
      <div className="w-[260px] border-l border-slate-800 bg-[#1e293b] flex flex-col shrink-0 overflow-y-auto">
        <div className="px-4 py-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Paintbrush className="h-3.5 w-3.5 text-slate-500" />
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Properties</h3>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <SectionHeader>Canvas</SectionHeader>
          <div className="space-y-2">
            <Label className="text-[11px] text-slate-500">Background Color</Label>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg border border-slate-700 cursor-pointer shadow-inner overflow-hidden flex-shrink-0"
                style={{ backgroundColor: canvas?.backgroundColor?.toString() || '#ffffff' }}
              >
                <input
                  type="color"
                  value={canvas?.backgroundColor?.toString() || '#ffffff'}
                  onChange={(e) => {
                    if (!canvas) return
                    canvas.backgroundColor = e.target.value
                    canvas.requestRenderAll()
                  }}
                  onBlur={() => {
                    if (!canvas) return
                    pushHistory(JSON.stringify((canvas as any).toJSON(['isQRCode'])))
                  }}
                  className="opacity-0 w-full h-full cursor-pointer"
                />
              </div>
              <span className="text-xs font-mono text-slate-400">
                {canvas?.backgroundColor?.toString() || '#ffffff'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1" />
        <p className="text-[11px] text-slate-600 text-center pb-6 px-4 leading-relaxed">
          Select an element on the canvas to edit its properties.
        </p>
      </div>
    )
  }

  const type = selectedElement.type?.toLowerCase() || ''
  const displayType = selectedElement.type
  const isText = type === 'fabrictext' || type === 'text' || type === 'i-text' || type === 'textbox'
  const isShape = type === 'rect' || type === 'circle' || type === 'ellipse' || type === 'triangle'

  return (
    <div className="w-[260px] border-l border-slate-800 bg-[#1e293b] flex flex-col shrink-0 overflow-y-auto">

      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paintbrush className="h-3.5 w-3.5 text-slate-500" />
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Properties</h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
          {displayType}
        </span>
      </div>

      <div className="p-4 space-y-5 flex-1">

        {/* -- Typography (Text only) ---------------------------------- */}
        {isText && (
          <div className="space-y-3">
            <SectionHeader>Typography</SectionHeader>

            <div className="space-y-1.5">
              <Label className="text-[11px] text-slate-500">Text Content</Label>
              <Textarea
                value={(selectedElement as any).text || ''}
                onChange={(e) => updateProp('text', e.target.value)}
                className="text-xs min-h-[60px] bg-slate-900/60 border-slate-700 text-slate-200 placeholder:text-slate-600 resize-none focus:border-indigo-500 focus:ring-indigo-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] text-slate-500">Font Family</Label>
              <Select
                value={(selectedElement as any).fontFamily || 'Inter'}
                onValueChange={(v) => updateProp('fontFamily', v)}
              >
                <SelectTrigger className="bg-slate-900/60 border-slate-700 text-slate-200 text-xs h-8 focus:ring-indigo-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1e293b] border-slate-700 text-slate-300">
                  {['Inter', 'Georgia', 'Times New Roman', 'Arial', 'Courier New', 'Playfair Display'].map(f => (
                    <SelectItem key={f} value={f} className="text-xs hover:bg-slate-800">{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-[11px] text-slate-500">Size</Label>
                <Input
                  type="number"
                  value={(selectedElement as any).fontSize || 16}
                  onChange={(e) => updateProp('fontSize', Number(e.target.value))}
                  className="h-8 text-xs bg-slate-900/60 border-slate-700 text-slate-200 focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] text-slate-500">Color</Label>
                <div className="h-8 w-full rounded-md border border-slate-700 overflow-hidden">
                  <input
                    type="color"
                    value={(selectedElement as any).fill || '#000000'}
                    onChange={(e) => updateProp('fill', e.target.value)}
                    className="w-full h-full cursor-pointer border-0 bg-transparent p-0.5"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] text-slate-500">Style</Label>
              <div className="flex gap-1">
                {[
                  { icon: <Bold className="h-3.5 w-3.5" />, prop: 'fontWeight', active: (selectedElement as any).fontWeight === 'bold', value: [(selectedElement as any).fontWeight === 'bold' ? 'normal' : 'bold'] },
                  { icon: <Italic className="h-3.5 w-3.5" />, prop: 'fontStyle', active: (selectedElement as any).fontStyle === 'italic', value: [(selectedElement as any).fontStyle === 'italic' ? 'normal' : 'italic'] },
                  { icon: <Underline className="h-3.5 w-3.5" />, prop: 'underline', active: !!(selectedElement as any).underline, value: [!(selectedElement as any).underline] },
                ].map(({ icon, prop, active, value }) => (
                  <button
                    key={prop}
                    onClick={() => updateProp(prop, value[0])}
                    className={cn(
                      'flex-1 py-1.5 rounded-md border text-xs transition-all',
                      active
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                    )}
                  >
                    <span className="flex justify-center">{icon}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] text-slate-500">Alignment</Label>
              <div className="flex gap-1">
                {[
                  { icon: <AlignLeft className="h-3.5 w-3.5" />, value: 'left' },
                  { icon: <AlignCenter className="h-3.5 w-3.5" />, value: 'center' },
                  { icon: <AlignRight className="h-3.5 w-3.5" />, value: 'right' },
                ].map(({ icon, value }) => (
                  <button
                    key={value}
                    onClick={() => updateProp('textAlign', value)}
                    className={cn(
                      'flex-1 py-1.5 rounded-md border text-xs transition-all',
                      (selectedElement as any).textAlign === value
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                    )}
                  >
                    <span className="flex justify-center">{icon}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* -- Fill & Stroke (Shapes) ---------------------------------- */}
        {isShape && (
          <div className="space-y-3">
            <SectionHeader>Appearance</SectionHeader>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-[11px] text-slate-500">Fill</Label>
                <div className="h-8 w-full rounded-md border border-slate-700 overflow-hidden">
                  <input type="color" value={(selectedElement as any).fill || '#000000'} onChange={(e) => updateProp('fill', e.target.value)} className="w-full h-full cursor-pointer border-0 p-0.5" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] text-slate-500">Stroke</Label>
                <div className="h-8 w-full rounded-md border border-slate-700 overflow-hidden">
                  <input type="color" value={(selectedElement as any).stroke || '#000000'} onChange={(e) => updateProp('stroke', e.target.value)} className="w-full h-full cursor-pointer border-0 p-0.5" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label className="text-[11px] text-slate-500">Stroke Width</Label>
                <span className="text-[11px] font-mono text-slate-400">{(selectedElement as any).strokeWidth || 0}px</span>
              </div>
              <Slider min={0} max={20} step={1} value={[(selectedElement as any).strokeWidth || 0]} onValueChange={([val]) => updateProp('strokeWidth', val)} className="[&_[role=slider]]:bg-indigo-500 [&_[role=slider]]:border-indigo-400" />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label className="text-[11px] text-slate-500">Opacity</Label>
                <span className="text-[11px] font-mono text-slate-400">{Math.round(((selectedElement as any).opacity ?? 1) * 100)}%</span>
              </div>
              <Slider min={0} max={1} step={0.01} value={[(selectedElement as any).opacity ?? 1]} onValueChange={([val]) => updateProp('opacity', val)} className="[&_[role=slider]]:bg-indigo-500 [&_[role=slider]]:border-indigo-400" />
            </div>

            {type === 'rect' && (
              <div className="space-y-1.5">
                <Label className="text-[11px] text-slate-500">Corner Radius</Label>
                <Input type="number" value={(selectedElement as any).rx || 0} onChange={(e) => { const val = Number(e.target.value); updateProp('rx', val); updateProp('ry', val) }} className="h-8 text-xs bg-slate-900/60 border-slate-700 text-slate-200 focus:border-indigo-500" />
              </div>
            )}
          </div>
        )}

        {/* -- Positioning -------------------------------------------- */}
        <div className="space-y-3">
          <SectionHeader>Position & Size</SectionHeader>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'X', value: Math.round((selectedElement as any).left ?? 0), key: 'left' },
              { label: 'Y', value: Math.round((selectedElement as any).top ?? 0), key: 'top' },
            ].map(({ label, value, key }) => (
              <div key={key} className="space-y-1.5">
                <Label className="text-[11px] text-slate-500">{label}</Label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-600 font-mono">{label}</span>
                  <Input
                    type="number"
                    value={value}
                    onChange={(e) => updateProp(key, Number(e.target.value))}
                    className="h-8 text-xs bg-slate-900/60 border-slate-700 text-slate-200 focus:border-indigo-500 pl-6"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* -- Layer Order -------------------------------------------- */}
        <div className="space-y-2">
          <SectionHeader>Layer Order</SectionHeader>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                if (!canvas || !selectedElement) return
                canvas.setActiveObject(selectedElement)
                canvas.sendObjectToBack(selectedElement)
                canvas.requestRenderAll()
                pushHistory(JSON.stringify((canvas as any).toJSON(['isQRCode'])))
              }}
              className="py-1.5 rounded-md bg-slate-900/60 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 text-xs font-medium transition-all"
            >
              Send to Back
            </button>
            <button
              onClick={() => {
                if (!canvas || !selectedElement) return
                canvas.setActiveObject(selectedElement)
                canvas.bringObjectToFront(selectedElement)
                canvas.requestRenderAll()
                pushHistory(JSON.stringify((canvas as any).toJSON(['isQRCode'])))
              }}
              className="py-1.5 rounded-md bg-slate-900/60 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 text-xs font-medium transition-all"
            >
              Bring to Front
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
