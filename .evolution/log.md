# pixelpilot - Project Self-Evolution Log

## History
| Date | Project | Changes Made | Impact |
|------|---------|--------------|--------|
| 2026-04-30 20:30 | pixelpilot | Add collapsible chat panel with toggle button for mobile (<768px) — chat panel hidden by default on mobile, slides in with 💬 button | Responsive/mobile UI support |
| 2026-05-01 00:30 | pixelpilot | Refresh server-info in status bar every 5 seconds via setInterval in viewer.js — previously only fetched once at init, now shows live client/event counts | Live server status in UI |
| 2026-05-01 01:30 | pixelpilot | Add subtle idle breathing animation — idle characters bob 1px vertically at 0.5 Hz, makes office feel more alive | Polished character animation |
| 2026-04-30 19:30 | pixelpilot | renderer.js: render() and drawFloor() now use logical CSS pixel dimensions from engine.js instead of physical canvas pixels — fixes floor grid sizing on HiDPI/Retina displays | Consistent HiDPI rendering pipeline |
| 2026-04-30 18:30 | pixelpilot | Fix canvas clear on HiDPI — use logical CSS px instead of physical px | Correct canvas clearing on Retina/HiDPI displays |
| 2026-04-30 17:30 | pixelpilot | Fix name tag width measurement in character.js | Accurate name tag background sizing |
| 2026-04-30 16:30 | pixelpilot | Cap deltaTime to 100ms max in game loop | Prevents character teleportation when tab is backgrounded/resumed |

## Current Stage
- Phase 1 complete: Core visualization platform
- Server running at port 7777
- Recent fixes: Idle breathing animation, mobile chat panel toggle, HiDPI floor grid, HiDPI canvas clear, deltaTime cap, name tag measurement, live server-info refresh
- Next: Continue UI polish and bug fixes

## Priority Areas (update as needed)
1. Mobile/responsive UI
2. HiDPI/Retina display support
3. Character animation smoothness
4. WebSocket reliability
