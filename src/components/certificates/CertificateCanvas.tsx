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

    // Track whether this effect's cleanup ran before async init finished
    let disposed = false

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 842,
      height: 595,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
      selection: true,
    })

    const initCanvas = async () => {
      if (initialData) {
        try {
          const parsed = JSON.parse(initialData)
          await canvas.loadFromJSON(parsed)
          // Guard: if cleanup ran while we were awaiting, stop here
          if (disposed) return
          canvas.renderAll()
        } catch (e) {
          console.error('Failed to load initial data', e)
        }
      }
      if (disposed) return
      pushHistory(JSON.stringify(canvas.toJSON()))
      isInitializingRef.current = false
    }

    // Set canvas in store first so toolbar/panels can reference it
    setCanvas(canvas)
    initCanvas()

    // ── Selection Events ─────────────────────────────────────────────────────
    canvas.on('selection:created', () => setSelectedElement(canvas.getActiveObject() || null))
    canvas.on('selection:updated', () => setSelectedElement(canvas.getActiveObject() || null))
    canvas.on('selection:cleared', () => setSelectedElement(null))

    // ── History (debounced 300ms) ─────────────────────────────────────────────
    let debounceTimer: ReturnType<typeof setTimeout>
    const saveHistory = () => {
      if (isInitializingRef.current) return
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        pushHistory(JSON.stringify(canvas.toJSON()))
      }, 300)
    }

    canvas.on('object:modified', saveHistory)
    canvas.on('object:added', saveHistory)
    canvas.on('object:removed', saveHistory)
    // Also save when text editing finishes
    canvas.on('text:editing:exited', saveHistory)

    // ── Zoom (mouse wheel) ───────────────────────────────────────────────────
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

    // ── Pan (Space + drag) ───────────────────────────────────────────────────
    let isDragging = false
    let lastPosX = 0
    let lastPosY = 0
    let isSpaceDown = false

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore events fired from regular HTML inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      // Ignore Delete/Backspace when a Fabric text object is being edited inline
      const active = canvas.getActiveObject() as any
      const isEditingText = active && active.isEditing === true

      if (e.code === 'Space' && !isEditingText) {
        e.preventDefault()
        isSpaceDown = true
        canvas.defaultCursor = 'grab'
      } else if ((e.code === 'Backspace' || e.code === 'Delete') && !isEditingText) {
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
      disposed = true
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      clearTimeout(debounceTimer)
      canvas.dispose()
      setCanvas(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData])

  // Sync zoom from external store changes (toolbar zoom buttons / fit)
  React.useEffect(() => {
    const canvas = useCanvasStore.getState().canvas
    if (canvas && canvas.getZoom() !== zoom) {
      canvas.zoomToPoint({ x: canvas.width! / 2, y: canvas.height! / 2 }, zoom)
    }
  }, [zoom])

  return (
    <div
      ref={wrapperRef}
      className="w-full h-full flex flex-col items-center justify-center overflow-hidden"
      style={{
        backgroundImage:
          'linear-gradient(45deg, #27272a 25%, transparent 25%), linear-gradient(-45deg, #27272a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #27272a 75%), linear-gradient(-45deg, transparent 75%, #27272a 75%)',
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
        backgroundColor: '#18181b',
      }}
    >
      <div className="shadow-2xl ring-1 ring-white/10 bg-white">
        {/* No pointer-events CSS is applied here — Fabric manages its own event handling */}
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}
