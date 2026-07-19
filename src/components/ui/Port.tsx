import { useRef } from 'react'
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
    <div
      className={`flex items-center gap-1.5 ${isOutput ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {port.label && (
        <span
          className="text-[9px] uppercase tracking-widest"
          style={{ color: 'var(--text-secondary)' }}
        >
          {port.label}
        </span>
      )}
      <div
        ref={portRef}
        data-port={port.id}
        data-port-type={port.type}
        data-port-node-id={port.nodeId}
        className="w-3 h-3 rounded-full border flex-shrink-0 transition-colors"
        style={{
          background: 'var(--port-bg)',
          borderColor: 'var(--port-border)',
          borderWidth: '2px',
          cursor: isOutput ? 'crosshair' : 'default',
          boxShadow: isOutput ? '0 0 0 0 var(--accent)' : 'none',
        }}
        onPointerDown={
          isOutput
            ? (e) => onPortPointerDown(e, port, portRef.current!)
            : undefined
        }
        onPointerEnter={(e) => {
          if (isOutput) {
            ;(e.currentTarget as HTMLElement).style.background = 'var(--accent)'
          } else {
            ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'
          }
        }}
        onPointerLeave={(e) => {
          ;(e.currentTarget as HTMLElement).style.background = 'var(--port-bg)'
          ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--port-border)'
        }}
      />
    </div>
  )
}
