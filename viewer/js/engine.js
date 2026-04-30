// Pixel Agent Viewer - Game Engine
export class Engine {
  constructor(viewer) {
    this.viewer = viewer;
    this.canvas = document.getElementById('canvas');
    this.ctx = null;
    this.running = false;
    this.lastTime = 0;
    this.deltaTime = 0;
    this.fps = 0;
    this.frameCount = 0;
    this.fpsTime = 0;
    this.TARGET_FPS = 30;
    this.FRAME_TIME = 1000 / this.TARGET_FPS;
    this.onTick = null;
    
    this.init();
  }
  
  init() {
    // Setup canvas
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    
    // Handle resize
    window.addEventListener('resize', () => this.resize());
    
    // Handle HiDPI displays
    this.setupHiDPI();
  }
  
  resize() {
    const container = document.getElementById('canvas-container');
    this.canvas.width = container.clientWidth;
    this.canvas.height = container.clientHeight;
  }
  
  setupHiDPI() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    
    this.ctx.scale(dpr, dpr);
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
  }
  
  start() {
    this.running = true;
    this.lastTime = performance.now();
    this.loop();
  }
  
  stop() {
    this.running = false;
  }
  
  loop() {
    if (!this.running) return;
    
    const now = performance.now();
    const elapsed = now - this.lastTime;
    
    if (elapsed >= this.FRAME_TIME) {
      this.deltaTime = elapsed / 1000;
      this.lastTime = now - (elapsed % this.FRAME_TIME);
      
      // FPS counter
      this.frameCount++;
      if (now - this.fpsTime >= 1000) {
        this.fps = this.frameCount;
        this.frameCount = 0;
        this.fpsTime = now;
        if (this.onTick) this.onTick();
      }
      
      // Update
      this.update();
      
      // Render
      this.render();
    }
    
    requestAnimationFrame(() => this.loop());
  }
  
  update() {
    // Update all game objects
    if (this.viewer.characterManager) {
      this.viewer.characterManager.update(this.deltaTime);
    }
    if (this.viewer.bubbleManager) {
      this.viewer.bubbleManager.update(this.deltaTime);
    }
  }
  
  render() {
    if (this.viewer.renderer) {
      this.viewer.render(this.ctx);
    }
  }
}
