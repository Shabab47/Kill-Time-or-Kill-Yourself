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
    this.x = clamp(this.x, 10, G.worldSize - 10);
    this.y = clamp(this.y, 10, G.worldSize - 10);
  }
}

class Skeleton extends ChaserEnemy {
  constructor(x, y, wave, difficulty) { super('skeleton', x, y, wave, difficulty); }
}

class Hound extends ChaserEnemy {
  constructor(x, y, wave, difficulty) { super('hound', x, y, wave, difficulty); }
}

class Knight extends ChaserEnemy {
  constructor(x, y, wave, difficulty) { super('knight', x, y, wave, difficulty); }
}
