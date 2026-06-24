'use client'

import * as React from 'react'
import * as fabric from 'fabric'
import { useCanvasStore } from '@/lib/canvas-store'
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
  Triangle,
  Minus,
  Variable,
  LayoutGrid,
} from 'lucide-react'

function getObjectIcon(type?: string) {
  switch (type) {
    case 'FabricText': case 'Text': case 'i-text': case 'textbox':
      return <Type className="h-3.5 w-3.5 shrink-0" />
    case 'Rect':
      return <Square className="h-3.5 w-3.5 shrink-0" />
    case 'Circle': case 'Ellipse':
      return <CircleIcon className="h-3.5 w-3.5 shrink-0" />
    case 'FabricImage': case 'Image':
      return <ImageIcon className="h-3.5 w-3.5 shrink-0" />
    case 'Group': case 'ActiveSelection':
      return <Group className="h-3.5 w-3.5 shrink-0" />
    default:
      return <Square className="h-3.5 w-3.5 shrink-0" />
  }
}

function getObjectLabel(obj: fabric.Object, index: number) {
  const type = obj.type
  if (type === 'FabricText' || type === 'Text' || type === 'textbox' || type === 'i-text') {
    const text = (obj as any).text || ''
    return text.length > 20 ? text.slice(0, 20) + '...' : text || `Text ${index + 1}`
  }
  if (type === 'FabricImage' || type === 'Image') return `Image ${index + 1}`
  if (type === 'Rect') return `Rectangle ${index + 1}`
  if (type === 'Circle') return `Circle ${index + 1}`
  if (type === 'Group') {
    if ((obj as any).isQRCode) return `QR Code ${index + 1}`
    return `Group ${index + 1}`
  }
  return `Object ${index + 1}`
}

