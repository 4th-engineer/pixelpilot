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
    
    // Handle HiDPI displays and resize
    window.addEventListener('resize', () => this.resize());
    this.resize();
  }
  
  resize() {
    const container = document.getElementById('canvas-container');
    const dpr = window.devicePixelRatio || 1;
    
    // Set canvas to physical pixels for HiDPI
    this.canvas.width = container.clientWidth * dpr;
    this.canvas.height = container.clientHeight * dpr;
    
    // Scale context so 1 CSS pixel = 1 unit
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    
    // CSS size = logical pixels
    this.canvas.style.width = container.clientWidth + 'px';
    this.canvas.style.height = container.clientHeight + 'px';
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
