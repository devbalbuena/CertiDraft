'use client'

import * as React from 'react'
import * as fabric from 'fabric'
import { useCanvasStore } from '@/lib/canvas-store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Type,
  Square,
  Circle as CircleIcon,
  Image as ImageIcon,
  Layers,
  Trash2,
  ChevronUp,
  ChevronDown,
  Group,
} from 'lucide-react'

function getObjectIcon(type?: string) {
  switch (type) {
    case 'FabricText':
    case 'Text':
    case 'i-text':
    case 'textbox':
      return <Type className="h-3.5 w-3.5 shrink-0" />
    case 'Rect':
      return <Square className="h-3.5 w-3.5 shrink-0" />
    case 'Circle':
    case 'Ellipse':
      return <CircleIcon className="h-3.5 w-3.5 shrink-0" />
    case 'FabricImage':
    case 'Image':
      return <ImageIcon className="h-3.5 w-3.5 shrink-0" />
    case 'Group':
    case 'ActiveSelection':
      return <Group className="h-3.5 w-3.5 shrink-0" />
    default:
      return <Square className="h-3.5 w-3.5 shrink-0" />
  }
}

function getObjectLabel(obj: fabric.Object, index: number) {
  const type = obj.type
  // @ts-ignore
  if (type === 'FabricText' || type === 'Text' || type === 'textbox' || type === 'i-text') {
    const text = (obj as any).text || ''
    return text.length > 20 ? text.slice(0, 20) + '…' : text || `Text ${index + 1}`
  }
  if (type === 'FabricImage' || type === 'Image') return `Image ${index + 1}`
  if (type === 'Rect') return `Rectangle ${index + 1}`
  if (type === 'Circle') return `Circle ${index + 1}`
  if (type === 'Group') {
    // @ts-ignore
    if ((obj as any).isQRCode) return `QR Code ${index + 1}`
    return `Group ${index + 1}`
  }
  return `Object ${index + 1}`
}

export function BuilderLayersPanel() {
  const { canvas, selectedElement, setSelectedElement, pushHistory } = useCanvasStore()
  const [objects, setObjects] = React.useState<fabric.Object[]>([])

  // Refresh objects list on every canvas mutation
  const refreshObjects = React.useCallback(() => {
    if (!canvas) return
    // Show layers in reverse (top-most first, like design tools)
    setObjects([...canvas.getObjects()].reverse())
  }, [canvas])

  React.useEffect(() => {
    if (!canvas) return
    refreshObjects()
    canvas.on('object:added', refreshObjects)
    canvas.on('object:removed', refreshObjects)
    canvas.on('object:modified', refreshObjects)
    canvas.on('selection:created', refreshObjects)
    canvas.on('selection:updated', refreshObjects)
    canvas.on('selection:cleared', refreshObjects)
    return () => {
      canvas.off('object:added', refreshObjects)
      canvas.off('object:removed', refreshObjects)
      canvas.off('object:modified', refreshObjects)
      canvas.off('selection:created', refreshObjects)
      canvas.off('selection:updated', refreshObjects)
      canvas.off('selection:cleared', refreshObjects)
    }
  }, [canvas, refreshObjects])

  const selectObject = (obj: fabric.Object) => {
    if (!canvas) return
    canvas.setActiveObject(obj)
    canvas.requestRenderAll()
    setSelectedElement(obj)
  }

  const deleteObject = (obj: fabric.Object, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!canvas) return
    canvas.remove(obj)
    canvas.discardActiveObject()
    setSelectedElement(null)
    canvas.requestRenderAll()
    pushHistory(JSON.stringify(canvas.toJSON(['isQRCode'])))
  }

  const moveUp = (obj: fabric.Object, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!canvas) return
    canvas.bringObjectForward(obj)
    canvas.requestRenderAll()
    refreshObjects()
    pushHistory(JSON.stringify(canvas.toJSON(['isQRCode'])))
  }

  const moveDown = (obj: fabric.Object, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!canvas) return
    canvas.sendObjectBackwards(obj)
    canvas.requestRenderAll()
    refreshObjects()
    pushHistory(JSON.stringify(canvas.toJSON(['isQRCode'])))
  }

  return (
    <div className="w-[200px] border-r border-border bg-card flex flex-col shrink-0 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-3 border-b border-border">
        <Layers className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Layers</h3>
        <span className="ml-auto text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
          {objects.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {objects.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8 px-3">
            No elements yet. Add some from the toolbar.
          </p>
        ) : (
          <ul className="py-1">
            {objects.map((obj, index) => {
              const isActive = selectedElement === obj
              return (
                <li
                  key={index}
                  onClick={() => selectObject(obj)}
                  className={cn(
                    'group flex items-center gap-1.5 px-2 py-1.5 cursor-pointer text-xs transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  )}
                >
                  <span className={cn('shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')}>
                    {getObjectIcon(obj.type)}
                  </span>
                  <span className="flex-1 truncate">
                    {getObjectLabel(obj, objects.length - 1 - index)}
                  </span>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => moveUp(obj, e)}
                      className="p-0.5 rounded hover:bg-muted-foreground/20"
                      title="Move up"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => moveDown(obj, e)}
                      className="p-0.5 rounded hover:bg-muted-foreground/20"
                      title="Move down"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => deleteObject(obj, e)}
                      className="p-0.5 rounded hover:bg-destructive/20 text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