const VARIABLE_CHIPS = [
  { label: '{{recipient_name}}', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
  { label: '{{achievement}}',    color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { label: '{{grade}}',          color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  { label: '{{issued_date}}',    color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  { label: '{{citation_text}}',  color: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
  { label: '{{issuer_name}}',    color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
]

export function BuilderLayersPanel() {
  const { canvas, selectedElement, setSelectedElement, pushHistory } = useCanvasStore()
  const [objects, setObjects] = React.useState<fabric.Object[]>([])
  const [activeTab, setActiveTab] = React.useState<'layers' | 'elements' | 'variables'>('layers')

  const refreshObjects = React.useCallback(() => {
    if (!canvas) return
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
    pushHistory(JSON.stringify((canvas as any).toJSON(['isQRCode'])))
  }

  const moveUp = (obj: fabric.Object, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!canvas) return
    canvas.setActiveObject(obj)
    canvas.bringObjectForward(obj)
    canvas.requestRenderAll()
    refreshObjects()
    pushHistory(JSON.stringify((canvas as any).toJSON(['isQRCode'])))
  }

  const moveDown = (obj: fabric.Object, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!canvas) return
    canvas.setActiveObject(obj)
    canvas.sendObjectBackwards(obj)
    canvas.requestRenderAll()
    refreshObjects()
    pushHistory(JSON.stringify((canvas as any).toJSON(['isQRCode'])))
  }

  const addShape = (shape: 'rect' | 'circle' | 'triangle' | 'line') => {
    if (!canvas) return
    let obj: fabric.Object
    const base = { left: 421, top: 297, originX: 'center' as const, originY: 'center' as const }
    if (shape === 'rect') {
      obj = new fabric.Rect({ ...base, width: 120, height: 80, fill: '#6366f1', stroke: 'transparent', strokeWidth: 0, rx: 6, ry: 6 })
    } else if (shape === 'circle') {
      obj = new fabric.Circle({ ...base, radius: 50, fill: '#10b981', stroke: 'transparent', strokeWidth: 0 })
    } else if (shape === 'triangle') {
      obj = new fabric.Triangle({ ...base, width: 100, height: 90, fill: '#f59e0b', stroke: 'transparent', strokeWidth: 0 })
    } else {
      obj = new fabric.Line([0, 0, 200, 0], { ...base, stroke: '#94a3b8', strokeWidth: 2 })
    }
    canvas.add(obj)
    canvas.setActiveObject(obj)
    canvas.requestRenderAll()
    pushHistory(JSON.stringify((canvas as any).toJSON(['isQRCode'])))
  }

  const addVariableText = (variable: string) => {
    if (!canvas) return
    const textObj = new fabric.Textbox(variable, {
      left: 421, top: 297, fontFamily: 'Inter', fontSize: 18,
      fill: '#1e293b', width: 280, textAlign: 'center',
      originX: 'center', originY: 'center',
    })
    canvas.add(textObj)
    canvas.setActiveObject(textObj)
    canvas.requestRenderAll()
    pushHistory(JSON.stringify((canvas as any).toJSON(['isQRCode'])))
  }

  const tabs = [
    { id: 'layers' as const,    icon: <Layers className="h-4 w-4" />,     label: 'Layers' },
    { id: 'elements' as const,  icon: <LayoutGrid className="h-4 w-4" />,  label: 'Elements' },
    { id: 'variables' as const, icon: <Variable className="h-4 w-4" />,    label: 'Variables' },
  ]

  return (
    <div className="w-[220px] border-r border-slate-800 bg-[#1e293b] flex flex-col shrink-0 overflow-hidden">

      {/* Tab Bar */}
      <div className="flex border-b border-slate-800 shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            title={tab.label}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold uppercase tracking-wider transition-colors',
              activeTab === tab.id
                ? 'text-indigo-400 border-b-2 border-indigo-500 bg-slate-900/40'
                : 'text-slate-500 hover:text-slate-300'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Layers Tab */}
      {activeTab === 'layers' && (
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-800/60">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Layers</span>
            <span className="ml-auto text-[10px] text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded font-mono">
              {objects.length}
            </span>
          </div>
          {objects.length === 0 ? (
            <p className="text-xs text-slate-600 text-center py-10 px-4 leading-relaxed">
              No elements yet. Add shapes or text from the Elements tab.
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
                      'group flex items-center gap-2 px-3 py-2 cursor-pointer text-xs transition-all',
                      isActive
                        ? 'bg-indigo-600/20 text-indigo-300 border-l-2 border-indigo-500'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border-l-2 border-transparent'
                    )}
                  >
                    <span className={cn('shrink-0', isActive ? 'text-indigo-400' : 'text-slate-600')}>
                      {getObjectIcon(obj.type)}
                    </span>
                    <span className="flex-1 truncate font-medium">
                      {getObjectLabel(obj, objects.length - 1 - index)}
                    </span>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => moveUp(obj, e)} className="p-0.5 rounded hover:bg-slate-700 text-slate-500 hover:text-slate-200" title="Move up">
                        <ChevronUp className="h-3 w-3" />
                      </button>
                      <button onClick={(e) => moveDown(obj, e)} className="p-0.5 rounded hover:bg-slate-700 text-slate-500 hover:text-slate-200" title="Move down">
                        <ChevronDown className="h-3 w-3" />
                      </button>
                      <button onClick={(e) => deleteObject(obj, e)} className="p-0.5 rounded hover:bg-red-900/40 text-slate-500 hover:text-red-400" title="Delete">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}

      {/* Elements Tab */}
      {activeTab === 'elements' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Shapes</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Rectangle', icon: <Square className="h-5 w-5" />,      action: () => addShape('rect') },
                { label: 'Circle',    icon: <CircleIcon className="h-5 w-5" />,  action: () => addShape('circle') },
                { label: 'Triangle',  icon: <Triangle className="h-5 w-5" />,    action: () => addShape('triangle') },
                { label: 'Line',      icon: <Minus className="h-5 w-5" />,       action: () => addShape('line') },
              ].map(({ label, icon, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 hover:border-indigo-500/40 text-slate-400 hover:text-slate-200 transition-all group"
                >
                  <span className="group-hover:text-indigo-400 transition-colors">{icon}</span>
                  <span className="text-[10px] font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Text</p>
            <button
              onClick={() => {
                if (!canvas) return
                const t = new fabric.Textbox('Double click to edit', {
                  left: 421, top: 297, fontFamily: 'Inter', fontSize: 24,
                  fill: '#1e293b', width: 280, textAlign: 'center',
                  originX: 'center', originY: 'center',
                })
                canvas.add(t); canvas.setActiveObject(t); canvas.requestRenderAll()
                pushHistory(JSON.stringify((canvas as any).toJSON(['isQRCode'])))
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 hover:border-indigo-500/40 text-slate-400 hover:text-slate-200 transition-all"
            >
              <Type className="h-4 w-4" />
              <span className="text-xs font-medium">Add Text Block</span>
            </button>
          </div>
        </div>
      )}

      {/* Variables Tab */}
      {activeTab === 'variables' && (
        <div className="flex-1 overflow-y-auto p-3">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Dynamic Variables</p>
          <p className="text-[10px] text-slate-600 mb-4">Click to inject onto canvas</p>
          <div className="flex flex-col gap-2">
            {VARIABLE_CHIPS.map(({ label, color }) => (
              <button
                key={label}
                onClick={() => addVariableText(label)}
                className={cn(
                  'w-full text-left px-3 py-2.5 rounded-lg border font-mono text-xs font-bold transition-all hover:scale-[1.02] hover:shadow-lg',
                  color
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
