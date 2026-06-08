import { create } from 'zustand'
import * as fabric from 'fabric'

type ToolType = 'select' | 'text' | 'rect' | 'circle' | 'qr'

interface CanvasState {
  canvas: fabric.Canvas | null
  selectedElement: fabric.Object | null
  canvasHistory: string[]
  historyIndex: number
  zoom: number
  activeTool: ToolType

  setCanvas: (canvas: fabric.Canvas | null) => void
  setSelectedElement: (element: fabric.Object | null) => void
  pushHistory: (json: string) => void
  undo: () => void
  redo: () => void
  setZoom: (zoom: number) => void
  setActiveTool: (tool: ToolType) => void
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  canvas: null,
  selectedElement: null,
  canvasHistory: [],
  historyIndex: -1,
  zoom: 1,
  activeTool: 'select',

  setCanvas: (canvas) => set({ canvas }),
  setSelectedElement: (selectedElement) => set({ selectedElement }),
  
  pushHistory: (json) => {
    const { canvasHistory, historyIndex } = get()
    
    // Only push if different from current state to prevent duplicates
    if (historyIndex >= 0 && canvasHistory[historyIndex] === json) {
      return
    }

    // Truncate any forward history (if we've undone and are now making new changes)
    const newHistory = canvasHistory.slice(0, historyIndex + 1)
    newHistory.push(json)
    
    // Keep max 50 states to prevent massive memory usage
    if (newHistory.length > 50) {
      newHistory.shift()
    }
    
    set({
      canvasHistory: newHistory,
      historyIndex: newHistory.length - 1
    })
  },
  
  undo: async () => {
    const { canvas, canvasHistory, historyIndex } = get()
    if (!canvas || historyIndex <= 0) return
    
    const newIndex = historyIndex - 1
    const previousState = canvasHistory[newIndex]
    
    try {
      await canvas.loadFromJSON(JSON.parse(previousState))
      canvas.renderAll()
      set({ historyIndex: newIndex, selectedElement: canvas.getActiveObject() || null })
    } catch (e) {
      console.error('Undo failed:', e)
    }
  },
  
  redo: async () => {
    const { canvas, canvasHistory, historyIndex } = get()
    if (!canvas || historyIndex >= canvasHistory.length - 1) return
    
    const newIndex = historyIndex + 1
    const nextState = canvasHistory[newIndex]
    
    try {
      await canvas.loadFromJSON(JSON.parse(nextState))
      canvas.renderAll()
      set({ historyIndex: newIndex, selectedElement: canvas.getActiveObject() || null })
    } catch (e) {
      console.error('Redo failed:', e)
    }
  },
  
  setZoom: (zoom) => set({ zoom }),
  setActiveTool: (activeTool) => set({ activeTool })
}))
