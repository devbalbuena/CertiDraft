'use client'

import * as React from 'react'
import * as fabric from 'fabric'
import { useCanvasStore } from '@/lib/canvas-store'

export function CertificateCanvas({ initialData }: { initialData?: string | null }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const isInitializingRef = React.useRef(true)
  
  const setCanvas = useCanvasStore((s) => s.setCanvas)
  const setSelectedElement = useCanvasStore((s) => s.setSelectedElement)
  const pushHistory = useCanvasStore((s) => s.pushHistory)
  const zoom = useCanvasStore((s) => s.zoom)
  
  React.useEffect(() => {
    if (!canvasRef.current || !wrapperRef.current) return

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 842,
      height: 595,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
    })

    const initCanvas = async () => {
      if (initialData) {
        try {
          await canvas.loadFromJSON(JSON.parse(initialData))
          canvas.renderAll()
        } catch (e) {
          console.error('Failed to load initial data', e)
        }
      }
      pushHistory(JSON.stringify(canvas.toJSON()))
      isInitializingRef.current = false
    }

    initCanvas()
    setCanvas(canvas)

    // ── Events ──────────────────────────────────────────────────────────────
    canvas.on('selection:created', () => setSelectedElement(canvas.getActiveObject() || null))
    canvas.on('selection:updated', () => setSelectedElement(canvas.getActiveObject() || null))
    canvas.on('selection:cleared', () => setSelectedElement(null))

    let debounceTimer: ReturnType<typeof setTimeout>
    const saveHistory = () => {
      // Don't record history while loading JSON to avoid corrupting undo stack
      if (isInitializingRef.current) return
      
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        pushHistory(JSON.stringify(canvas.toJSON()))
      }, 300)
    }

    canvas.on('object:modified', saveHistory)
    canvas.on('object:added', saveHistory)
    canvas.on('object:removed', saveHistory)

    // ── Zoom and Pan ────────────────────────────────────────────────────────
    canvas.on('mouse:wheel', function (opt) {
      const delta = opt.e.deltaY
      let newZoom = canvas.getZoom()
      newZoom *= 0.999 ** delta
      if (newZoom > 3) newZoom = 3
      if (newZoom < 0.5) newZoom = 0.5
      canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, newZoom)
      opt.e.preventDefault()
      opt.e.stopPropagation()
    })

    let isDragging = false
    let lastPosX = 0
    let lastPosY = 0
    let isSpaceDown = false

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      
      if (e.code === 'Space') {
        e.preventDefault()
        isSpaceDown = true
        canvas.defaultCursor = 'grab'
      } else if (e.code === 'Backspace' || e.code === 'Delete') {
        const activeObjects = canvas.getActiveObjects()
        if (activeObjects.length) {
          activeObjects.forEach((obj) => canvas.remove(obj))
          canvas.discardActiveObject()
          canvas.requestRenderAll()
        }
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isSpaceDown = false
        canvas.defaultCursor = 'default'
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    canvas.on('mouse:down', function (opt) {
      if (isSpaceDown) {
        isDragging = true
        canvas.selection = false
        lastPosX = opt.e.clientX
        lastPosY = opt.e.clientY
      }
    })

    canvas.on('mouse:move', function (opt) {
      if (isDragging) {
        const vpt = canvas.viewportTransform
        if (vpt) {
          vpt[4] += opt.e.clientX - lastPosX
          vpt[5] += opt.e.clientY - lastPosY
          canvas.requestRenderAll()
          lastPosX = opt.e.clientX
          lastPosY = opt.e.clientY
        }
      }
    })

    canvas.on('mouse:up', function () {
      if (isDragging) {
        const vpt = canvas.viewportTransform
        if (vpt) canvas.setViewportTransform(vpt)
        isDragging = false
        canvas.selection = true
      }
    })

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      clearTimeout(debounceTimer)
      canvas.dispose()
      setCanvas(null)
    }
  }, [initialData, setCanvas, setSelectedElement, pushHistory])

  // Sync zoom from external store actions (e.g. Fit button)
  React.useEffect(() => {
    const canvas = useCanvasStore.getState().canvas
    if (canvas && canvas.getZoom() !== zoom) {
      // Zoom from center
      canvas.zoomToPoint({ x: canvas.width! / 2, y: canvas.height! / 2 }, zoom)
    }
  }, [zoom])

  return (
    <div 
      ref={wrapperRef} 
      className="w-full h-full flex flex-col items-center justify-center overflow-hidden"
      style={{
        backgroundImage: 'linear-gradient(45deg, #27272a 25%, transparent 25%), linear-gradient(-45deg, #27272a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #27272a 75%), linear-gradient(-45deg, transparent 75%, #27272a 75%)',
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
        backgroundColor: '#18181b'
      }}
    >
      <div className="shadow-2xl ring-1 ring-white/10 bg-white">
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}
