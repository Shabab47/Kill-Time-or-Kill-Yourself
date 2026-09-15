class Lich extends Enemy {
  constructor(x, y, wave, difficulty) {
    super('lich', x, y, wave, difficulty);
    this.phase = 1;
    this.maxPhaseHp = this.maxHp;
    this.summonTimer = 0;
    this.summonInterval = 4;
    this.teleportTimer = 3;
    this.teleportCooldown = 4;
    this.burstTimer = 0;
    this.burstInterval = 1.2;
    this.burstCount = 0;
    this.maxBurstCount = 4;
    this.phaseTransitioned = false;
  }

  takeDamage(dmg, source, particles, cam, audio) {
    const prevHp = this.hp;
    super.takeDamage(dmg, source, particles, cam, audio);
    if (!this.alive) return;

    const ratio = this.hp / this.maxHp;
    if (ratio <= 0.33 && this.phase < 3) {
      this.phase = 3;
      this.phaseTransitioned = true;
      particles.emitExplosion(this.x, this.y, 120, { speed: 250, count: 30, color: '#e040fb', life: 0.8, size: 7 });
      cam.shake(12);
      audio.play('explosion');
    } else if (ratio <= 0.66 && this.phase < 2) {
      this.phase = 2;
      this.phaseTransitioned = true;
      particles.emitExplosion(this.x, this.y, 80, { speed: 200, count: 20, color: '#7c4dff', life: 0.6, size: 6 });
      cam.shake(8);
    }
  }

  update(dt, player, enemies, projectiles, particles, cam, audio) {
    super.update(dt, player, enemies, projectiles, particles, cam, audio);
    if (!this.alive) return;

    const d = dist(this, player);

    if (this.phaseTransitioned) {
      this.phaseTransitioned = false;
      if (this.phase === 3) this.teleportNear(player);
    }

    switch (this.phase) {
      case 1:
        this.phase1Behavior(dt, player, particles);
        break;
      case 2:
        this.phase2Behavior(dt, player, enemies, particles, cam, audio);
        break;
      case 3:
        this.phase3Behavior(dt, player, enemies, projectiles, particles, cam, audio);
        break;
    }

    particles.emit(this.x + rand(-10, 10), this.y + rand(-10, 10), 1, {
      speed: 15, life: 1.0, color: this.phase === 3 ? '#e040fb' : this.phase === 2 ? '#7c4dff' : '#4a148c',
      size: 6, glow: true, shrink: false
    });
  }

  phase1Behavior(dt, player, particles) {
    if (player.alive && dist(this, player) > this.size + player.size) {
      const a = angle(this, player);
      this.x += Math.cos(a) * this.speed * dt;
      this.y += Math.sin(a) * this.speed * dt;
    }
  }

  phase2Behavior(dt, player, enemies, particles, cam, audio) {
    this.phase1Behavior(dt, player, particles);

    this.summonTimer -= dt;
    if (this.summonTimer <= 0) {
      this.summonTimer = Math.max(2, this.summonInterval - (3 - this.phase) * 0.5);
      const types = ['skeleton', 'hound'];
      const count = 2 + (this.phase - 2);
      for (let i = 0; i < count; i++) {
        const a = angle(this, player) + rand(-0.5, 0.5);
        const sx = this.x + Math.cos(a) * rand(80, 120);
        const sy = this.y + Math.sin(a) * rand(80, 120);
        enemies.push(new ENEMY_CLASSES[choose(types)](sx, sy, 1));
      }
      particles.emit(this.x, this.y, 8, { speed: 100, life: 0.4, color: '#7c4dff', size: 5 });
      audio.play('dash');
    }
  }

  phase3Behavior(dt, player, enemies, projectiles, particles, cam, audio) {
    this.teleportTimer -= dt;
    if (this.teleportTimer <= 0) {
      this.teleportTimer = this.teleportCooldown;
      this.teleportNear(player);
      particles.emitExplosion(this.x, this.y, 60, { speed: 200, count: 15, color: '#e040fb', life: 0.4, size: 5 });
      cam.shake(6);
      audio.play('explosion');
    }

    this.burstTimer -= dt;
    if (this.burstTimer <= 0) {
      this.burstTimer = this.burstInterval;
      this.burstCount = 0;
    }

    if (this.burstCount < this.maxBurstCount && player.alive) {
      const burstAngle = angle(this, player) + (this.burstCount - (this.maxBurstCount - 1) / 2) * 0.12;
      projectiles.push({
        x: this.x, y: this.y,
        vx: Math.cos(burstAngle) * 320, vy: Math.sin(burstAngle) * 320,
        damage: this.damage * 0.6,
        pierceLeft: 0,
        size: 4,
        life: 2.5,
        alive: true, hit: new Set(),
        color: '#e040fb',
        explosive: false,
        owner: 'enemy'
      });
      this.burstCount++;
    }

    this.phase2Behavior(dt, player, enemies, particles, cam, audio);
  }

  teleportNear(player) {
    const a = rand(0, TAU);
    const d = rand(100, 200);
    this.x = player.x + Math.cos(a) * d;
    this.y = player.y + Math.sin(a) * d;
  }
}
