import { useRef } from 'react'
import { motion } from 'framer-motion'
import type { NodeData } from '@/types'
import { Port } from '@/components/ui/Port'
import { useNodeDrag } from '@/hooks/useNodeDrag'
import { useGraphStore } from '@/stores/graphStore'

interface NodeSocketProps {
  node: NodeData
}

/**
 * Collapsed state: a small labeled box with input port.
 * Shows when node.state === 'idle'.
 */
export function NodeSocket({ node }: NodeSocketProps) {
  const nodeRef = useRef<HTMLDivElement>(null)
  const bind = useNodeDrag(node.id, nodeRef as React.RefObject<HTMLDivElement | null>)
  const wireDropTarget = useGraphStore((s) => s.wireDropTarget)

  const inputPorts = node.ports.filter((p) => p.type === 'input')
  const isDropTarget = wireDropTarget === node.id

  return (
    <motion.div
      ref={nodeRef}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: isDropTarget ? 1.01 : 1, opacity: 1 }}
      exit={{ scale: 0.6, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      data-node={node.id}
      className="absolute flex items-center gap-2 px-3 py-1.5"
      style={{
        left: node.x,
        top: node.y,
        background: 'var(--window-bg)',
        border: `2px solid ${isDropTarget ? 'var(--wire-color)' : 'var(--window-border)'}`,
        boxShadow: isDropTarget
          ? 'var(--wire-glow), var(--window-shadow)'
          : 'var(--window-shadow)',
        fontFamily: '"Fira Code", Consolas, monospace',
        userSelect: 'none',
        zIndex: isDropTarget ? 10 : 5,
        cursor: 'default',
      }}
      {...(bind() as object)}
    >
      {inputPorts.map((port) => (
        <Port key={port.id} port={port} />
      ))}
      <span
        className="text-[11px] font-medium"
        style={{ color: 'var(--text-primary)' }}
      >
        {node.label}
      </span>
    </motion.div>
  )
}
