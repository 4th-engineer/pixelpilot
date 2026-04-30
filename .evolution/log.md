# pixelpilot - Project Self-Evolution Log

## History
| Date | Project | Changes Made | Impact |
|------|---------|--------------|--------|
| 2026-04-30 20:30 | pixelpilot | Add collapsible chat panel with toggle button for mobile (<768px) — chat panel hidden by default on mobile, slides in with 💬 button | Responsive/mobile UI support |
| 2026-05-01 00:30 | pixelpilot | Refresh server-info in status bar every 5 seconds via setInterval in viewer.js — previously only fetched once at init, now shows live client/event counts | Live server status in UI |
| 2026-05-01 05:30 | pixelpilot | Move bubble position update from render() to update() — bubbles now track character position each frame instead of only on render, fixing cases where bubbles never positioned if character hadn't spawned yet | Fixed potential silent bubble rendering bug |
| 2026-05-01 04:30 | pixelpilot | Add SSE keep-alive ping every 30s — server sends `ping` events to all SSE clients to detect dead connections and clean them up faster | Improved WebSocket reliability |
| 2026-04-30 19:30 | pixelpilot | renderer.js: render() and drawFloor() now use logical CSS pixel dimensions from engine.js instead of physical canvas pixels — fixes floor grid sizing on HiDPI/Retina displays | Consistent HiDPI rendering pipeline |
| 2026-04-30 18:30 | pixelpilot | Fix canvas clear on HiDPI — use logical CSS px instead of physical px | Correct canvas clearing on Retina/HiDPI displays |
| 2026-04-30 17:30 | pixelpilot | Fix name tag width measurement in character.js | Accurate name tag background sizing |
| 2026-04-30 16:30 | pixelpilot | Cap deltaTime to 100ms max in game loop | Prevents character teleportation when tab is backgrounded/resumed |

## Current Stage
- Phase 1 complete: Core visualization platform
- Server running at port 7777
- Recent fixes: Idle breathing animation, mobile chat panel toggle, HiDPI floor grid, HiDPI canvas clear, deltaTime cap, name tag measurement, live server-info refresh, SSE keep-alive ping
- Next: Continue UI polish and bug fixes

## Priority Areas (update as needed)
1. UI polish and visual consistency
2. Character animation smoothness
3. WebSocket/SSE reliability ✓ (keep-alive pings added)
4. Performance optimization
