class Player {
  constructor() {
    this.x = G.worldSize / 2;
    this.y = G.worldSize / 2;
    this.size = 14;
    this.hp = G.playerBase.hp;
    this.maxHp = G.playerBase.hp;
    this.baseSpeed = G.playerBase.speed;
    this.baseDamage = G.playerBase.damage;
    this.baseAttackSpeed = G.playerBase.attackSpeed;
    this.baseAttackRange = G.playerBase.attackRange;
    this.baseProjectileSpeed = G.playerBase.projectileSpeed;
    this.damageMult = 1;
    this.attackSpeedMult = 1;
    this.speedMult = 1;
    this.armorMult = 1;
    this.thorns = 0;
    this.lifesteal = 0;
    this.explosiveChance = 0;
    this.aoeRadiusMult = 1;
    this.projectileCount = 1;
    this.pierce = 0;
    this.magnetRange = 100;
    this.regen = 0;
    this.dashDamage = 0;
    this.orbitalCount = 0;
    this.orbitalDamage = 0;
    this.orbitalRadius = 55;
    this.orbitalSpeed = 3;
    this.invincibleTimer = 0;
    this.attackTimer = 0;
    this.dashCooldown = 0;
    this.dashDuration = 0;
    this.dashDir = { x: 0, y: 0 };
    this.dashSpeed = 600;
    this.baseDashCooldown = 2.5;
    this.moveAngle = 0;
    this.alive = true;

    // --- Animation / sprite state ---
    this.facing = 'S';          // last-known 8-direction facing, used for idle/attack
    this.animState = 'idle';    // 'idle' | 'walk' | 'attack' | 'dash'
    this.walkCycleTimer = 0;
    this.walkFrame = 0;         // alternates 0/1 between the 'walk' and 'run' sheets
    this.dashFrameTimer = 0;
    this.dashFrame = 0;         // alternates 0/1 between the 'jump' and 'fall' sheets
    this.attackAnimTimer = 0;   // counts down while the slash pose should be shown
  }

  get speed() { return this.baseSpeed * this.speedMult; }
  get damage() { return this.baseDamage * this.damageMult; }
  get attackSpeed() { return this.baseAttackSpeed / this.attackSpeedMult; }
  get attackRange() { return this.baseAttackRange; }
  get projectileSpeed() { return this.baseProjectileSpeed; }

