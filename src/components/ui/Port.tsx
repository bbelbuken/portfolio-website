import { useRef } from 'react'
import { motion } from 'framer-motion'
import type { Port as PortType } from '@/types'
import { useWireDrawing } from '@/hooks/useWireDrawing'

interface PortProps {
  port: PortType
}

export function Port({ port }: PortProps) {
  const portRef = useRef<HTMLDivElement>(null)
  const { onPortPointerDown } = useWireDrawing()

  const isOutput = port.type === 'output'

  return (
    <div className="flex items-center">
      {/* Input ports only show their label (outputs never show text) */}
      {!isOutput && port.label && (
        <span
          className="text-[9px] uppercase tracking-widest mr-1.5"
          style={{ color: 'var(--text-secondary)' }}
        >
          {port.label}
        </span>
      )}

      <motion.div
        ref={portRef}
        data-port={port.id}
        data-port-type={port.type}
        data-port-node-id={port.nodeId}
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{
          background: 'var(--port-bg)',
          border: '2px solid var(--port-border)',
          cursor: isOutput ? 'crosshair' : 'default',
        }}
        whileHover={{ scale: 1.2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
        onPointerDown={
          isOutput
            ? (e) => onPortPointerDown(e, port, portRef.current!)
            : undefined
        }
        onPointerEnter={(e) => {
          const el = e.currentTarget as HTMLElement
          el.style.background = 'var(--accent)'
          el.style.borderColor = 'var(--accent)'
          el.style.cursor = 'crosshair'
        }}
        onPointerLeave={(e) => {
          const el = e.currentTarget as HTMLElement
          el.style.background = 'var(--port-bg)'
          el.style.borderColor = 'var(--port-border)'
          el.style.cursor = isOutput ? 'crosshair' : 'default'
        }}
      />
    </div>
  )
}
