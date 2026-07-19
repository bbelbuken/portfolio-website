import { useRef, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { NodeData } from '@/types'
import { Port } from '@/components/ui/Port'
import { RetroWindow } from '@/components/ui/RetroWindow'
import { useNodeDrag } from '@/hooks/useNodeDrag'
import { useGraphStore } from '@/stores/graphStore'

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
  const removeWire = useGraphStore((s) => s.removeWire)
  const wires = useGraphStore((s) => s.wires)

  const outputPorts = node.ports.filter((p) => p.type === 'output')
  const inputPorts = node.ports.filter((p) => p.type === 'input')

  function handleClose() {
    // Remove all wires going TO this node, reverting it to idle
    const incoming = wires.filter((w) => w.toNodeId === node.id)
    incoming.forEach((w) => removeWire(w.id))
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
      className="absolute"
      style={{
        left: node.x,
        top: node.y,
        width,
        minWidth,
        zIndex: 5,
        userSelect: 'none',
      }}
    >
      {/* Input ports on the left edge */}
      {inputPorts.length > 0 && (
        <div
          className="absolute flex flex-col gap-2 items-end"
          style={{ left: -20, top: 40 }}
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
        {/* Draggable title bar */}
        <div
          className="absolute inset-x-0 top-0 h-7 cursor-move"
          {...(bind() as object)}
        />

        <div className="p-3">{children}</div>

        {/* Output ports on the right edge */}
        {outputPorts.length > 0 && (
          <div
            className="absolute flex flex-col gap-3 items-start"
            style={{ right: -20, top: 40 }}
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
