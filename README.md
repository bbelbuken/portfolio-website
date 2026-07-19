Act as a Senior Frontend Engineer and Performance Optimization Expert. We are building a highly responsive, 60fps portfolio website based on a 2D "TouchDesigner / Modular Synth" node-graph concept with a retro-desktop visual style.

Visual & UI Rules (Based on reference image):
- Background: Pastel mint/cyan color (#e6f4f1) with a sharp, repeating dot-grid pattern. (bg color should be selected from presets - please check example_design folder)
- Windows: White boxes, 2px solid black border, sharp retro box-shadow (4px 4px 0px 0px #000). Retro window headers with parallel horizontal lines and centered text (e.g., about.md, projects.code).(check example_design folder for window styles)
- Typography: Clean monospace fonts (e.g., Fira Code).(check example_design folder for typography styles)

Technical Stack & Performance Constraints:
1. State Management: Use 'zustand' to handle the infinite canvas pan/zoom and node connection states. Avoid global React state re-renders during mouse/touch drag events. (it should be implemented in a way that is efficient and scalable, its up to you to decide the best approach)
2. Animation & Expansion: Use 'framer-motion' for layout animations. When a cable connects to a node, the node should smoothly expand from a small socket/box into a full-sized retro window.
3. GPU-Accelerated Wires: Render patch cables using a single overlay SVG with Cubic Bezier curves. Apply 'will-change: transform' to ensure drag animations run directly on the GPU without CPU lag. Must support both desktop mouse and mobile touch events seamlessly.
4. Lazy Media Loading: Do not render or fetch Spotify/YouTube iframes until their respective audio/video nodes transition into the 'isConnected: true' state.

Core Architecture:
- Core identity node (About Me) triggers the signal.
- Main branches: [/> CODE] and [🎛️ AUDIO].
- Code Sub-nodes: Projects, Experience, Contact (structured like a minimal file tree).
- Audio Sub-nodes: Ads/Fashion Videos, Albums, Remixes (structured with clean cards containing conditional media embeds).

Please generate the scalable Next.js/React boilerplate using Tailwind CSS, Zustand, and Framer Motion, focusing first on the optimized canvas drag and responsive SVG wire-drawing mechanism.# portfolio-website
