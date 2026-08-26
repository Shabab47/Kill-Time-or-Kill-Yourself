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

// ---------------------------------------------------------------------------
// Endless world: obstacles are generated deterministically per map chunk,
// so the same area always looks the same no matter how far the player roams.
// ---------------------------------------------------------------------------

const OBSTACLE_CHUNK_SIZE = 600;
const SPAWN_CLEARING_RADIUS = 170; // keep the starting area walkable

function chunkSeed(cx, cy) {
  let h = (Math.imul(cx, 374761393) + Math.imul(cy, 668265263)) ^ 0x5bf03635;
  h = (h ^ (h >>> 13)) >>> 0;
  h = Math.imul(h, 1274126177) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

// Tiny fast seeded PRNG — deterministic per chunk.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randRangeR(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}

function getChunkObstacles(cache, chunkX, chunkY) {
  const key = chunkX + ',' + chunkY;
  const cached = cache.get(key);
  if (cached) return cached;

  const rng = mulberry32(chunkSeed(chunkX, chunkY));
  const baseX = chunkX * OBSTACLE_CHUNK_SIZE;
  const baseY = chunkY * OBSTACLE_CHUNK_SIZE;

  const obstacles = [];
  const tryPlace = (width, height, type) => {
    const centerX = baseX + rng() * OBSTACLE_CHUNK_SIZE;
    const centerY = baseY + rng() * OBSTACLE_CHUNK_SIZE;
    if (Math.hypot(centerX, centerY) < SPAWN_CLEARING_RADIUS) return; // spawn clearing
    for (const other of obstacles) {
      if (other.intersects(centerX, centerY, 36)) return;             // no pile-ups
    }
    const torchChance = Math.hypot(centerX, centerY) < 400 ? 0.35
      : Math.hypot(centerX, centerY) < 800 ? 0.25 : 0.12;
    const hasTorch = type !== 'bloodPool' && rng() < torchChance;
    obstacles.push(new Obstacle(centerX - width / 2, centerY - height / 2, width, height, type, hasTorch));
  };

  for (let i = 0, n = randRangeR(rng, 1, 3); i < n; i++) {
    const tall = rng() < 0.3;
    tryPlace(tall ? 14 : 16, tall ? 32 : 16, 'pillar');
  }
  for (let i = 0, n = randRangeR(rng, 1, 3); i < n; i++) {
    tryPlace(randRangeR(rng, 10, 20), randRangeR(rng, 10, 20), 'rubble');
  }
  if (rng() < 0.6) tryPlace(12, 24, 'tombstone');
  if (rng() < 0.5) tryPlace(randRangeR(rng, 20, 40), randRangeR(rng, 12, 20), 'bloodPool');

  cache.set(key, obstacles);
  return obstacles;
}

// Gather every cached chunk's obstacles overlapping the given view box.
function collectActiveObstacles(cache, centerX, centerY, halfWidth, halfHeight) {
  const minChunkX = Math.floor((centerX - halfWidth) / OBSTACLE_CHUNK_SIZE);
  const maxChunkX = Math.floor((centerX + halfWidth) / OBSTACLE_CHUNK_SIZE);
  const minChunkY = Math.floor((centerY - halfHeight) / OBSTACLE_CHUNK_SIZE);
  const maxChunkY = Math.floor((centerY + halfHeight) / OBSTACLE_CHUNK_SIZE);

  const active = [];
  for (let chunkX = minChunkX; chunkX <= maxChunkX; chunkX++) {
    for (let chunkY = minChunkY; chunkY <= maxChunkY; chunkY++) {
      const chunkObstacles = getChunkObstacles(cache, chunkX, chunkY);
      for (const obstacle of chunkObstacles) active.push(obstacle);
    }
  }
  return active;
}
