class Cultist extends Enemy {
  constructor(x, y, wave, difficulty) {
    super('cultist', x, y, wave, difficulty);
    this.shootRange = G.enemyBase.cultist.shootRange;
    this.shootInterval = G.enemyBase.cultist.shootInterval;
    this.shootTimer = rand(0, 0.5);
  }

  update(dt, player, enemies, projectiles, particles, cam, audio) {
    super.update(dt, player, enemies, projectiles, particles, cam, audio);
    if (!this.alive) return;
    const d = dist(this, player);

    if (d < this.shootRange && d > this.size + player.size + 40) {
      this.shootTimer -= dt;
      if (this.shootTimer <= 0) {
        this.shootTimer = this.shootInterval;
        const a = angle(this, player);
        projectiles.push({
          x: this.x, y: this.y,
          vx: Math.cos(a) * 300, vy: Math.sin(a) * 300,
          damage: this.damage * 0.7,
          pierceLeft: 0,
          size: 4,
          life: 2,
          alive: true, hit: new Set(),
          color: '#e040fb',
          explosive: false,
          owner: 'enemy'
        });
      }
    } else {
      this.shootTimer = 0.3;
    }

    let move = true;
    if (d < this.shootRange && d > 150) move = false;
    if (move && player.alive) {
      const a = angle(this, player);
      const spd = d < 100 ? -this.speed * 0.5 : this.speed;
      if (d > this.size + player.size + 5 || true) {
        this.x += Math.cos(a) * spd * dt;
        this.y += Math.sin(a) * spd * dt;
      }
    }
  }
}