  update(dt, enemies, projectiles, particles, cam, audio, floatingNumbers) {
    if (!this.alive) return;
    this.invincibleTimer -= dt;
    this.dashCooldown -= dt;
    this.attackAnimTimer -= dt;

    let mx = input.moveX;
    let my = input.moveY;
    const len = Math.hypot(mx, my);
    if (len > 1) { mx /= len; my /= len; }

    let moving = false;

    if (this.dashDuration > 0) {
      this.dashDuration -= dt;
      this.x += this.dashDir.x * this.dashSpeed * dt;
      this.y += this.dashDir.y * this.dashSpeed * dt;
      moving = true;
      for (const e of enemies) {
        if (!e.alive) continue;
        if (dist(this, e) < this.size + e.size) {
          if (this.dashDamage > 0) {
            e.takeDamage(this.dashDamage, this, particles, cam, audio);
          }
        }
      }
    } else if (len > 0.1) {
      this.x += mx * this.speed * dt;
      this.y += my * this.speed * dt;
      this.moveAngle = Math.atan2(my, mx);
      moving = true;
    }

    this.x = clamp(this.x, 20, G.worldSize - 20);
    this.y = clamp(this.y, 20, G.worldSize - 20);

    if (input.getDash() && this.dashCooldown <= 0 && this.dashDuration <= 0 && len > 0.1) {
      this.dashDuration = 0.18;
      this.dashCooldown = this.baseDashCooldown;
      this.dashDir = { x: mx, y: my };
      if (len <= 0.1) { this.dashDir = { x: 1, y: 0 }; }
      this.invincibleTimer = 0.2;
      audio.play('dash');
      particles.emit(this.x, this.y, 10, { speed: 150, life: 0.3, color: '#7c4dff', size: 6 });
    }

    this.attackTimer -= dt;

    let nearest = null;
    let nearDist = this.attackRange + 50;
    for (const e of enemies) {
      if (!e.alive) continue;
      const d = dist(this, e);
      if (d < nearDist) { nearDist = d; nearest = e; }
    }

    if (nearest && this.attackTimer <= 0) {
      this.attackTimer = this.attackSpeed;
      const a = angle(this, nearest);
      this.facing = angleToDir8(a);
      this.attackAnimTimer = Math.min(0.25, this.attackSpeed * 0.8);
      audio.play('slash');

      // Melee slash: hit the nearest enemies within range. `pierce` widens
      // how many foes a single swing can cleave through; `projectileCount`
      // (renamed in spirit to "extra hits") lands additional quick swings.
      const hitCap = 1 + this.pierce;
      const candidates = enemies
        .filter(e => e.alive && dist(this, e) <= this.attackRange)
        .sort((e1, e2) => dist(this, e1) - dist(this, e2))
        .slice(0, hitCap);

      const swings = Math.max(1, this.projectileCount);
      for (let s = 0; s < swings; s++) {
        for (const e of candidates) {
          if (!e.alive) continue;
          e.takeDamage(this.damage, this, particles, cam, audio);
          if (floatingNumbers) {
            floatingNumbers.push(new FloatingNumber(e.x, e.y - e.size - 8, Math.round(this.damage).toString(), '#5ce1ff'));
          }
          if (this.lifesteal > 0) {
            this.hp = Math.min(this.maxHp, this.hp + this.damage * this.lifesteal);
          }
          if (Math.random() < this.explosiveChance) {
            const radius = 60 * this.aoeRadiusMult;
            particles.emitExplosion(e.x, e.y, radius, { speed: 180, count: 15, color: '#c62828', life: 0.4, size: 5 });
            audio.play('explosion');
            cam.shake(6);
            for (const e2 of enemies) {
              if (!e2.alive || e2 === e) continue;
              const d = dist(e, e2);
              if (d < radius) {
                const falloff = 1 - d / radius;
                e2.takeDamage(this.damage * 0.5 * falloff, this, particles, cam, audio);
              }
            }
          }
        }
      }

      // Cyan slash-arc particles, swept across the facing direction.
      for (let i = 0; i < 12; i++) {
        const spread = a + (i / 11 - 0.5) * 1.4;
        const dpx = this.x + Math.cos(spread) * (this.attackRange * 0.35);
        const dpy = this.y + Math.sin(spread) * (this.attackRange * 0.35);
        particles.emit(dpx, dpy, 1, { speed: 40, life: 0.18, color: '#5ce1ff', size: 4, glow: true });
      }
    }

    // --- Animation state machine ---
    if (this.dashDuration > 0) {
      this.animState = 'dash';
      this.facing = angleToDir8(Math.atan2(this.dashDir.y, this.dashDir.x));
      this.dashFrameTimer -= dt;
      if (this.dashFrameTimer <= 0) {
        this.dashFrameTimer = 0.09;
        this.dashFrame = 1 - this.dashFrame;
      }
    } else if (this.attackAnimTimer > 0) {
      this.animState = 'attack';
    } else if (moving) {
      this.animState = 'walk';
      this.facing = angleToDir8(this.moveAngle);
      this.walkCycleTimer -= dt;
      const cycleSpeed = clamp(0.32 - this.speed / 1400, 0.1, 0.3);
      if (this.walkCycleTimer <= 0) {
        this.walkCycleTimer = cycleSpeed;
        this.walkFrame = 1 - this.walkFrame;
      }
    } else {
      this.animState = 'idle';
    }

    if (this.hp < this.maxHp && this.regen > 0) {
      this.hp = Math.min(this.maxHp, this.hp + this.regen * dt);
    }

    if (this.hp <= 0) {
      this.alive = false;
    }
  }
}
