// Shared helpers -----------------------------------------------------------

const PI = Math.PI;
const TAU = PI * 2;

const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max + 1));
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (startValue, endValue, progress) => startValue + (endValue - startValue) * progress;
const dist = (pointA, pointB) => Math.hypot(pointA.x - pointB.x, pointA.y - pointB.y);
const angle = (fromPoint, toPoint) => Math.atan2(toPoint.y - fromPoint.y, toPoint.x - fromPoint.x);
const choose = (options) => options[Math.floor(Math.random() * options.length)];

// Explosion damage ---------------------------------------------------------
// Used by melee hits, projectiles, and any other source of AoE bursts so that
// every explosion behaves identically (same falloff, visuals, and sound).

const EXPLOSION_BASE_RADIUS = 60;
const EXPLOSION_DAMAGE_FALLOFF = 0.5; // damage multiplier at the blast center

function detonateExplosion(centerX, centerY, damage, attacker, immuneEnemy, enemies, particles, camera, audioSystem) {
  const radiusMultiplier = attacker && attacker.aoeRadiusMult ? attacker.aoeRadiusMult : 1;
  const radius = EXPLOSION_BASE_RADIUS * radiusMultiplier;

  particles.emitExplosion(centerX, centerY, radius, { speed: 180, count: 15, color: '#c62828', life: 0.4, size: 5 });
  audioSystem.play('explosion');
  camera.shake(4);

  for (const enemy of enemies) {
    if (!enemy.alive || enemy === immuneEnemy) continue;
    const distanceToBlast = Math.hypot(enemy.x - centerX, enemy.y - centerY);
    if (distanceToBlast < radius) {
      const falloff = 1 - distanceToBlast / radius;
      enemy.takeDamage(damage * EXPLOSION_DAMAGE_FALLOFF * falloff, attacker, particles, camera, audioSystem);
    }
  }
}

function applyLifesteal(attacker, damageDealt) {
  if (!attacker || !(attacker.lifesteal > 0)) return;
  attacker.hp = Math.min(attacker.maxHp, attacker.hp + damageDealt * attacker.lifesteal);
}

// Returns the closest living enemy to `fromEntity` within `maxRange`, or null.
function findNearestEnemy(fromEntity, enemies, maxRange) {
  let nearestEnemy = null;
  let nearestDistance = maxRange;
  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    const distanceToEnemy = dist(fromEntity, enemy);
    if (distanceToEnemy < nearestDistance) {
      nearestDistance = distanceToEnemy;
      nearestEnemy = enemy;
    }
  }
  return nearestEnemy;
}

// Floating damage numbers ---------------------------------------------------

class FloatingNumber {
  constructor(x, y, text, color, size) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color || '#ce93d8';
    this.size = size || 18;
    this.life = 1.2;
    this.maxLife = 1.2;
    this.vy = -60; // pixels per second, drifting upward
    this.alive = true;
  }
  update(deltaTime) {
    this.y += this.vy * deltaTime;
    this.vy *= 0.97;
    this.life -= deltaTime;
    if (this.life <= 0) this.alive = false;
  }
}

// Direction facing ----------------------------------------------------------

const DIRS_8 = ['E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'NE'];

function angleToDir8(angleRad) {
  let degrees = (angleRad * 180 / PI) % 360;
  if (degrees < 0) degrees += 360;
  const directionIndex = Math.round(degrees / 45) % 8;
  return DIRS_8[directionIndex];
}
