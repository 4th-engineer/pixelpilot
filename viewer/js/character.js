// Pixel Agent Viewer - Character & CharacterManager

export class Character {
  constructor(options) {
    this.id = options.id;
    this.name = options.name;
    this.color = options.color;
    this.personality = options.personality;
    this.x = options.x;
    this.y = options.y;
    this.type = options.type;
    this.TILE_SIZE = 32;
    
    // Movement
    this.targetX = this.x;
    this.targetY = this.y;
    this.speed = 100; // pixels per second
    this.state = 'idle'; // idle, walking, thinking, working, break
    this.direction = 0; // 0=down, 1=left, 2=right, 3=up
    this.animFrame = 0;
    this.animTimer = 0;
    
    // Desk assignment
    this.desk = null;
    
    // Work state
    this.isWorking = false;
    this.workTimer = 0;
  }
  
  setState(state) {
    this.state = state;
    
    if (state === 'working') {
      this.isWorking = true;
      this.workTimer = 0;
    } else if (state === 'thinking') {
      this.isWorking = false;
    }
  }
  
  goToDesk() {
    if (!this.desk || this.desk.isBreak) return;
    
    this.targetX = (this.desk.x + 0.5) * this.TILE_SIZE;
    this.targetY = (this.desk.y + 0.5) * this.TILE_SIZE;
    this.state = 'walking';
  }
  
  goToBreakRoom() {
    if (!this.desk) return;
    if (this.desk.map) this.desk.map.releaseDesk(this.desk);
    this.desk = null;
    
    // Go to random break area position
    this.targetX = (12 + Math.random() * 6) * this.TILE_SIZE;
    this.targetY = 7 * this.TILE_SIZE;
    this.state = 'walking';
  }
  
  update(deltaTime) {
    // Animation
    this.animTimer += deltaTime;
    if (this.animTimer > 0.2) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 4;
    }
    
    // Movement
    if (this.state === 'walking') {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 5) {
        this.x = this.targetX;
        this.y = this.targetY;
        this.state = this.desk ? 'working' : 'idle';
      } else {
        const move = this.speed * deltaTime;
        this.x += (dx / dist) * Math.min(move, dist);
        this.y += (dy / dist) * Math.min(move, dist);
        
        // Update direction
        if (Math.abs(dx) > Math.abs(dy)) {
          this.direction = dx > 0 ? 2 : 1;
        } else {
          this.direction = dy > 0 ? 0 : 3;
        }
      }
    }
    
    // Working animation
    if (this.state === 'working') {
      this.workTimer += deltaTime;
    }
  }
  
  render(ctx) {
    const x = Math.floor(this.x);
    const y = Math.floor(this.y);
    const s = this.TILE_SIZE;
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x + s/2, y + s - 2, s/3, s/6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Walking bobbing
    let bobY = 0;
    if (this.state === 'walking') {
      bobY = Math.sin(this.animFrame * Math.PI / 2) * 2;
    }
    
    // Draw pixel character
    // Head
    ctx.fillStyle = '#ffd5b5';
    ctx.fillRect(x + s/4, y + 4 + bobY, s/2, s/3);
    
    // Body
    ctx.fillStyle = this.color;
    ctx.fillRect(x + s/4, y + s/3 + 4 + bobY, s/2, s/3);
    
    // Eyes
    ctx.fillStyle = '#1a1a2e';
    const eyeOffset = this.direction === 1 ? -2 : this.direction === 2 ? 2 : 0;
    ctx.fillRect(x + s/3 + eyeOffset, y + s/4 + 6 + bobY, 3, 3);
    ctx.fillRect(x + s/2 + eyeOffset, y + s/4 + 6 + bobY, 3, 3);
    
    // Working indicator (hammer)
    if (this.state === 'working') {
      const hammerAngle = Math.sin(this.workTimer * 10) * 0.5;
      ctx.save();
      ctx.translate(x + s - 4, y + 8);
      ctx.rotate(hammerAngle);
      ctx.fillStyle = '#888';
      ctx.fillRect(-2, -8, 4, 8);
      ctx.fillStyle = '#654321';
      ctx.fillRect(-4, -2, 8, 4);
      ctx.restore();
    }
    
    // Thinking indicator
    if (this.state === 'thinking') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(x + s - 8, y - 4, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1a1a2e';
      ctx.font = '10px monospace';
      ctx.fillText('?', x + s - 11, y);
    }
    
    // Name tag
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    const nameWidth = ctx.measureText(this.name).width;
    ctx.fillRect(x - 2, y - 14, nameWidth + 8, 12);
    ctx.fillStyle = '#fff';
    ctx.font = '9px monospace';
    ctx.fillText(this.name, x + 2, y - 4);
  }
}

export class CharacterManager {
  constructor(map) {
    this.map = map;
    this.characters = new Map();
    
    // Agent type to character appearance
    this.characterPool = [
      { name: 'Jake', color: '#f97316', personality: 'junior' },
      { name: 'David', color: '#3b82f6', personality: 'senior' },
      { name: 'Sophie', color: '#ec4899', personality: 'designer' },
      { name: 'Kai', color: '#10b981', personality: 'craftsman' },
      { name: 'Mia', color: '#8b5cf6', personality: 'analyst' },
      { name: 'Liam', color: '#06b6d4', personality: 'infrastructure' },
      { name: 'Aria', color: '#f59e0b', personality: 'docs' },
      { name: 'Noah', color: '#ef4444', personality: 'tester' },
      { name: 'Luna', color: '#6366f1', personality: 'security' },
      { name: 'Owen', color: '#84cc16', personality: 'optimizer' },
    ];
    this.poolIndex = 0;
  }
  
  spawnCharacter(agentId, agentType = 'worker') {
    if (this.characters.has(agentId)) {
      return this.characters.get(agentId);
    }
    
    // Get character appearance from pool
    const template = this.characterPool[this.poolIndex % this.characterPool.length];
    this.poolIndex++;
    
    // Get spawn position
    const spawn = this.map.getSpawnPoint();
    
    // Create character
    const char = new Character({
      id: agentId,
      name: template.name,
      color: template.color,
      personality: template.personality,
      x: spawn.x * this.map.TILE_SIZE,
      y: spawn.y * this.map.TILE_SIZE,
      type: agentType,
    });
    
    // Find a desk for this character
    char.desk = this.map.getAvailableDesk();
    if (char.desk) char.desk.map = this.map;
    
    this.characters.set(agentId, char);
    
    // Animate to desk
    setTimeout(() => char.goToDesk(), 100);
    
    return char;
  }
  
  setAgentStatus(agentId, status) {
    const char = this.characters.get(agentId);
    if (!char) return;
    
    switch (status) {
      case 'thinking':
        char.setState('thinking');
        break;
      case 'working':
        char.setState('working');
        break;
      case 'idle':
        char.setState('idle');
        break;
      case 'break':
        char.goToBreakRoom();
        break;
    }
  }
  
  update(deltaTime) {
    for (const char of this.characters.values()) {
      char.update(deltaTime);
    }
  }
  
  render(ctx) {
    // Sort by Y position for proper layering
    const sorted = [...this.characters.values()].sort((a, b) => a.y - b.y);
    for (const char of sorted) {
      char.render(ctx);
    }
  }
  
  clear() {
    // Release all desks
    for (const char of this.characters.values()) {
      if (char.desk && char.desk.map) {
        char.desk.map.releaseDesk(char.desk);
      }
    }
    this.characters.clear();
    this.poolIndex = 0;
  }
}
