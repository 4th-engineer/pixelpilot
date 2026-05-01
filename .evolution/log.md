# pixelpilot - Project Self-Evolution Log

## History
| Date | Project | Changes Made | Impact |
|------|---------|--------------|--------|
| 2026-04-30 20:30 | pixelpilot | Add collapsible chat panel with toggle button for mobile (<768px) — chat panel hidden by default on mobile, slides in with 💬 button | Responsive/mobile UI support |
| 2026-05-01 00:30 | pixelpilot | Refresh server-info in status bar every 5 seconds via setInterval in viewer.js — previously only fetched once at init, now shows live client/event counts | Live server status in UI |
| 2026-05-01 04:30 | pixelpilot | Add SSE keep-alive ping every 30s — server sends `ping` events to all SSE clients to detect dead connections and clean them up faster | Improved WebSocket reliability |
| 2026-05-01 05:30 | pixelpilot | Move bubble position update from render() to update() — bubbles now track character position each frame instead of only on render, fixing cases where bubbles never positioned if character hadn't spawned yet | Fixed potential silent bubble rendering bug |
| 2026-04-30 19:30 | pixelpilot | renderer.js: render() and drawFloor() now use logical CSS pixel dimensions from engine.js instead of physical canvas pixels — fixes floor grid sizing on HiDPI/Retina displays | Consistent HiDPI rendering pipeline |
| 2026-04-30 18:30 | pixelpilot | Fix canvas clear on HiDPI — use logical CSS px instead of physical px | Correct canvas clearing on Retina/HiDPI displays |
| 2026-04-30 17:30 | pixelpilot | Fix name tag width measurement in character.js | Accurate name tag background sizing |
| 2026-04-30 16:30 | pixelpilot | Cap deltaTime to 100ms max in game loop | Prevents character teleportation when tab is backgrounded/resumed |
| 2026-05-01 07:30 | pixelpilot | Add per-type content colors in chat panel CSS — .content now has distinct text colors per message type (thinking=grey, tool=light blue, done=light green, system=italic dim), plus word-break: break-word for long paths | Improved chat panel readability |
| 2026-05-01 08:30 | pixelpilot | Add CSS bubble style for tool_done events (.bubble.tool_done { background: #d1fae5 }) — now bubbles match chat panel styling for tool completion events | Consistent bubble/chat visual for tool_done |
| 2026-05-01 09:30 | pixelpilot | Add .chat-message.request CSS — purple bg (#2d1f3d), highlight border, pink content text — request events now styled consistently with other event types | Consistent request event styling |
| 2026-05-01 10:30 | pixelpilot | Remove dead `.bubble.tool_done` CSS rule (never used — bubble.js maps to `done` type) and fix duplicate incomplete `.chat-message.request` rule | Clean CSS, no functional change |
| 2026-05-01 11:30 | pixelpilot | Remove remaining duplicate `.chat-message.request` CSS rule in viewer.css (was defined at lines 285-288 and 333-336) | Clean CSS, no functional change |
| 2026-05-01 06:30 | pixelpilot | Fix agent_type loss during server event normalization + fix character spawn for non-agent events — server parseEvent() now preserves agent_type separately; any event type (tool, thinking, etc.) can introduce an agent so characters always get correct type | Agent type now preserved end-to-end |
| 2026-05-01 12:30 | pixelpilot | Smart chat auto-scroll — only scroll to bottom if user is within 50px of bottom; stops invasive jumps when reviewing history | Improved UX when reviewing chat history |
| 2026-05-01 13:30 | pixelpilot | Fix spawn point names in map.js — had accidental leading space (' entrance' → 'entrance'), name field was unused so no functional impact | Clean data |
| 2026-05-01 15:30 | pixelpilot | Fix idleTimer initialization in Character constructor — was lazily initialized only when accessed, now explicitly initialized to 0 for clean code and consistent behavior | Clean code, consistent idle animation init |
| 2026-05-01 16:30 | pixelpilot | Fix thinking indicator text positioning — vertically centered in white circle using textBaseline='middle', plus bold font for visibility | Visual polish, character rendering |
| 2026-05-01 17:30 | pixelpilot | Remove duplicate Viewer.render() (was exact copy of Renderer.render()); remove redundant Renderer.drawFloor() call — Map.render() already draws floor grid so drawFloor's checkerboard was running on top and obscuring furniture/walls | Render pipeline cleanup, bug fix |
| 2026-05-01 18:30 | pixelpilot | Keep bubble alive while agent is still working — bubbles no longer disappear 3s after tool call starts; now they persist until agent finishes working | Improved bubble/character visual sync |
| 2026-05-01 19:30 | pixelpilot | Fix canvas context state leak in thinking indicator — use ctx.save/restore instead of manual textBaseline restore; also correct ? position to be centered in the circle (x+7→x+8) | Fixes name tag rendering corruption for characters drawn after thinking character |
| 2026-05-01 20:30 | pixelpilot | Fix spawn point collision — spawnPoints.occupied was never set when used, causing potential spawn collisions for simultaneous agent spawns; now marks occupied on spawn and releases when agent walks to desk | Fixes potential character collision bug |
| 2026-05-02 01:30 | pixelpilot | Fix bubble text vertical positioning — add explicit `ctx.textBaseline = 'alphabetic'` in renderBubble(), since character.js thinking indicator leaves ctx.textBaseline='middle' set after rendering, causing bubble text to render with wrong baseline | Consistent text rendering across canvas state |

## Current Stage
- Phase 1 complete: Core visualization platform
- Server running at port 7777
- Recent fixes: Idle breathing animation, mobile chat panel toggle, HiDPI floor grid, HiDPI canvas clear, deltaTime cap, name tag measurement, live server-info refresh, SSE keep-alive ping, agent_type preservation, per-type chat content colors, smart chat auto-scroll, bubble persists while agent is working
- Next: Continue UI polish and bug fixes

## Priority Areas (update as needed)
1. UI polish and visual consistency
2. Character animation smoothness
3. WebSocket/SSE reliability ✓ (keep-alive pings added)
4. Performance optimization
