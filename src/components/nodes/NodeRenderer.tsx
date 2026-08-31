import { AnimatePresence } from 'framer-motion'
import type { NodeData } from '@/types'
import { visibleNodeIds } from '@/lib/graph'
import { AboutNode } from './AboutNode'
import { CodeBranchNode } from './CodeBranchNode'
import { AudioBranchNode } from './AudioBranchNode'
import { ProjectsNode } from './ProjectsNode'
import { ExperienceNode } from './ExperienceNode'
import { ContactNode } from './ContactNode'
import { AlbumsNode } from './AlbumsNode'
import { RemixesNode } from './RemixesNode'
import { AdsNode } from './AdsNode'

interface NodeRendererProps {
  nodes: NodeData[]
}

function renderNode(node: NodeData) {
  switch (node.type) {
    case 'about':
      return <AboutNode key={node.id} node={node} />
    case 'code-branch':
      return <CodeBranchNode key={node.id} node={node} />
    case 'audio-branch':
      return <AudioBranchNode key={node.id} node={node} />
    case 'projects':
      return <ProjectsNode key={node.id} node={node} />
    case 'experience':
      return <ExperienceNode key={node.id} node={node} />
    case 'contact':
      return <ContactNode key={node.id} node={node} />
    case 'albums':
      return <AlbumsNode key={node.id} node={node} />
    case 'remixes':
      return <RemixesNode key={node.id} node={node} />
    case 'ads':
      return <AdsNode key={node.id} node={node} />
    default:
      return null
  }
}

export function NodeRenderer({ nodes }: NodeRendererProps) {
  // Children stay off the canvas until their parent branch is connected
  const visible = visibleNodeIds(nodes)

  return (
    <AnimatePresence>
      {nodes.filter((node) => visible.has(node.id)).map((node) => renderNode(node))}
    </AnimatePresence>
  )
}
