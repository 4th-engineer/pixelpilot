// Pixel Agent Viewer - Bubble Manager
export class BubbleManager {
  constructor() {
    this.bubbles = [];
  }
  
  addBubble(agentId, message, type = 'tool') {
    const bubble = {
      id: Date.now() + Math.random(),
      agentId,
      message: this.truncate(message, 80),
      type, // thinking, tool, done
      x: 0,
      y: 0,
      alpha: 1,
      life: 3, // seconds
      age: 0,
    };
    
    this.bubbles.push(bubble);
    
    // Limit bubbles
    while (this.bubbles.length > 20) {
      this.bubbles.shift();
    }
    
    return bubble;
  }
  
  truncate(str, len) {
    if (str.length <= len) return str;
    return str.substring(0, len - 3) + '...';
  }
  
  update(deltaTime) {
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const bubble = this.bubbles[i];
      bubble.age += deltaTime;
      
      // Update position each frame so bubbles track their characters
      const char = window.viewer?.characterManager?.characters?.get(bubble.agentId);
      if (char) {
        bubble.x = char.x + 16;
        bubble.y = char.y - 30;
        
        // Keep bubble alive while agent is still working
        if (char.isWorking && bubble.age >= bubble.life) {
          bubble.age = bubble.life - 0.1; // pause near end of life
        }
      }
      
      // Fade out near end of life (only when not working)
      if (bubble.age > bubble.life - 1) {
        bubble.alpha = Math.max(0, 1 - (bubble.age - (bubble.life - 1)));
      }
      
      // Remove expired bubbles (only when not working)
      if (bubble.age >= bubble.life) {
        const stillWorking = char?.isWorking;
        if (!stillWorking) {
          this.bubbles.splice(i, 1);
        }
      }
    }
  }
  
  render(ctx) {
    for (const bubble of this.bubbles) {
      this.renderBubble(ctx, bubble);
    }
  }
  
  // Polyfill roundRect for browsers that don't support it
  _roundRect(ctx, x, y, w, h, r) {
    // Ensure fresh path state before drawing
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x, y, w, h, r);
    } else {
      // Fallback using arcTo for older browsers
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.arcTo(x + w, y, x + w, y + r, r);
      ctx.lineTo(x + w, y + h - r);
      ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
      ctx.lineTo(x + r, y + h);
      ctx.arcTo(x, y + h, x, y + h - r, r);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.closePath();
    }
  }

  renderBubble(ctx, bubble) {
    if (bubble.x === 0 && bubble.y === 0) return; // Not positioned yet (should not happen now)

    ctx.save();
    ctx.globalAlpha = bubble.alpha;

    // Bubble background
    const padding = 6;
    ctx.font = '11px monospace';
    const textWidth = ctx.measureText(bubble.message).width;
    const width = textWidth + padding * 2;
    const height = 20;

    // Position
    const x = bubble.x - width / 2;
    const y = bubble.y - height;

    // Background color by type
    let bgColor = '#ffffff';
    if (bubble.type === 'thinking') bgColor = '#fef3c7';
    if (bubble.type === 'tool') bgColor = '#dbeafe';
    if (bubble.type === 'done') bgColor = '#d1fae5';

    // Shadow for depth
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;

    ctx.fillStyle = bgColor;
    ctx.beginPath();
    this._roundRect(ctx, x, y, width, height, 6);
    ctx.fill();

    // Reset shadow before tail (tail is drawn without shadow)
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Tail
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.moveTo(bubble.x - 4, y + height);
    ctx.lineTo(bubble.x + 4, y + height);
    ctx.lineTo(bubble.x, y + height + 6);
    ctx.closePath();
    ctx.fill();

    // Text (isolate text state)
    ctx.save();
    ctx.fillStyle = '#1a1a2e';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(bubble.message, bubble.x, y + 14);
    ctx.restore();

    ctx.restore();
  }
  
  clear() {
    this.bubbles = [];
  }
}
