# Graph Report - C:/Users/bbelb/Desktop/Portfolio Website  (2026-08-31)

## Corpus Check
- Corpus is ~8,045 words - fits in a single context window. You may not need a graph.

## Summary
- 199 nodes · 365 edges · 11 communities
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Portfolio Content Nodes
- App TypeScript Config
- Runtime Dependencies
- App Shell and Desktop UI
- Theming System
- Build Tooling TS Config
- Dev and Build Dependencies
- Canvas Viewport and Dragging
- Ports Wires and Graph State

## God Nodes (most connected - your core abstractions)
1. `NodeData` - 28 edges
2. `compilerOptions` - 18 edges
3. `useGraphStore` - 15 edges
4. `compilerOptions` - 14 edges
5. `NodeWindow()` - 12 edges
6. `NodeSocket()` - 11 edges
7. `useNodeDrag()` - 7 edges
8. `useCanvasStore` - 7 edges
9. `Port` - 6 edges
10. `scripts` - 5 edges

## Surprising Connections (you probably didn't know these)
- `WireOverlay()` --calls--> `useGraphStore`  [EXTRACTED]
  src/components/canvas/WireOverlay.tsx → src/stores/graphStore.ts
- `AboutNodeProps` --references--> `NodeData`  [EXTRACTED]
  src/components/nodes/AboutNode.tsx → src/types/index.ts
- `AdsNodeProps` --references--> `NodeData`  [EXTRACTED]
  src/components/nodes/AdsNode.tsx → src/types/index.ts
- `AlbumsNodeProps` --references--> `NodeData`  [EXTRACTED]
  src/components/nodes/AlbumsNode.tsx → src/types/index.ts
- `AudioBranchNodeProps` --references--> `NodeData`  [EXTRACTED]
  src/components/nodes/AudioBranchNode.tsx → src/types/index.ts

## Import Cycles
- None detected.

## Communities (11 total, 0 thin omitted)

### Community 0 - "Portfolio Content Nodes"
Cohesion: 0.10
Nodes (34): AboutNode(), AboutNodeProps, AdsNode(), AdsNodeProps, VIDEOS, ALBUMS, AlbumsNode(), AlbumsNodeProps (+26 more)

### Community 1 - "App TypeScript Config"
Cohesion: 0.08
Nodes (23): DOM, DOM.Iterable, ES2020, src, compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules (+15 more)

### Community 2 - "Runtime Dependencies"
Cohesion: 0.10
Nodes (20): framer-motion, dependencies, framer-motion, react, react-dom, @use-gesture/react, zustand, name (+12 more)

### Community 3 - "App Shell and Desktop UI"
Cohesion: 0.15
Nodes (13): favicon.svg, Fira Code webfont, #root mount point, Portfolio (page title), App(), DesktopIcons(), ICONS, NAV_LINKS (+5 more)

### Community 4 - "Theming System"
Cohesion: 0.19
Nodes (15): ThemeControlProps, WALLPAPER_OPTIONS, RetroButton(), RetroButtonProps, ACCENT_COLORS, applyTheme(), THEMES, ThemeStore (+7 more)

### Community 5 - "Build Tooling TS Config"
Cohesion: 0.11
Nodes (17): ES2023, vite.config.ts, compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection (+9 more)

### Community 6 - "Dev and Build Dependencies"
Cohesion: 0.12
Nodes (17): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @types/react, @types/react-dom, typescript (+9 more)

### Community 7 - "Canvas Viewport and Dragging"
Cohesion: 0.21
Nodes (9): Canvas(), CanvasProps, CanvasGrid(), WireOverlay(), useCanvasGestures(), useNodeDrag(), cubicBezierPath(), CanvasStore (+1 more)

### Community 8 - "Ports Wires and Graph State"
Cohesion: 0.29
Nodes (9): Port(), PortProps, useWireDrawing(), INITIAL_NODES, INITIAL_WIRES, GraphStore, DraftWire, Port (+1 more)

## Knowledge Gaps
- **76 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+71 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `NodeData` connect `Portfolio Content Nodes` to `Ports Wires and Graph State`, `Theming System`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Why does `useGraphStore` connect `App Shell and Desktop UI` to `Portfolio Content Nodes`, `Ports Wires and Graph State`, `Canvas Viewport and Dragging`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Dev and Build Dependencies` to `Runtime Dependencies`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _76 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Portfolio Content Nodes` be split into smaller, more focused modules?**
  _Cohesion score 0.1036077705827937 - nodes in this community are weakly interconnected._
- **Should `App TypeScript Config` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `Runtime Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._