import { ref, type Ref } from 'vue'
import type { Point } from './types'

export interface UseInputManagerReturn {
  mousePosition: Ref<Point | null>
  isMouseOverCanvas: Ref<boolean>
  handleMouseMove: (
    event: MouseEvent,
    canvasRef: Ref<HTMLCanvasElement | undefined>,
  ) => void
  handleMouseEnter: () => void
  handleMouseLeave: () => void
}

export function useInputManager(): UseInputManagerReturn {
  const mousePosition = ref<Point | null>(null)
  const isMouseOverCanvas = ref(false)

  const handleMouseMove = (
    event: MouseEvent,
    canvasRef: Ref<HTMLCanvasElement | undefined>,
  ) => {
    if (!canvasRef.value) return

    const rect = canvasRef.value.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    const x = (event.clientX - rect.left) * (canvasRef.value.width / rect.width / dpr)
    const y = (event.clientY - rect.top) * (canvasRef.value.height / rect.height / dpr)

    mousePosition.value = { x, y }
  }

  const handleMouseEnter = () => {
    isMouseOverCanvas.value = true
  }

  const handleMouseLeave = () => {
    isMouseOverCanvas.value = false
    mousePosition.value = null
  }

  return {
    mousePosition,
    isMouseOverCanvas,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
  }
}
