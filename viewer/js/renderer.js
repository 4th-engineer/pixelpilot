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

    // Draw ambient dust particles
    if (this.viewer.particleManager) this.viewer.particleManager.render(ctx);

    // Draw desk occupancy indicators (character dots on desks)
    this.drawDeskIndicators(ctx);
    
    // Draw characters
    if (characterManager) characterManager.render(ctx);
    
    // Draw speech bubbles
    if (bubbleManager) bubbleManager.render(ctx);
    
    // Draw HUD
    this.drawHUD(ctx);
  }
  

  drawHUD(ctx) {
    // Agent status in corner — size box to fit content
    const agentEntries = [...this.viewer.agents.entries()];
    if (agentEntries.length === 0) return;

    // Find character info for each agent (color, name)
    const charMap = this.viewer.characterManager?.characters;
    const getCharInfo = (agentId) => {
      const char = charMap?.get(agentId);
      return char ? { color: char.color, name: char.name } : null;
    };

    // Measure the longest combined (name + id) text to size the panel
    ctx.font = '11px monospace';
    const maxTextWidth = Math.max(...agentEntries.map(([id]) => {
      const info = getCharInfo(id);
      const label = info ? `${info.name} (${id})` : id;
      return ctx.measureText(label).width;
    })) || 0;  // fallback if all agents lack spawned characters (NaN guard)
    const panelWidth = Math.max(160, maxTextWidth);
    const panelHeight = 30 + agentEntries.length * 22;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, panelWidth, panelHeight);

    ctx.fillStyle = '#e94560';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Active Agents', 20, 26);

    ctx.font = '11px monospace';
    ctx.textBaseline = 'alphabetic';

    let y = 50;
    for (const [id, agent] of this.viewer.agents) {
      const status = agent.status === 'working' ? '🔨' :
                      agent.status === 'thinking' ? '💭' : '💤';
      const info = getCharInfo(id);

      // Color dot
      ctx.fillStyle = info?.color || '#888';
      ctx.beginPath();
      ctx.arc(20, y - 4, 5, 0, Math.PI * 2);
      ctx.fill();

      // Agent label: name (id)
      ctx.fillStyle = '#eaeaea';
      const label = info ? `${info.name} (${id})` : id;
      ctx.fillText(`${status} ${label}`, 32, y);
      y += 22;
    }
    ctx.restore();
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
