import { useEffect } from 'react'
import { Canvas } from '@/components/canvas/Canvas'
import { NodeRenderer } from '@/components/nodes/NodeRenderer'
import { Taskbar } from '@/components/desktop/Taskbar'
import { useGraphStore } from '@/stores/graphStore'
import { useThemeStore } from '@/stores/themeStore'

export default function App() {
  const nodes = useGraphStore((s) => s.nodes)
  const initialize = useThemeStore((s) => s.initialize)

  // Apply initial theme on mount
  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <div className="w-full h-full flex flex-col" style={{ background: 'var(--bg)' }}>
      <Taskbar />

      <div className="flex-1 relative" style={{ paddingTop: 32 }}>
        <Canvas>
          <NodeRenderer nodes={nodes} />
        </Canvas>
      </div>
    </div>
  )
}
