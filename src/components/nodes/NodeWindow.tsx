import { useRef, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { NodeData } from '@/types'
import { Port } from '@/components/ui/Port'
import { RetroWindow } from '@/components/ui/RetroWindow'
import { useNodeDrag } from '@/hooks/useNodeDrag'
import { useGraphStore } from '@/stores/graphStore'
import { nodeZIndex } from '@/lib/layers'

interface NodeWindowProps {
  node: NodeData
  children: ReactNode
  width?: number
  minWidth?: number
}

/**
 * Expanded state: a full retro window with content.
 * Shows when node.state === 'connected' or node.alwaysExpanded.
 */
export function NodeWindow({ node, children, width = 300, minWidth = 220 }: NodeWindowProps) {
  const nodeRef = useRef<HTMLDivElement>(null)
  const bind = useNodeDrag(node.id, nodeRef as React.RefObject<HTMLDivElement | null>)
  const closeNode = useGraphStore((s) => s.closeNode)
  const bringToFront = useGraphStore((s) => s.bringToFront)
  const zOrder = useGraphStore((s) => s.zOrder)

  const outputPorts = node.ports.filter((p) => p.type === 'output')
  const inputPorts = node.ports.filter((p) => p.type === 'input')

  function handleClose() {
    closeNode(node.id)
  }

  return (
    <motion.div
      ref={nodeRef}
      layout
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.7, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      data-node={node.id}
      onPointerDown={() => bringToFront(node.id)}
      className="absolute"
      style={{
        left: node.x,
        top: node.y,
        width,
        minWidth,
        zIndex: nodeZIndex(zOrder, node.id),
        userSelect: 'none',
        cursor: 'default',
      }}
    >
      {/* Input ports — circle centered on the left border */}
      {inputPorts.length > 0 && (
        <div
          className="absolute flex flex-col gap-3"
          style={{ left: -6, top: 44 }}
        >
          {inputPorts.map((port) => (
            <Port key={port.id} port={port} />
          ))}
        </div>
      )}

      <RetroWindow
        title={node.label}
        onClose={!node.alwaysExpanded ? handleClose : undefined}
      >
        {/* Draggable title bar — stops short of the close button */}
        <div
          className="absolute top-0 h-7 cursor-move"
          style={{ left: 0, right: 34 }}
          {...(bind() as object)}
        />

        <div className="p-3">{children}</div>

        {/* Output ports — circle centered on the right border */}
        {outputPorts.length > 0 && (
          <div
            className="absolute flex flex-col gap-3"
            style={{ right: -6, top: 44 }}
          >
            {outputPorts.map((port) => (
              <Port key={port.id} port={port} />
            ))}
          </div>
        )}
      </RetroWindow>
    </motion.div>
  )
}
