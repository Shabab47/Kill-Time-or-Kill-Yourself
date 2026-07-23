class WaveManager {
  constructor(difficulty) {
    this.diff = difficulty || DIFFICULTIES.midnight;
    this.wave = 0;
    this.enemiesRemaining = 0;
    this.spawned = 0;
    this.spawnCount = 0;
    this.spawnTimer = 0;
    this.spawnInterval = 0.4;
    this.betweenWaves = false;
    this.waveDelay = 0;
    this.announcing = false;
    this.announceTimer = 0;
  }

  startNextWave() {
    this.wave++;
    this.spawned = 0;
    this.spawnCount = Math.max(1, 3 + this.wave * 2 + this.diff.spawnBonus);
    if (this.wave % 5 === 0) {
      this.spawnCount += 1;
    }
    this.spawnTimer = 0;
    this.spawnInterval = Math.max(0.15, (0.5 - this.wave * 0.01) * this.diff.spawnIntervalMult);
    this.betweenWaves = false;
    this.announcing = true;
    this.announceTimer = 1.5;
    return this.wave;
  }

  update(dt, enemies, player, particles, cam, audio) {
    const aliveEnemies = enemies.filter(e => e.alive).length;
    this.enemiesRemaining = aliveEnemies;

    if (this.announcing) {
      this.announceTimer -= dt;
      if (this.announceTimer <= 0) {
        this.announcing = false;
      }
      return;
    }

    if (this.betweenWaves) {
      this.waveDelay -= dt;
      if (this.waveDelay <= 0) {
        this.startNextWave();
      }
      return;
    }

    if (this.spawned < this.spawnCount) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawnTimer = this.spawnInterval;
        this.spawnEnemy(enemies, player);
        this.spawned++;
      }
    } else if (this.enemiesRemaining === 0) {
      this.betweenWaves = true;
      this.waveDelay = 2;
    }
  }

  spawnEnemy(enemies, player) {
    const isBoss = this.wave % 5 === 0 && this.spawned === this.spawnCount - 1;
    let type;
    if (isBoss) { type = 'lich'; } else {
      const r = Math.random();
      if (this.wave < 3) type = 'skeleton';
      else if (r < 0.4) type = 'skeleton';
      else if (r < 0.65) type = 'cultist';
      else if (r < 0.82) type = 'hound';
      else type = 'knight';
    }

    const a = rand(0, TAU);
    const d = 500 + rand(0, 200);
    let x = player.x + Math.cos(a) * d;
    let y = player.y + Math.sin(a) * d;
    x = clamp(x, 30, G.worldSize - 30);
    y = clamp(y, 30, G.worldSize - 30);
    enemies.push(new ENEMY_CLASSES[type](x, y, this.wave, this.diff));
  }
}
