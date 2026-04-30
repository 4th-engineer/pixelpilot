// Pixel Agent Viewer - Renderer
export class Renderer {
  constructor(viewer) {
    this.viewer = viewer;
    this.TILE_SIZE = 32;
  }
  
  render(ctx) {
    const { canvas, map, characterManager, bubbleManager } = this.viewer;
    
    // Clear with background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw floor grid
    this.drawFloor(ctx);
    
    // Draw map elements (walls, furniture)
    if (map) map.render(ctx);
    
    // Draw characters
    if (characterManager) characterManager.render(ctx);
    
    // Draw speech bubbles
    if (bubbleManager) bubbleManager.render(ctx);
    
    // Draw HUD
    this.drawHUD(ctx);
  }
  
  drawFloor(ctx) {
    const { canvas } = this.viewer;
    ctx.fillStyle = '#252540';
    
    // Draw subtle grid
    for (let x = 0; x < canvas.width; x += this.TILE_SIZE) {
      for (let y = 0; y < canvas.height; y += this.TILE_SIZE) {
        if ((x / this.TILE_SIZE + y / this.TILE_SIZE) % 2 === 0) {
          ctx.fillStyle = '#252540';
        } else {
          ctx.fillStyle = '#2a2a48';
        }
        ctx.fillRect(x, y, this.TILE_SIZE, this.TILE_SIZE);
      }
    }
  }
  
  drawHUD(ctx) {
    // Agent status in corner
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 200, 30 + this.viewer.agents.size * 20);
    
    ctx.fillStyle = '#e94560';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('Active Agents', 20, 28);
    
    ctx.fillStyle = '#eaeaea';
    ctx.font = '11px monospace';
    
    let y = 48;
    for (const [id, agent] of this.viewer.agents) {
      const status = agent.status === 'working' ? '🔨' : 
                      agent.status === 'thinking' ? '💭' : '💤';
      ctx.fillText(`${status} ${id}`, 20, y);
      y += 18;
    }
  }
}
