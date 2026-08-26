class ChaserEnemy extends Enemy {
  update(dt, player, enemies, projectiles, particles, cam, audio) {
    super.update(dt, player, enemies, projectiles, particles, cam, audio);
    if (!this.alive) return;
    const d = dist(this, player);
    if (player.alive && d > this.size + player.size + 5) {
      const a = angle(this, player);
      this.x += Math.cos(a) * this.speed * dt;
      this.y += Math.sin(a) * this.speed * dt;
    }
  }
}

class Skeleton extends ChaserEnemy {
  constructor(x, y, wave, difficulty) {
    super('skeleton', x, y, wave, difficulty);
    this.facing = 'S';
    this.animState = 'idle';
    this.animFrame = 0;
    this.animTimer = 0;
    this.animSpeed = 0.12;
    this.dying = false;
    this.deathTimer = 0;
    this.attackTimer = 0;
  }

  takeDamage(dmg, source, particles, cam, audio) {
    if (this.dying) return;
    this.hp -= dmg;
    this.hitFlash = 0.08;
    if (this.hp <= 0) {
      this.dying = true;
      this.deathTimer = 0.4;
      this.animState = 'dead';
      this.animFrame = 0;
    } else {
      audio.play(this.type + '_hit');
      particles.emit(this.x, this.y, 5, { speed: 80, life: 0.3, color: '#ce93d8', size: 3 });
    }
  }

  update(dt, player, enemies, projectiles, particles, cam, audio) {
    if (this.dying) {
      this.hitFlash -= dt;
      this.deathTimer -= dt;
      if (this.deathTimer <= 0) {
        this.alive = false;
        audio.play(this.type + '_kill');
        particles.emit(this.x, this.y, 12, { speed: 120, life: 0.5, color: this.color, size: 4 });
      }
      return;
    }

    super.update(dt, player, enemies, projectiles, particles, cam, audio);
    if (!this.alive) return;

    const a = angle(this, player);
    this.facing = angleToDir8(a);

    this.attackTimer -= dt;

    if (this.hitFlash > 0) {
      this.animState = 'hit';
      this.animFrame = 0;
      this.animTimer = 0;
    } else if (this.attackTimer > 0) {
      this.animState = 'attack';
      this.animFrame = 0;
    } else {
      const d = dist(this, player);
      if (player.alive && d > this.size + player.size + 5) {
        this.animState = 'run';
        this.animTimer -= dt;
        if (this.animTimer <= 0) {
          const frameCount = getEnemyFrameCount('skeleton', 'run', this.facing);
          this.animFrame = (this.animFrame + 1) % frameCount;
          this.animTimer = this.animSpeed;
        }
      } else {
        this.animState = 'idle';
        this.animFrame = 0;
        this.animTimer = 0;
        if (player.alive && d < this.size + player.size + 8) {
          this.attackTimer = 0.35;
        }
      }
    }
  }
}

class Hound extends ChaserEnemy {
  constructor(x, y, wave, difficulty) { super('hound', x, y, wave, difficulty); }
}

class Knight extends ChaserEnemy {
  constructor(x, y, wave, difficulty) { super('knight', x, y, wave, difficulty); }
}
