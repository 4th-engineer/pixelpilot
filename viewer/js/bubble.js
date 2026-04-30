// Pixel Agent Viewer - Bubble Manager
export class BubbleManager {
  constructor() {
    this.bubbles = [];
  }
  
  addBubble(agentId, message, type = 'tool') {
    const bubble = {
      id: Date.now() + Math.random(),
      agentId,
      message: this.truncate(message, 50),
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
      
      // Fade out near end of life
      if (bubble.age > bubble.life - 1) {
        bubble.alpha = Math.max(0, 1 - (bubble.age - (bubble.life - 1)));
      }
      
      // Remove expired bubbles
      if (bubble.age >= bubble.life) {
        this.bubbles.splice(i, 1);
      }
    }
  }
  
  render(ctx) {
    for (const bubble of this.bubbles) {
      this.renderBubble(ctx, bubble);
    }
  }
  
  renderBubble(ctx, bubble) {
    // Position bubble above character
    const char = window.viewer?.characterManager?.characters?.get(bubble.agentId);
    if (char) {
      bubble.x = char.x + 16;
      bubble.y = char.y - 30;
    }
    
    if (bubble.x === 0) return; // Not positioned yet
    
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
    
    // Background
    let bgColor = '#ffffff';
    if (bubble.type === 'thinking') bgColor = '#fef3c7';
    if (bubble.type === 'tool') bgColor = '#dbeafe';
    if (bubble.type === 'done') bgColor = '#d1fae5';
    
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 6);
    ctx.fill();
    
    // Tail
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.moveTo(bubble.x - 4, y + height);
    ctx.lineTo(bubble.x + 4, y + height);
    ctx.lineTo(bubble.x, y + height + 6);
    ctx.closePath();
    ctx.fill();
    
    // Text
    ctx.fillStyle = '#1a1a2e';
    ctx.textAlign = 'center';
    ctx.fillText(bubble.message, bubble.x, y + 14);
    
    ctx.restore();
  }
  
  clear() {
    this.bubbles = [];
  }
}
