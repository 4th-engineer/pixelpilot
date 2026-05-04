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
    return {
      x: Math.random() * this.width,
      y: y !== null ? y : Math.random() * this.height,
      size: 1 + Math.random() * 1.5,
      speedY: -(0.3 + Math.random() * 0.4), // upward drift
      speedX: (Math.random() - 0.5) * 0.3,  // slight horizontal sway
      alpha: 0.15 + Math.random() * 0.25,
      phase: Math.random() * Math.PI * 2,    // for oscillation
    };
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
  }

  update(deltaTime) {
    for (const p of this.particles) {
      p.y += p.speedY * deltaTime * 60;
      p.x += p.speedX * deltaTime * 60;
      p.phase += deltaTime * 2;
      p.x += Math.sin(p.phase) * 0.15; // gentle sine wave sway

      // Respawn at bottom when exiting top
      if (p.y < -5) {
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
