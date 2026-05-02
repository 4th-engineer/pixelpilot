// Pixel Agent Viewer - Renderer
export class Renderer {
  constructor(viewer) {
    this.viewer = viewer;
    this.TILE_SIZE = 32;
  }
  
  render(ctx, width, height) {
    const { canvas, map, characterManager, bubbleManager } = this.viewer;

    // Clear with background using logical CSS pixel dimensions
    // (canvas.width/height are physical pixels; width/height are logical)
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Draw map elements (walls, furniture, floor) — Map.render() draws the floor grid
    if (map) map.render(ctx);

    // Draw desk occupancy indicators (character dots on desks)
    this.drawDeskIndicators(ctx);
    
    // Draw characters
    if (characterManager) characterManager.render(ctx);
    
    // Draw speech bubbles
    if (bubbleManager) bubbleManager.render(ctx);
    
    // Draw HUD
    this.drawHUD(ctx);
  }
  
  drawFloor(ctx, width, height) {
    ctx.fillStyle = '#252540';

    // Draw subtle grid using logical dimensions
    for (let x = 0; x < width; x += this.TILE_SIZE) {
      for (let y = 0; y < height; y += this.TILE_SIZE) {
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
    // Agent status in corner — size box to fit content
    const agentEntries = [...this.viewer.agents.entries()];
    if (agentEntries.length === 0) return;

    // Measure the longest agent ID text to size the panel
    ctx.font = '11px monospace';
    const maxTextWidth = Math.max(...agentEntries.map(([id]) => ctx.measureText(id).width));
    const panelWidth = Math.max(140, maxTextWidth + 60);
    const panelHeight = 30 + agentEntries.length * 20;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, panelWidth, panelHeight);
    
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

  drawDeskIndicators(ctx) {
    const { map, characterManager } = this.viewer;
    if (!map || !characterManager) return;

    const T = map.TILE_SIZE;
    const chars = characterManager.characters;

    for (const char of chars.values()) {
      if (!char.desk || char.desk.isBreak) continue;

      // Draw a colored dot on the desk to show which agent sits there
      const deskPx = char.desk.x * T + T;
      const deskPy = char.desk.y * T + T;

      ctx.save();
      ctx.fillStyle = char.color;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(deskPx, deskPy - 4, 6, 0, Math.PI * 2);
      ctx.fill();

      // Highlight ring
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.5;
      ctx.stroke();
      ctx.restore();
    }
  }
}
