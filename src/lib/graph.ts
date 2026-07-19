import type { NodeData, Wire } from '@/types'

export const INITIAL_NODES: NodeData[] = [
  {
    id: 'about',
    type: 'about',
    label: 'about.md',
    x: 160,
    y: 120,
    state: 'connected',
    alwaysExpanded: true,
    ports: [
      { id: 'about-out-code', nodeId: 'about', type: 'output', label: '> CODE' },
      { id: 'about-out-audio', nodeId: 'about', type: 'output', label: 'AUDIO' },
    ],
  },
  {
    id: 'code-branch',
    type: 'code-branch',
    label: 'code.branch',
    x: 520,
    y: 60,
    state: 'idle',
    ports: [
      { id: 'code-in', nodeId: 'code-branch', type: 'input' },
      { id: 'code-out-projects', nodeId: 'code-branch', type: 'output', label: 'projects' },
      { id: 'code-out-exp', nodeId: 'code-branch', type: 'output', label: 'experience' },
      { id: 'code-out-contact', nodeId: 'code-branch', type: 'output', label: 'contact' },
    ],
  },
  {
    id: 'audio-branch',
    type: 'audio-branch',
    label: 'audio.branch',
    x: 520,
    y: 320,
    state: 'idle',
    ports: [
      { id: 'audio-in', nodeId: 'audio-branch', type: 'input' },
      { id: 'audio-out-albums', nodeId: 'audio-branch', type: 'output', label: 'albums' },
      { id: 'audio-out-remixes', nodeId: 'audio-branch', type: 'output', label: 'remixes' },
      { id: 'audio-out-ads', nodeId: 'audio-branch', type: 'output', label: 'ads/video' },
    ],
  },
  {
    id: 'projects',
    type: 'projects',
    label: 'projects.code',
    x: 880,
    y: -40,
    state: 'idle',
    ports: [
      { id: 'projects-in', nodeId: 'projects', type: 'input' },
    ],
  },
  {
    id: 'experience',
    type: 'experience',
    label: 'experience.log',
    x: 880,
    y: 100,
    state: 'idle',
    ports: [
      { id: 'experience-in', nodeId: 'experience', type: 'input' },
    ],
  },
  {
    id: 'contact',
    type: 'contact',
    label: 'contact.sh',
    x: 880,
    y: 220,
    state: 'idle',
    ports: [
      { id: 'contact-in', nodeId: 'contact', type: 'input' },
    ],
  },
  {
    id: 'albums',
    type: 'albums',
    label: 'albums.wav',
    x: 880,
    y: 280,
    state: 'idle',
    ports: [
      { id: 'albums-in', nodeId: 'albums', type: 'input' },
    ],
  },
  {
    id: 'remixes',
    type: 'remixes',
    label: 'remixes.flac',
    x: 880,
    y: 400,
    state: 'idle',
    ports: [
      { id: 'remixes-in', nodeId: 'remixes', type: 'input' },
    ],
  },
  {
    id: 'ads',
    type: 'ads',
    label: 'ads.mp4',
    x: 880,
    y: 520,
    state: 'idle',
    ports: [
      { id: 'ads-in', nodeId: 'ads', type: 'input' },
    ],
  },
]

export const INITIAL_WIRES: Wire[] = []
