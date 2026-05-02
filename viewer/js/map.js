// Pixel Agent Viewer - Office Map
export class Map {
  constructor() {
    this.TILE_SIZE = 32;
    this.width = 30;
    this.height = 17;
    this.walls = [];
    this.furniture = [];
    this.doors = [];
    
    this.generateOffice();
  }
  
  generateOffice() {
    // Create office layout
    // 0 = floor, 1 = wall, 2 = desk, 3 = chair, 4 = plant, 5 = door
    
    const layout = [
      '##############################',  // top wall
      '#............................#',
      '#.##..........##..........##.#',  // desks
      '#.##..[@]....##....[@]...##.#',
      '#.##..........##..........##.#',
      '#............................#',
      '#......####........####.....#',  // meeting area
      '#......#..#........#..#.....#',
      '#......####........####.....#',
      '#............................#',
      '#.##..........##..........##.#',  // more desks
      '#.##..[@]....##....[@]...##.#',
      '#.##..........##..........##.#',
      '#............................#',
      '#...........[DOOR]..........#',  // bottom door
      '##############################',
    ];
    
    // Spawn positions (where agents enter)
    this.spawnPoints = [
      { x: 5, y: 13, name: 'entrance' },
      { x: 13, y: 13, name: 'entrance' },
      { x: 21, y: 13, name: 'entrance' },
    ];
    
    // Desk positions (where agents work)
    this.desks = [
      { x: 3, y: 3, occupied: null },
      { x: 4, y: 3, occupied: null },
      { x: 18, y: 3, occupied: null },
      { x: 19, y: 3, occupied: null },
      { x: 3, y: 11, occupied: null },
      { x: 4, y: 11, occupied: null },
      { x: 18, y: 11, occupied: null },
      { x: 19, y: 11, occupied: null },
    ];
    
    // Break room
    this.breakArea = { x: 12, y: 6, radius: 3 };
  }
  
  isWalkable(x, y) {
    // Check bounds
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
    
    // Walls
    if (y === 0 || y === this.height - 1) return false;
    if (x === 0 || x === this.width - 1) return false;
    
    // Meeting room walls
    if (y >= 6 && y <= 8 && (x >= 6 && x <= 9 || x >= 20 && x <= 23)) return false;
    
    return true;
  }
  
  getSpawnPoint() {
    // Return random unoccupied spawn
    const available = this.spawnPoints.filter(s => !s.occupied);
    if (available.length === 0) return this.spawnPoints[0];
    return available[Math.floor(Math.random() * available.length)];
  }
  
  getAvailableDesk() {
    const available = this.desks.filter(d => !d.occupied);
    if (available.length === 0) {
      // All desks full, return break area
      return { x: this.breakArea.x, y: this.breakArea.y, isBreak: true };
    }
    const desk = available[Math.floor(Math.random() * available.length)];
    desk.occupied = true;
    return desk;
  }
  
  releaseDesk(desk) {
    const d = this.desks.find(d => d.x === desk.x && d.y === desk.y);
    if (d) d.occupied = null;
  }
  
  render(ctx) {
    const T = this.TILE_SIZE;
    
    // Draw floor and walls
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const px = x * T;
        const py = y * T;
        
        // Default floor
        ctx.fillStyle = '#252540';
        ctx.fillRect(px, py, T, T);
        
        // Walls
        if (y === 0 || y === this.height - 1 || x === 0 || x === this.width - 1) {
          ctx.fillStyle = '#3d3d5c';
          ctx.fillRect(px, py, T, T);
          // Brick pattern
          ctx.fillStyle = '#4a4a6a';
          if ((x + y) % 2 === 0) {
            ctx.fillRect(px + 2, py + 2, T - 4, T - 4);
          }
        }
        
        // Meeting room
        if (y >= 6 && y <= 8 && x >= 6 && x <= 9) {
          ctx.fillStyle = '#2d4a3d';
          ctx.fillRect(px, py, T, T);
          ctx.strokeStyle = '#4a7a5a';
          ctx.strokeRect(px + 1, py + 1, T - 2, T - 2);
        }
        
        if (y >= 6 && y <= 8 && x >= 20 && x <= 23) {
          ctx.fillStyle = '#2d4a3d';
          ctx.fillRect(px, py, T, T);
          ctx.strokeStyle = '#4a7a5a';
          ctx.strokeRect(px + 1, py + 1, T - 2, T - 2);
        }
      }
    }
    
    // Draw desks
    ctx.fillStyle = '#5c4033';
    for (const desk of this.desks) {
      const px = desk.x * T;
      const py = desk.y * T;
      ctx.fillRect(px - 4, py - 4, T * 2 + 8, T * 2 + 8);
      // Desk surface
      ctx.fillStyle = '#8b6914';
      ctx.fillRect(px, py, T * 2, T * 2);
      ctx.fillStyle = '#5c4033';
    }
    
    // Draw door
    ctx.fillStyle = '#5c8a5c';
    const doorX = 13 * T;
    const doorY = 14 * T;
    ctx.fillRect(doorX, doorY, 4 * T, T);
    
    // "DOOR" text
    ctx.fillStyle = '#1a1a2e';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('DOOR', doorX + 8, doorY + 20);
    
    // Plants
    this.drawPlant(ctx, 2 * T, 5 * T);
    this.drawPlant(ctx, 27 * T, 5 * T);
    this.drawPlant(ctx, 27 * T, 13 * T);
  }
  
  drawPlant(ctx, x, y) {
    ctx.save();
    // Pot
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(x + 4, y + 20, 24, 12);
    // Main leaf
    ctx.fillStyle = '#228b22';
    ctx.beginPath();
    ctx.arc(x + 16, y + 12, 12, 0, Math.PI * 2);
    ctx.fill();
    // Highlight leaf
    ctx.fillStyle = '#32cd32';
    ctx.beginPath();
    ctx.arc(x + 12, y + 8, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
