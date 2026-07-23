const PI = Math.PI;
const TAU = PI * 2;
const rand = (a, b) => Math.random() * (b - a) + a;
const randInt = (a, b) => Math.floor(rand(a, b + 1));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const angle = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);
const choose = arr => arr[Math.floor(Math.random() * arr.length)];

class FloatingNumber {
  constructor(x, y, text, color, size) {
    this.x = x; this.y = y;
    this.text = text;
    this.color = color || '#ce93d8';
    this.size = size || 18;
    this.life = 1.2;
    this.maxLife = 1.2;
    this.vy = -60;
    this.alive = true;
  }
  update(dt) {
    this.y += this.vy * dt;
    this.vy *= 0.97;
    this.life -= dt;
    if (this.life <= 0) this.alive = false;
  }
}
