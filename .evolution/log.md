# pixelpilot - Project Self-Evolution Log

## History
| Date | Project | Changes Made | Impact |
|------|---------|--------------|--------|
| 2026-04-30 19:30 | pixelpilot | renderer.js: render() and drawFloor() now use logical CSS pixel dimensions from engine.js instead of physical canvas pixels — fixes floor grid sizing on HiDPI/Retina displays | Consistent HiDPI rendering pipeline |
| 2026-04-30 18:30 | pixelpilot | Fix canvas clear on HiDPI — use logical CSS px instead of physical px | Correct canvas clearing on Retina/HiDPI displays |
| 2026-04-30 17:30 | pixelpilot | Fix name tag width measurement in character.js | Accurate name tag background sizing |
| 2026-04-30 16:30 | pixelpilot | Cap deltaTime to 100ms max in game loop | Prevents character teleportation when tab is backgrounded/resumed |

## Current Stage
- Phase 1 complete: Core visualization platform
- Server running at port 7777
- Recent fixes: HiDPI floor grid (this run), HiDPI canvas clear, deltaTime cap, name tag measurement
- Next: Continue UI polish and bug fixes

## Priority Areas (update as needed)
1. HiDPI/Retina display support
2. Character animation smoothness
3. CSS styling improvements
4. WebSocket reliability
