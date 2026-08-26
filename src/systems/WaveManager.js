class WaveManager {
  constructor(difficulty) {
    this.diff = difficulty || DIFFICULTIES.midnight;
    this.wave = 0;
    this.enemiesRemaining = 0;
    this.spawnedThisWave = 0;
    this.totalToSpawn = 0;
    this.spawnTimer = 0;
    this.spawnInterval = 0.4;
    this.waitingBetweenWaves = false;
    this.timeUntilNextWave = 0;
    this.announcing = false;
    this.announceTimer = 0;
    // Constant-pressure systems (Vampire Survivors-style):
    this.trickleTimer = 1.5;      // background stream that never stops
    this.nextSwarmAt = 60;        // first ring-swarm event at 1:00
    this.swarmPeriod = 60;        // then every minute after
  }

  startNextWave() {
    this.wave++;
    this.spawnedThisWave = 0;
    // Every 5th wave adds one extra spawn — the slot that becomes the boss.
    const extraBossSpawn = (this.wave % 5 === 0) ? 1 : 0;
    this.totalToSpawn = Math.max(1, 3 + this.wave * 2 + this.diff.spawnBonus + extraBossSpawn);
    this.spawnTimer = 0;
    this.spawnInterval = Math.max(0.15, (0.5 - this.wave * 0.01) * this.diff.spawnIntervalMult);
    this.waitingBetweenWaves = false;
    this.announcing = true;
    this.announceTimer = 1.2;   // shorter breather: pressure never really lifts
    return this.wave;
  }

  update(deltaTime, enemies, player, particles, cam, audio, game) {
    this.enemiesRemaining = enemies.filter((enemy) => enemy.alive).length;

    // Trickle stream + timed swarm events run regardless of wave state so
    // there is NEVER a safe moment.
    if (game && player && player.alive) {
      this.runTrickleStream(deltaTime, enemies, player, game);
      if (game.gameTime >= this.nextSwarmAt) {
        this.nextSwarmAt += this.swarmPeriod;
        this.triggerSwarm(enemies, player, game);
        game.showSwarmBanner('THE CIRCLE CLOSES IN…');
      }
    }

    if (this.announcing) {
      this.announceTimer -= deltaTime;
      if (this.announceTimer <= 0) {
        this.announcing = false;
      }
      return;
    }

    if (this.waitingBetweenWaves) {
      this.timeUntilNextWave -= deltaTime;
      if (this.timeUntilNextWave <= 0) {
        this.startNextWave();
      }
      return;
    }

    if (this.spawnedThisWave < this.totalToSpawn) {
      this.spawnTimer -= deltaTime;
      if (this.spawnTimer <= 0) {
        this.spawnTimer = this.spawnInterval;
        this.spawnEnemy(enemies, player, game);
        this.spawnedThisWave++;
      }
    } else if (this.enemiesRemaining === 0) {
      // Brief breather only — the trickle keeps enemies coming anyway.
      this.waitingBetweenWaves = true;
      this.timeUntilNextWave = 0.8;
    }
  }

  runTrickleStream(deltaTime, enemies, player, game) {
    this.trickleTimer -= deltaTime;
    if (this.trickleTimer > 0) return;
    // Speeds up over time but never stops entirely.
    this.trickleTimer = Math.max(0.9, 2.4 - this.wave * 0.08 - game.gameTime * 0.002);
    const spawnAngle = rand(0, TAU);
    const spawnDistance = rand(550, 750);
    const survivalBonus = Math.floor(game.gameTime / G.timeScaleWaveBonus);
    const type = this.rollRegularEnemyType();
    enemies.push(new ENEMY_CLASSES[type](
      player.x + Math.cos(spawnAngle) * spawnDistance,
      player.y + Math.sin(spawnAngle) * spawnDistance,
      this.wave + survivalBonus,
      this.diff
    ));
  }

  // Classic Vampire Survivors moment: a full ring of foes closes in around
  // the player from every direction at once.
  triggerSwarm(enemies, player, game) {
    const SWARM_RADIUS = 430;
    const count = 12 + this.wave * 2;
    const survivalBonus = Math.floor(game.gameTime / G.timeScaleWaveBonus);
    for (let i = 0; i < count; i++) {
      const angleOnRing = (i / count) * TAU;
      const type = ['skeleton', 'hound', 'skeleton', 'cultist'][i % 4];
      enemies.push(new ENEMY_CLASSES[type](
        player.x + Math.cos(angleOnRing) * SWARM_RADIUS,
        player.y + Math.sin(angleOnRing) * SWARM_RADIUS,
        this.wave + survivalBonus,
        this.diff
      ));
    }
  }

  spawnEnemy(enemies, player, game) {
    const isBossWave = this.wave % 5 === 0;
    const isLastSpawnOfWave = this.spawnedThisWave === this.totalToSpawn - 1;
    let enemyType;
    if (isBossWave && isLastSpawnOfWave) {
      enemyType = 'lich';
    } else {
      enemyType = this.rollRegularEnemyType();
    }

    // Spawn in a ring just off-screen around the player — no world bounds.
    const SPAWN_MIN_DISTANCE = 500;
    const SPAWN_DISTANCE_VARIANCE = 200;
    const spawnAngle = rand(0, TAU);
    const spawnDistance = SPAWN_MIN_DISTANCE + rand(0, SPAWN_DISTANCE_VARIANCE);
    const spawnX = player.x + Math.cos(spawnAngle) * spawnDistance;
    const spawnY = player.y + Math.sin(spawnAngle) * spawnDistance;

    // Vampire-Survivors-style ramp: longer runs keep getting deadlier even
    // within the same wave number.
    const survivalBonus = game ? Math.floor(game.gameTime / G.timeScaleWaveBonus) : 0;
    const enemy = new ENEMY_CLASSES[enemyType](spawnX, spawnY, this.wave + survivalBonus, this.diff);

    // Elites: mid-wave bruisers with huge HP that guarantee a treasure chest.
    const eliteSlot = Math.floor(this.totalToSpawn / 2);
    const eliteRoll = this.wave >= 3 && !isBossWave && this.spawnedThisWave === eliteSlot && Math.random() < 0.35;
    if (eliteRoll) {
      enemy.elite = true;
      enemy.hp *= 7;
      enemy.maxHp *= 7;
      enemy.size *= 1.55;
      enemy.damage *= 1.5;
      enemy.speed *= 0.9;
      enemy.xpValue *= 6;
    }

    enemies.push(enemy);
  }

  rollRegularEnemyType() {
    if (this.wave < 3) return 'skeleton'; // early waves are skeleton-only
    const roll = Math.random();
    if (roll < 0.4) return 'skeleton';
    if (roll < 0.65) return 'cultist';
    if (roll < 0.82) return 'hound';
    return 'knight';
  }
}
