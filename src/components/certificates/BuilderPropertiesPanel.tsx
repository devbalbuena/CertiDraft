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
} from 'lucide-react'

export function BuilderPropertiesPanel() {
  const { canvas, selectedElement, pushHistory } = useCanvasStore()
  // Local state to force re-render when object modifies via canvas dragging
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

  if (!selectedElement) {
    return (
      <div className="w-[280px] border-l border-border bg-card p-6 flex flex-col shrink-0 gap-6 overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <h3 className="font-semibold text-sm">Canvas Document</h3>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Background Color</Label>
          <div className="flex items-center gap-3">
            <Input 
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
              className="p-1 h-9 w-full"
            />
          </div>
        </div>
        <div className="flex-1" />
        <p className="text-xs text-muted-foreground text-center">
          Select an element on the canvas to edit its properties.
        </p>
      </div>
    )
  }

  const updateProp = (key: string, value: any) => {
    if (!canvas || !selectedElement) return
    selectedElement.set(key as any, value)
    canvas.requestRenderAll()
    setTimeout(() => {
      pushHistory(JSON.stringify((canvas as any).toJSON(['isQRCode'])))
    }, 50)
  }

  const type = selectedElement.type?.toLowerCase() || ''
  const displayType = selectedElement.type

  // We define getters carefully for the active object
  const isText = type === 'fabrictext' || type === 'text' || type === 'i-text' || type === 'textbox'
  const isShape = type === 'rect' || type === 'circle' || type === 'ellipse' || type === 'triangle'

  return (
    <div className="w-[280px] border-l border-border bg-card p-4 flex flex-col gap-6 shrink-0 overflow-y-auto">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <h3 className="font-semibold text-sm">Properties</h3>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
          {displayType}
        </span>
      </div>

      {isText && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Text Content</Label>
            <Textarea 
              value={(selectedElement as any).text || ''}
              onChange={(e) => updateProp('text', e.target.value)}
              className="text-sm min-h-[80px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Font Family</Label>
            <Select 
              value={(selectedElement as any).fontFamily || 'Inter'}
              onValueChange={(v) => updateProp('fontFamily', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter">Inter</SelectItem>
                <SelectItem value="Georgia">Georgia</SelectItem>
                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Courier New">Courier New</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Font Size</Label>
              <Input 
                type="number" 
                value={(selectedElement as any).fontSize || 16}
                onChange={(e) => updateProp('fontSize', Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Color</Label>
              <Input 
                type="color" 
                value={(selectedElement as any).fill || '#000000'}
                onChange={(e) => updateProp('fill', e.target.value)}
                className="p-1 h-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Style</Label>
            <div className="flex items-center gap-1">
              <Button
                variant={(selectedElement as any).fontWeight === 'bold' ? 'default' : 'outline'}
                size="icon"
                className="h-8 w-8"
                onClick={() => updateProp('fontWeight', (selectedElement as any).fontWeight === 'bold' ? 'normal' : 'bold')}
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant={(selectedElement as any).fontStyle === 'italic' ? 'default' : 'outline'}
                size="icon"
                className="h-8 w-8"
                onClick={() => updateProp('fontStyle', (selectedElement as any).fontStyle === 'italic' ? 'normal' : 'italic')}
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant={(selectedElement as any).underline ? 'default' : 'outline'}
                size="icon"
                className="h-8 w-8"
                onClick={() => updateProp('underline', !(selectedElement as any).underline)}
              >
                <Underline className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Alignment</Label>
            <div className="flex items-center gap-1">
              <Button
                variant={(selectedElement as any).textAlign === 'left' ? 'default' : 'outline'}
                size="icon"
                className="h-8 w-8"
                onClick={() => updateProp('textAlign', 'left')}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                variant={(selectedElement as any).textAlign === 'center' ? 'default' : 'outline'}
                size="icon"
                className="h-8 w-8"
                onClick={() => updateProp('textAlign', 'center')}
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                variant={(selectedElement as any).textAlign === 'right' ? 'default' : 'outline'}
                size="icon"
                className="h-8 w-8"
                onClick={() => updateProp('textAlign', 'right')}
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {isShape && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Fill</Label>
              <Input 
                type="color" 
                value={(selectedElement as any).fill || '#000000'}
                onChange={(e) => updateProp('fill', e.target.value)}
                className="p-1 h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Stroke</Label>
              <Input 
                type="color" 
                value={(selectedElement as any).stroke || '#000000'}
                onChange={(e) => updateProp('stroke', e.target.value)}
                className="p-1 h-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Stroke Width: {(selectedElement as any).strokeWidth || 0}</Label>
            <Slider
              min={0}
              max={20}
              step={1}
              value={[(selectedElement as any).strokeWidth || 0]}
              onValueChange={([val]) => updateProp('strokeWidth', val)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Opacity: {Math.round(((selectedElement as any).opacity ?? 1) * 100)}%</Label>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={[(selectedElement as any).opacity ?? 1]}
              onValueChange={([val]) => updateProp('opacity', val)}
            />
          </div>

          {type === 'rect' && (
            <div className="space-y-1.5">
              <Label className="text-xs">Corner Radius (px)</Label>
              <Input 
                type="number" 
                value={(selectedElement as any).rx || 0}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  updateProp('rx', val)
                  updateProp('ry', val)
                }}
              />
            </div>
          )}
        </div>
      )}

      <div className="space-y-1.5 pt-4 border-t border-border mt-auto">
        <Label className="text-xs">Layer Order</Label>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs h-8"
            onClick={() => {
              if (!canvas || !selectedElement) return
              // In fabric v7 sendObjectToBack works on active object
              canvas.setActiveObject(selectedElement)
              canvas.sendObjectToBack(selectedElement)
              canvas.requestRenderAll()
              pushHistory(JSON.stringify((canvas as any).toJSON(['isQRCode'])))
            }}
          >
            Send to Back
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs h-8"
            onClick={() => {
              if (!canvas || !selectedElement) return
              // In fabric v7 bringObjectToFront works on active object
              canvas.setActiveObject(selectedElement)
              canvas.bringObjectToFront(selectedElement)
              canvas.requestRenderAll()
              pushHistory(JSON.stringify((canvas as any).toJSON(['isQRCode'])))
            }}
          >
            Bring to Front
          </Button>
        </div>
      </div>
    </div>
  )
}
