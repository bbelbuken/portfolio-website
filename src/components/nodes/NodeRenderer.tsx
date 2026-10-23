import { AnimatePresence } from 'framer-motion'
import type { NodeData } from '@/types'
import { visibleNodeIds } from '@/lib/graph'
import { AboutNode } from './AboutNode'
import { CodeBranchNode } from './CodeBranchNode'
import { AudioBranchNode } from './AudioBranchNode'
import { ProjectsNode } from './ProjectsNode'
import { ExperienceNode } from './ExperienceNode'
import { TracksNode } from './TracksNode'
import { VideoListNode } from './VideoListNode'
import { EducationNode } from './EducationNode'
import { StackNode } from './StackNode'

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
    case 'tracks':
      return <TracksNode key={node.id} node={node} />
    case 'ads':
      return <VideoListNode key={node.id} node={node} category="ads" />
    case 'fashion':
      return <VideoListNode key={node.id} node={node} category="fashion" />
    case 'documentary':
      return <VideoListNode key={node.id} node={node} category="documentary" />
    case 'education':
      return <EducationNode key={node.id} node={node} />
    case 'stack':
      return <StackNode key={node.id} node={node} />
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
