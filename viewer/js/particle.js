// Pixel Agent Viewer - Ambient Dust Particles
export class ParticleSystem {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.particles = [];
    this.COUNT = 15;
    this._init();
  }

  _init() {
    for (let i = 0; i < this.COUNT; i++) {
      this.particles.push(this._spawn());
    }
  }

  _spawn(y = null) {
    const size = 0.8 + Math.random() * 1.2;
    return {
      x: Math.random() * this.width,
      y: y !== null ? y : Math.random() * this.height,
      baseY: y !== null ? y : Math.random() * this.height,  // vertical anchor for bobbing
      size,
      speedY: -(0.15 + Math.random() * 0.25), // slow upward drift
      alpha: 0.12 + Math.random() * 0.2,
      phase: Math.random() * Math.PI * 2,      // for horizontal oscillation
      bobPhase: Math.random() * Math.PI * 2,   // for vertical bobbing
      bobSpeed: 0.8 + Math.random() * 0.6,     // individual bob speed
      bobAmount: 2 + Math.random() * 2,        // vertical bob amplitude (CSS px)
    };
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
  }

  update(deltaTime) {
    for (const p of this.particles) {
      p.y += p.speedY * deltaTime * 60;
      p.phase += deltaTime * 2;
      p.bobPhase += deltaTime * p.bobSpeed;
      p.x += Math.sin(p.phase) * 0.15; // gentle horizontal sway
      // Vertical bobbing around the upward drift
      p.y = p.baseY + Math.sin(p.bobPhase) * p.bobAmount;
      p.baseY += p.speedY * deltaTime * 60;

      // Respawn at bottom when exiting top
      if (p.baseY < -5) {
        Object.assign(p, this._spawn(this.height + 5));
      }
    }
  }

  render(ctx) {
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

export class ParticleManager {
  constructor() {
    this.system = null;
  }

  init(width, height) {
    this.system = new ParticleSystem(width, height);
  }

  resize(width, height) {
    if (this.system) this.system.resize(width, height);
  }

  update(deltaTime) {
    if (this.system) this.system.update(deltaTime);
  }

  render(ctx) {
    if (this.system) this.system.render(ctx);
  }
}
