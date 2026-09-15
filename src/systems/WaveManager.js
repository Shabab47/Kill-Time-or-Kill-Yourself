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
    this.timeAlive = 0;       // elapsed survival seconds (drives per-minute pacing)
    // Smoothed edge-placement samplers (VS "LoopedSpawnX"): an irrational
    // stride walks along the edge so enemies never clump in one spot.
    this.loopedSpawnX = Math.random();
    this.loopedSpawnY = Math.random();
    // Constant-pressure systems (Vampire Survivors-style):
    this.trickleTimer = 1.5;      // background stream that never stops
    this.nextSwarmAt = 60;        // first ring-swarm event at 1:00
    this.swarmPeriod = 60;        // then every minute after
  }

  // Active on-screen enemies at or above the hard cap.
  get atEnemyCap() {
    return this.enemiesRemaining >= G.maxEnemies;
  }

  // Vampire Survivors placement: pick one camera axis as a fixed outer edge,
  // randomize the coordinate on the opposite axis, and randomize the side.
  // Enemies therefore materialize on any of the four edges, just off-view.
  //
  // The free-axis coordinate is *smoothed*: instead of pure randomness, the
  // position walks along the edge with a low-discrepancy stride so enemy
  // arrivals spread evenly instead of bunching (VS GetHorizontal/Vertical
  // SmoothedSpawnPosition + LoopedSpawnX). On some waves a "fixed" layout is
  // used, snapping spawns to a few narrow bands like VS's
  // GetHorizontal/VerticalFixedSpawnLocations.
  spawnPositionAtEdge(player) {
    const halfWidth = DW() / RENDER_SCALE / 2 + G.edgeSpawnMargin;
    const halfHeight = DH() / RENDER_SCALE / 2 + G.edgeSpawnMargin;

    // Advance the smoothed samplers for even distribution over time.
    this.loopedSpawnX = (this.loopedSpawnX + G.spawnSmoothing) % 1;
    this.loopedSpawnY = (this.loopedSpawnY + G.spawnSmoothing) % 1;

    const useFixedBands = this.wave % 3 === 0 && Math.random() < 0.35;
    const freeCoord = (min, max) => {
      const t = useFixedBands
        ? (Math.floor(this.loopedSpawnX * 3) + Math.random() * 0.2) / 3
        : this.loopedSpawnX;
      return min + t * (max - min);
    };

    if (Math.random() < 0.5) {
      // Y pinned to the top/bottom edge while X wanders across the view span.
      return {
        x: player.x + freeCoord(-halfWidth, halfWidth),
        y: player.y + (Math.random() < 0.5 ? -halfHeight : halfHeight)
      };
    }
    // X pinned to the left/right edge while Y wanders.
    return {
      x: player.x + (Math.random() < 0.5 ? -halfWidth : halfWidth),
      y: player.y + freeCoord(-halfHeight, halfHeight)
    };
  }

  startNextWave() {
    this.wave++;
    this.spawnedThisWave = 0;
    const elapsedMinutes = Math.floor(this.timeAlive / 60);
    // Every 5th wave adds one extra spawn — the slot that becomes the boss.
    const extraBossSpawn = (this.wave % 5 === 0) ? 1 : 0;
    // Batch size grows per wave AND per minute survived (VS EnemiesToSpawnAmount).
    this.totalToSpawn = Math.max(
      1,
      3 + this.wave * 2 + elapsedMinutes + this.diff.spawnBonus + extraBossSpawn
    );
    this.spawnTimer = 0;
    // Timed pacing: tighten every wave AND every full minute survived, so
    // the pressure ramps exactly like Vampire Survivors' minute clock.
    this.spawnInterval = Math.max(
      0.15,
      (0.5 - this.wave * 0.01 - elapsedMinutes * 0.02) * this.diff.spawnIntervalMult
    );
    this.waitingBetweenWaves = false;
    this.announcing = true;
    this.announceTimer = 1.2;   // shorter breather: pressure never really lifts
    return this.wave;
  }

  update(deltaTime, enemies, player, particles, cam, audio, game) {
    this.enemiesRemaining = enemies.filter((enemy) => enemy.alive).length;
    if (game && player && player.alive) this.timeAlive += deltaTime;

    // Trickle stream + timed swarm events run regardless of wave state so
    // there is NEVER a safe moment.
    if (game && player && player.alive) {
      // The cap pauses regular units but never the timed ring events.
      if (!this.atEnemyCap) {
        this.runTrickleStream(deltaTime, enemies, player, game);
      }
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
      // Time-gated waves: the next wave always starts on schedule, whether or
      // not the current batch is dead (Vampire Survivors never waits for you).
      this.timeUntilNextWave -= deltaTime;
      if (this.timeUntilNextWave <= 0) {
        this.startNextWave();
      }
      return;
    }

    if (this.spawnedThisWave < this.totalToSpawn) {
      this.spawnTimer -= deltaTime;
      if (this.spawnTimer <= 0) {
        // Cap guard: while at the cap the timer keeps draining so spawning
        // resumes the instant the horde thins back below it.
        if (!this.atEnemyCap) {
          this.spawnTimer = this.spawnInterval;
          this.spawnEnemy(enemies, player, game);
          this.spawnedThisWave++;
        }
      }
    } else {
      // Wave finished spawning — countdown to the next timed wave.
      this.waitingBetweenWaves = true;
      this.timeUntilNextWave = G.spaceBetweenWaves || 0.8;
    }
  }

  runTrickleStream(deltaTime, enemies, player, game) {
    this.trickleTimer -= deltaTime;
    if (this.trickleTimer > 0) return;
    // Speeds up over time but never stops entirely.
    this.trickleTimer = Math.max(0.9, 2.4 - this.wave * 0.08 - game.gameTime * 0.002);
    const pos = this.spawnPositionAtEdge(player);
    const survivalBonus = Math.floor(game.gameTime / G.timeScaleWaveBonus);
    const type = this.rollRegularEnemyType();
    enemies.push(new ENEMY_CLASSES[type](
      pos.x,
      pos.y,
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

    const pos = this.spawnPositionAtEdge(player);

    // Vampire-Survivors-style ramp: longer runs keep getting deadlier even
    // within the same wave number.
    const survivalBonus = game ? Math.floor(game.gameTime / G.timeScaleWaveBonus) : 0;
    const enemy = new ENEMY_CLASSES[enemyType](pos.x, pos.y, this.wave + survivalBonus, this.diff);

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

  // The bestiary unlocks and shifts every full minute survived (timed pools).
  rollRegularEnemyType() {
    const minutes = Math.floor(this.timeAlive / 60);
    if (minutes < 1) return 'skeleton'; // the first minute is skeleton-only
    const roll = Math.random();
    if (roll < 0.4) return 'skeleton';
    if (roll < 0.65) return 'cultist';
    if (roll < 0.82) return 'hound';
    return 'knight';
  }
}