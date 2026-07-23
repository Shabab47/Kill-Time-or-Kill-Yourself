class Particle {
  constructor(x, y, vx, vy, life, color, size, shrink, glow) {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.life = life; this.maxLife = life;
    this.color = color; this.size = size;
    this.shrink = shrink !== false;
    this.glow = glow || false;
    this.alive = true;
  }
  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vx *= 0.98;
    this.vy *= 0.98;
    this.life -= dt;
    if (this.life <= 0) this.alive = false;
  }
}

class ParticleSystem {
  constructor() { this.particles = []; }
  emit(x, y, count, opts = {}) {
    const { speed = 100, life = 0.6, color = '#fff', size = 4, vary = 0.5, glow = false, shrink = true } = opts;
    for (let i = 0; i < count; i++) {
      const a = rand(0, TAU);
      const s = rand(speed * (1 - vary), speed * (1 + vary));
      this.particles.push(new Particle(
        x + rand(-2, 2), y + rand(-2, 2),
        Math.cos(a) * s, Math.sin(a) * s,
        rand(life * 0.6, life * 1.4),
        color, rand(size * 0.6, size * 1.4), shrink, glow
      ));
    }
  }
  emitExplosion(x, y, radius, opts = {}) {
    const { speed = 200, count = 20, color = '#ff6f00', life = 0.5, size = 5 } = opts;
    for (let i = 0; i < count; i++) {
      const a = rand(0, TAU);
      const s = rand(speed * 0.3, speed);
      const d = rand(0, radius);
      this.particles.push(new Particle(
        x + Math.cos(a) * d, y + Math.sin(a) * d,
        Math.cos(a) * s, Math.sin(a) * s,
        rand(life * 0.5, life), color, rand(size * 0.5, size), true, true
      ));
    }
  }
  update(dt) {
    for (const p of this.particles) p.update(dt);
    this.particles = this.particles.filter(p => p.alive);
  }
}
