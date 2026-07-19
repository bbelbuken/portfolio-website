import { useRef } from 'react'
import { motion } from 'framer-motion'
import type { NodeData } from '@/types'
import { Port } from '@/components/ui/Port'
import { useNodeDrag } from '@/hooks/useNodeDrag'

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

  const inputPorts = node.ports.filter((p) => p.type === 'input')

  return (
    <motion.div
      ref={nodeRef}
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.6, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      data-node={node.id}
      className="absolute flex items-center gap-2 px-3 py-1.5 cursor-move"
      style={{
        left: node.x,
        top: node.y,
        background: 'var(--window-bg)',
        border: '2px solid var(--window-border)',
        boxShadow: 'var(--window-shadow)',
        fontFamily: '"Fira Code", Consolas, monospace',
        userSelect: 'none',
        zIndex: 5,
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
