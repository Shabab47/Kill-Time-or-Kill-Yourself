class Obstacle {
  constructor(x, y, w, h, type, hasTorch) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.type = type || 'pillar';
    this.hasTorch = hasTorch || false;
    this.torchPhase = rand(0, TAU);
    this.alive = true;
  }

  contains(px, py) {
    return px >= this.x && px <= this.x + this.w && py >= this.y && py <= this.y + this.h;
  }

  intersects(cx, cy, r) {
    const nearX = clamp(cx, this.x, this.x + this.w);
    const nearY = clamp(cy, this.y, this.y + this.h);
    return Math.hypot(cx - nearX, cy - nearY) < r;
  }
}

function generateObstacles() {
  const obs = [];
  const S = G.worldSize;
  const center = S / 2;
  const startClear = 150;

  for (let i = 0; i < 50 + randInt(0, 20); i++) {
    const px = rand(80, S - 96);
    const py = rand(80, S - 96);
    if (Math.hypot(px - center, py - center) < startClear) continue;
    const overlap = obs.some(o => o.intersects(px + 8, py + 8, 32));
    if (overlap) continue;

    const isTall = Math.random() < 0.3;
    const pw = isTall ? 14 : 16;
    const ph = isTall ? 32 : 16;
    const distFromCenter = Math.hypot(px + pw / 2 - center, py + ph / 2 - center);
    const torchChance = distFromCenter < 400 ? 0.35 : distFromCenter < 800 ? 0.25 : 0.12;
    const hasTorch = Math.random() < torchChance;

    obs.push(new Obstacle(px, py, pw, ph, 'pillar', hasTorch));
  }

  for (let i = 0; i < 35; i++) {
    const px = rand(60, S - 68);
    const py = rand(60, S - 68);
    if (Math.hypot(px - center, py - center) < startClear) continue;
    const overlap = obs.some(o => o.intersects(px + 8, py + 8, 28));
    if (overlap) continue;
    obs.push(new Obstacle(px, py, rand(10, 20), rand(10, 20), 'rubble'));
  }

  for (let i = 0; i < 20; i++) {
    const px = rand(60, S - 72);
    const py = rand(60, S - 72);
    if (Math.hypot(px - center, py - center) < startClear) continue;
    const overlap = obs.some(o => o.intersects(px + 6, py + 12, 28));
    if (overlap) continue;
    obs.push(new Obstacle(px, py, 12, 24, 'tombstone'));
  }

  for (let i = 0; i < 15 + randInt(0, 10); i++) {
    const px = rand(60, S - 60);
    const py = rand(60, S - 60);
    if (Math.hypot(px - center, py - center) < startClear) continue;
    obs.push(new Obstacle(px, py, rand(20, 40), rand(12, 20), 'bloodPool'));
  }

  return obs;
}
