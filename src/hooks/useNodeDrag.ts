import { useRef, useCallback } from 'react'
import { useGesture } from '@use-gesture/react'
import { useGraphStore } from '@/stores/graphStore'
import { useCanvasStore } from '@/stores/canvasStore'

export function useNodeDrag(
  nodeId: string,
  nodeRef: React.RefObject<HTMLDivElement | null>,
) {
  const setNodePosition = useGraphStore((s) => s.setNodePosition)
  const getNodeById = useGraphStore((s) => s.getNodeById)
  const canvasScale = useCanvasStore((s) => s.scale)

  const startX = useRef(0)
  const startY = useRef(0)

  const applyPos = useCallback(
    (x: number, y: number) => {
      if (!nodeRef.current) return
      nodeRef.current.style.left = `${x}px`
      nodeRef.current.style.top = `${y}px`
    },
    [nodeRef],
  )

  const bind = useGesture(
    {
      onDragStart: () => {
        const node = getNodeById(nodeId)
        if (!node) return
        startX.current = node.x
        startY.current = node.y
      },
      onDrag: ({ delta: [dx, dy] }) => {
        startX.current += dx / canvasScale
        startY.current += dy / canvasScale
        applyPos(startX.current, startY.current)
      },
      onDragEnd: () => {
        setNodePosition(nodeId, startX.current, startY.current)
      },
    },
    {
      drag: { filterTaps: true },
    },
  )

  return bind
}
