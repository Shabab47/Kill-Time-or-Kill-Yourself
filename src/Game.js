class Game {
  constructor() {
    this.renderer = new Renderer();
    this.difficultyId = 'midnight';
    this.difficulty = DIFFICULTIES.midnight;
    this.resetRunState();
    this.cacheUiElements();
    this.state = 'menu';
    this.gameTime = 0;
    this.latestRunRank = -1;
  }

  // Single place that (re)initializes everything belonging to one playthrough,
  // shared by the constructor, start(), and goToMenu().
  resetRunState() {
    this.player = null;
    this.enemies = [];
    this.projectiles = [];
    this.xpOrbs = [];
    this.items = [];
    this.obstacles = [];
    this.obstacleChunkCache = new Map(); // endless world: per-chunk obstacle cache
    this.swarmBannerUntil = 0;
    this.floatingNumbers = [];
    this.particles = new ParticleSystem();
    this.cam = new Camera();
    this.waveManager = new WaveManager(this.difficulty);
    this.orbitals = [];
    this.lightningStrikes = [];
    this.kills = 0;
    this.xp = 0;
    this.level = 1;
    this.upgradeStacks = {};
    this.bossAlive = false;
    this.gameTime = 0;
    this.lastSoulArrowPos = null;
    this.lastFrameTimeMs = undefined;
    // Per-weapon cooldown state (whip/axe/garlic/fire wand timers).
    this.weaponTimers = {};
    this.whipSide = 1;
  }

  // Look up all DOM nodes once instead of on every HUD tick.
  cacheUiElements() {
    const byId = (elementId) => document.getElementById(elementId);
    this.ui = {
      startScreen: byId('start-screen'),
      difficultyPanel: byId('diff-panel'),
      gameOverScreen: byId('game-over'),
      upgradePanel: byId('upgrade-panel'),
      pausePanel: byId('pause-panel'),
      upgradeChoices: byId('upgrade-choices'),
      hpBarFill: byId('hp-fill'),
      xpBarFill: byId('xp-fill'),
      levelLabel: byId('hud-level'),
      waveLabel: byId('hud-wave'),
      killsLabel: byId('hud-kills'),
      waveAnnouncement: byId('wave-announce'),
      waveAnnouncementNumber: byId('wave-num'),
      waveAnnouncementText: document.querySelector('#wave-announce span'),
      swarmBanner: byId('swarm-banner'),
      survivalTimer: byId('hud-timer'),
      inventoryBar: byId('hud-inventory'),
      finalWavesLabel: byId('final-waves'),
      finalKillsLabel: byId('final-kills'),
      finalLevelLabel: byId('final-level')
    };
  }

  setElementVisible(element, visible) {
    element.style.display = visible ? 'flex' : 'none';
  }

  hideAllOverlays() {
    this.setElementVisible(this.ui.startScreen, false);
    this.setElementVisible(this.ui.difficultyPanel, false);
    this.setElementVisible(this.ui.gameOverScreen, false);
    this.setElementVisible(this.ui.upgradePanel, false);
    this.setElementVisible(this.ui.pausePanel, false);
  }

  start(difficultyId, characterId) {
    audio.init();
    this.difficultyId = difficultyId || 'midnight';
    this.difficulty = DIFFICULTIES[this.difficultyId] || DIFFICULTIES.midnight;
    this.characterId = findCharacter(characterId).id;
    this.resetRunState();
    const character = findCharacter(this.characterId);
    this.player = new Player(character);
    this.refreshActiveObstacles();
    this.hideAllOverlays();
    this.state = 'playing';
    this.waveManager.startNextWave();
    this.updateHUD();
  }

  // Build the level-up choice pool the Vampire-Survivors way: new weapons
  // appear only while slots remain, owned weapons/passives can level up.
  buildUpgradePool() {
    const player = this.player;
    const weaponCount = Object.keys(player.weapons).length;
    const passiveCount = Object.keys(player.passives).length;

    const pool = [];
    for (const def of WEAPONS) {
      const level = player.weapons[def.id] || 0;
      if (level === 0 && weaponCount < G.maxWeapons) pool.push(def);
      else if (level > 0 && level < def.maxLevel) pool.push(def);
    }
    for (const def of PASSIVES) {
      const level = player.passives[def.id] || 0;
      if (level === 0 && passiveCount < G.maxPassives) pool.push(def);
      else if (level > 0 && level < def.maxLevel) pool.push(def);
    }
    return pool;
  }

  getUpgradeChoices(choiceCount = 4) {
    const pool = this.buildUpgradePool();
    if (pool.length <= choiceCount) return pool;
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, choiceCount);
  }

  applyUpgrade(entry) {
    if (!entry) return this.resumeFromUpgradeScreen();
    const player = this.player;
    if (entry.kind === 'heal') {
      player.hp = Math.min(player.maxHp, player.hp + 50);
      this.floatingNumbers.push(new FloatingNumber(player.x, player.y - 24, '+50 HP', '#66bb6a'));
    } else {
      const map = entry.kind === 'weapon' ? player.weapons : player.passives;
      map[entry.id] = (map[entry.id] || 0) + 1;
      entry.apply(player);
    }
    audio.play('levelup');
    this.particles.emit(player.x, player.y, 30, { speed: 200, life: 0.8, color: '#ce93d8', size: 5, glow: true });
    this.resumeFromUpgradeScreen();
  }

  resumeFromUpgradeScreen() {
    this.setElementVisible(this.ui.upgradePanel, false);
    if (this.state === 'upgrade') this.state = 'playing';
    this.updateHUD();
  }

  showUpgradeScreen() {
    this.state = 'upgrade';
    const choices = this.getUpgradeChoices(4);
    // Everything maxed out: offer a heal instead of an empty screen.
    if (choices.length === 0) {
      choices.push({ kind: 'heal', id: 'heal', name: 'Dark Communion', icon: '❤️', desc: 'Restore 50 HP' });
    }
    const container = this.ui.upgradeChoices;
    container.innerHTML = '';
    for (const entry of choices) {
      const card = document.createElement('div');
      card.className = 'upgrade-card';
      let badge;
      if (entry.kind === 'heal') {
        badge = '❤️ +50';
      } else {
        const owned = entry.kind === 'weapon'
          ? (this.player.weapons[entry.id] || 0)
          : (this.player.passives[entry.id] || 0);
        badge = owned === 0 ? 'NEW!' : `Lv.${owned} → ${owned + 1}`;
        card.innerHTML = `<div class="kind-tag">${entry.kind}</div>`;
      }
      card.innerHTML += `
        <div class="icon">${entry.icon}</div>
        <div class="name">${entry.name}</div>
        <div class="level-badge">${badge}</div>
      `;
      // Hover reveals what the upgrade does.
      card.addEventListener('mouseenter', () => this.showUpgradeTooltip(entry, card));
      card.addEventListener('mousemove', (event) => this.moveUpgradeTooltip(event));
      card.addEventListener('mouseleave', () => this.hideUpgradeTooltip());
      card.addEventListener('click', () => this.applyUpgrade(entry));
      container.appendChild(card);
    }
    this.setElementVisible(this.ui.upgradePanel, true);
  }

  showUpgradeTooltip(entry, card) {
    const tooltip = document.getElementById('upgrade-tooltip');
    const owned = entry.kind === 'weapon'
      ? (this.player.weapons[entry.id] || 0)
      : (this.player.passives[entry.id] || 0);
    const heading = owned === 0
      ? `${entry.icon} ${entry.name}`
      : `${entry.icon} ${entry.name} — Lv.${owned} → ${owned + 1}`;
    tooltip.innerHTML = `<div class="tt-title">${heading}</div><div class="tt-desc">${entry.desc || ''}</div>`;
    tooltip.classList.add('show');
    const rect = card.getBoundingClientRect();
    this.positionUpgradeTooltip(rect.left + rect.width / 2, rect.top - 8);
  }

  moveUpgradeTooltip(event) {
    this.positionUpgradeTooltip(event.clientX, event.clientY);
  }

  positionUpgradeTooltip(clientX, clientY) {
    const tooltip = document.getElementById('upgrade-tooltip');
    tooltip.style.left = (clientX + 16) + 'px';
    tooltip.style.top = (clientY + 16) + 'px';
  }

  hideUpgradeTooltip() {
    document.getElementById('upgrade-tooltip').classList.remove('show');
  }

  // Treasure chest: grants 1/3/5 instant upgrades with a fanfare.
  openChest(x, y) {
    const roll = Math.random();
    let rewardCount;
    if (this.waveManager.wave >= 10 && roll < 0.35) rewardCount = 5;
    else if (this.waveManager.wave >= 5 || roll < 0.3) rewardCount = 3;
    else rewardCount = 1;

    for (let i = 0; i < rewardCount; i++) {
      const choices = this.getUpgradeChoices(99);
      if (choices.length === 0) {
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + 30);
        break;
      }
      this.applyUpgrade(choose(choices));
    }

    this.particles.emitExplosion(x, y, 70, { speed: 260, count: 40, color: '#c9a84c', life: 0.9, size: 6 });
    this.cam.shake(5);
    audio.play('levelup');
    this.floatingNumbers.push(new FloatingNumber(x, y - 20, `TREASURE! +${rewardCount}`, '#c9a84c', 22));
    this.updateHUD();
  }

  addXP(amount) {
    this.xp += amount / this.difficulty.xpMult;
    // Level up (and offer an upgrade) as long as enough XP has been banked.
    while (this.level < G.maxLevel && this.xp >= xpForLevel(this.level)) {
      this.xp -= xpForLevel(this.level);
      this.level++;
      this.showUpgradeScreen();
    }
    this.updateHUD();
  }

  pushApartFromObstacles(entity) {
    const COLLISION_PADDING = 2;
    for (const obstacle of this.obstacles) {
      if (!obstacle.alive) continue;
      const closestX = clamp(entity.x, obstacle.x, obstacle.x + obstacle.w);
      const closestY = clamp(entity.y, obstacle.y, obstacle.y + obstacle.h);
      const offsetX = entity.x - closestX;
      const offsetY = entity.y - closestY;
      const distanceToObstacle = Math.hypot(offsetX, offsetY);
      const overlapDepth = entity.size + COLLISION_PADDING - distanceToObstacle;

      if (overlapDepth <= 0) continue;
      if (distanceToObstacle > 0.01) {
        entity.x += (offsetX / distanceToObstacle) * overlapDepth;
        entity.y += (offsetY / distanceToObstacle) * overlapDepth;
      } else {
        entity.x += overlapDepth; // Entity is exactly inside; nudge right.
      }
    }
  }

  damagePlayer(damageAmount, sourceEnemy) {
    const player = this.player;
    if (!player.alive) return;

    // The shield absorbs one hit entirely and grants brief invulnerability.
    if (player.shieldActive) {
      player.shieldActive = false;
      player.invincibleTimer = 0.15;
      this.particles.emit(player.x, player.y, 20, { speed: 150, life: 0.6, color: '#7c4dff', size: 5, glow: true });
      audio.play('explosion');
      return;
    }
    if (player.invincibleTimer > 0) return;

    const finalDamage = damageAmount * player.armorMult;
    player.hp -= finalDamage;
    player.invincibleTimer = 0.15;
    this.cam.shake(8);
    this.particles.emit(player.x, player.y, 8, { speed: 100, life: 0.3, color: '#c62828', size: 5 });
    this.floatingNumbers.push(new FloatingNumber(player.x, player.y - 16, Math.round(finalDamage).toString(), '#c62828', 22));

    // Thorns reflect a fraction of the received damage back at the attacker.
    if (player.thorns > 0 && sourceEnemy && sourceEnemy.alive) {
      sourceEnemy.takeDamage(finalDamage * player.thorns, player, this.particles, this.cam, audio);
    }

    if (player.hp <= 0) {
      player.alive = false;
      this.gameOver();
    }
    this.updateHUD();
  }

  gameOver() {
    this.state = 'gameover';
    this.setElementVisible(this.ui.gameOverScreen, true);
    this.ui.finalWavesLabel.textContent = Math.max(0, this.waveManager.wave - 1);
    this.ui.finalKillsLabel.textContent = this.kills;
    this.ui.finalLevelLabel.textContent = this.level;
    // Record the run into the persistent local high-score table.
    this.latestRunRank = addHighScore({
      difficulty: this.difficultyId,
      time: this.gameTime,
      waves: Math.max(0, this.waveManager.wave - 1),
      kills: this.kills,
      level: this.level
    });
    this.particles.emitExplosion(this.player.x, this.player.y, 80, { speed: 250, count: 40, color: '#c62828', life: 0.8, size: 6 });
  }

  syncOrbitals() {
    const player = this.player;
    if (!player || player.orbitalCount <= 0) { this.orbitals = []; return; }

    const previousCount = this.orbitals.length;
    while (this.orbitals.length < player.orbitalCount) {
      this.orbitals.push({ angle: 0, hitTimers: new Map() });
    }
    while (this.orbitals.length > player.orbitalCount) {
      this.orbitals.pop();
    }
    // Evenly space orbitals whenever their total count changes.
    if (previousCount !== player.orbitalCount) {
      for (let index = 0; index < this.orbitals.length; index++) {
        this.orbitals[index].angle = (index / player.orbitalCount) * TAU;
      }
    }
  }

  updateOrbitals(deltaTime) {
    if (!this.player.alive) return;
    this.syncOrbitals();
    const player = this.player;
    const ORBITAL_HIT_COOLDOWN = 0.35;

    for (const orbital of this.orbitals) {
      orbital.angle += player.orbitalSpeed * deltaTime;
      if (orbital.angle > TAU) orbital.angle -= TAU;
      const fireballX = player.x + Math.cos(orbital.angle) * player.orbitalRadius;
      // Fireballs hover above the player's head rather than at their feet.
      const fireballY = (player.y - player.size * 1.4) + Math.sin(orbital.angle) * player.orbitalRadius;

      for (const enemy of this.enemies) {
        if (!enemy.alive) continue;
        const hitCooldownRemaining = orbital.hitTimers.get(enemy) || 0;
        if (hitCooldownRemaining > 0) continue;
        if (dist({ x: fireballX, y: fireballY }, enemy) >= 12 + enemy.size) continue;

        enemy.takeDamage(player.orbitalDamage, player, this.particles, this.cam, audio);
        this.floatingNumbers.push(new FloatingNumber(enemy.x, enemy.y - enemy.size - 8, Math.round(player.orbitalDamage).toString(), '#ff6d00'));
        orbital.hitTimers.set(enemy, ORBITAL_HIT_COOLDOWN);
        applyLifesteal(player, player.orbitalDamage);
        this.particles.emit(fireballX, fireballY, 4, { speed: 80, life: 0.2, color: '#ff6d00', size: 4, glow: true });
      }

      // Tick down per-enemy cooldowns and drop the expired ones.
      for (const [enemy, remainingTime] of orbital.hitTimers) {
        const nextRemaining = remainingTime - deltaTime;
        if (nextRemaining <= 0) orbital.hitTimers.delete(enemy);
        else orbital.hitTimers.set(enemy, nextRemaining);
      }
    }
  }

  fireSoulArrows(deltaTime) {
    const player = this.player;
    if (!player || !player.alive || player.soulArrowCount <= 0) return;
    player.soulArrowFireTimer -= deltaTime;
    if (player.soulArrowFireTimer > 0) return;
    player.soulArrowFireTimer = player.soulArrowInterval * player.cooldownMult;

    const target = findNearestEnemy(player, this.enemies, player.soulArrowRange);
    if (!target) return;

    const SOUL_ARROW_SPREAD_RADIANS = 0.12;
    const arrowCount = player.soulArrowCount;
    const baseAngleToTarget = angle(player, target);
    const spreadOffset = ((arrowCount - 1) * SOUL_ARROW_SPREAD_RADIANS) / 2;

    for (let arrowIndex = 0; arrowIndex < arrowCount; arrowIndex++) {
      const launchAngle = baseAngleToTarget
        + arrowIndex * SOUL_ARROW_SPREAD_RADIANS
        - spreadOffset
        + rand(-0.03, 0.03);
      const ARROW_SPEED = 200;
      this.projectiles.push({
        x: player.x + Math.cos(launchAngle) * 20,
        y: player.y + Math.sin(launchAngle) * 20,
        vx: Math.cos(launchAngle) * ARROW_SPEED,
        vy: Math.sin(launchAngle) * ARROW_SPEED,
        _angle: launchAngle,
        damage: player.soulArrowDamage,
        pierceLeft: 1,
        size: 8,
        life: 4,
        alive: true,
        hit: new Set(),
        explosive: false,
        owner: 'player',
        isSoulArrow: true,
        _spawned: 0,
        _soulOffset: rand(0, 100)
      });
    }
    this.lastSoulArrowPos = { x: player.x, y: player.y };
  }

  fireLightningStrikes(deltaTime) {
    const player = this.player;
    if (!player || !player.alive || player.lightningStrikeCount <= 0) return;
    player.lightningStrikeFireTimer -= deltaTime;
    if (player.lightningStrikeFireTimer > 0) return;
    player.lightningStrikeFireTimer = player.lightningStrikeInterval * player.cooldownMult;

    const aliveEnemies = this.enemies.filter((enemy) => enemy.alive);
    if (aliveEnemies.length === 0) return;

    const strikeCount = Math.min(player.lightningStrikeCount, aliveEnemies.length);
    const shuffledTargets = [...aliveEnemies].sort(() => Math.random() - 0.5);

    for (let strikeIndex = 0; strikeIndex < strikeCount; strikeIndex++) {
      const target = shuffledTargets[strikeIndex];
      target.takeDamage(player.lightningStrikeDamage, player, this.particles, this.cam, audio);
      this.floatingNumbers.push(new FloatingNumber(target.x, target.y - target.size - 8, Math.round(player.lightningStrikeDamage).toString(), '#88ccff'));
      this.lightningStrikes.push({ x: target.x, y: target.y, startY: this.cam.sy - 50, timer: 0.45, maxTimer: 0.45 });
      this.particles.emit(target.x, target.y, 8, { speed: 120, life: 0.4, color: '#88ccff', size: 5, glow: true });
      audio.play('lightning');
    }
    // One gentle shake per volley — never per strike (screen-shake spam fix).
    if (strikeCount > 0) this.cam.shake(2);
  }

  updateHUD() {
    const player = this.player;
    if (!player) return;
    this.ui.hpBarFill.style.width = (player.hp / player.maxHp * 100) + '%';
    const xpForNextLevel = xpForLevel(this.level);
    this.ui.xpBarFill.style.width = (this.xp / xpForNextLevel * 100) + '%';
    this.ui.levelLabel.textContent = this.level;
    this.ui.waveLabel.textContent = this.waveManager.wave;
    this.ui.killsLabel.textContent = this.kills;

    // Survival timer, M:SS — the Vampire Survivors signature clock.
    const totalSeconds = Math.floor(this.gameTime);
    this.ui.survivalTimer.textContent =
      Math.floor(totalSeconds / 60) + ':' + String(totalSeconds % 60).padStart(2, '0');

    // Weapon/passive icon bars; only rebuild when the build actually changes.
    let signature = '';
    let iconsHtml = '';
    for (const def of WEAPONS) {
      const level = player.weapons[def.id];
      if (!level) continue;
      signature += def.id + level;
      iconsHtml += `<div class="inv-icon" title="${def.name}">${def.icon}<span>${level}</span></div>`;
    }
    iconsHtml += '<div class="inv-sep"></div>';
    for (const def of PASSIVES) {
      const level = player.passives[def.id];
      if (!level) continue;
      signature += def.id + level;
      iconsHtml += `<div class="inv-icon passive" title="${def.name}">${def.icon}<span>${level}</span></div>`;
    }
    if (signature !== this.inventorySignature) {
      this.inventorySignature = signature;
      this.ui.inventoryBar.innerHTML = iconsHtml;
    }
  }

  togglePause() {
    if (this.state === 'playing') {
      this.state = 'paused';
      // Remember camera position so it can be restored exactly on resume.
      this.prevCamSx = this.cam.sx;
      this.prevCamSy = this.cam.sy;
      this.setElementVisible(this.ui.pausePanel, true);
    } else if (this.state === 'paused') {
      this.state = 'playing';
      this.setElementVisible(this.ui.pausePanel, false);
    }
  }

  goToMenu() {
    this.state = 'menu';
    this.resetRunState();
    this.setElementVisible(this.ui.pausePanel, false);
    this.setElementVisible(this.ui.gameOverScreen, false);
    const optionsPanel = document.getElementById('options-panel');
    if (optionsPanel) optionsPanel.classList.remove('show');
    const highscorePanel = document.getElementById('highscore-panel');
    if (highscorePanel) highscorePanel.classList.remove('show');
    document.getElementById('exit-note').textContent = '';
    this.setElementVisible(this.ui.startScreen, true);
  }

  update(deltaTime) {
    if (this.state === 'paused') {
      if (input.escapePressed) { input.escapePressed = false; this.togglePause(); }
      return;
    }
    if (this.state !== 'playing') { input.escapePressed = false; return; }
    this.gameTime += deltaTime;

    this.updatePlayerAndEnemies(deltaTime);
    this.updateWeapons(deltaTime);
    this.updateLightningVisuals(deltaTime);
    this.updateProjectiles(deltaTime);
    this.collectEnemyDrops();
    this.updatePickups(deltaTime);

    this.waveManager.update(deltaTime, this.enemies, this.player, this.particles, this.cam, audio, this);
    this.particles.update(deltaTime);

    this.bossAlive = this.enemies.some((enemy) => enemy.type === 'lich' && enemy.alive);
    this.updateHUD();
    this.updateWaveAnnouncement();

    if (!this.player.alive && this.state === 'playing') {
      this.gameOver();
    }
  }

  // Endless world: activate obstacles from the chunks around the player/camera.
  refreshActiveObstacles() {
    const halfWidth = DW() / RENDER_SCALE / 2 + 140;
    const halfHeight = DH() / RENDER_SCALE / 2 + 140;
    this.obstacles = collectActiveObstacles(
      this.obstacleChunkCache,
      this.player.x, this.player.y,
      halfWidth, halfHeight
    );
  }

  updatePlayerAndEnemies(deltaTime) {
    this.cam.follow(this.player, deltaTime);
    this.refreshActiveObstacles();
    this.player.update(deltaTime, this.enemies, this.projectiles, this.particles, this.cam, audio, this.floatingNumbers);
    this.pushApartFromObstacles(this.player);

    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      // Stragglers left far behind despawn silently (Vampire Survivors-style).
      if (dist(this.player, enemy) > G.despawnDistance) {
        enemy.alive = false;
        enemy.despawned = true;
        continue;
      }
      enemy.update(deltaTime, this.player, this.enemies, this.projectiles, this.particles, this.cam, audio);
      this.pushApartFromObstacles(enemy);
      // Body contact damages the player unless the enemy is already dying.
      // The +1 tolerance matches the enemies' press-in stop distance, so foes
      // that close to their contact radius actually land damage (previously they
      // parked 5px out of range and the player never took contact hits).
      if (this.player.alive && !enemy.dying && dist(this.player, enemy) <= this.player.size + enemy.size + 1) {
        this.damagePlayer(enemy.damage, enemy);
      }
    }
  }

  updateLightningVisuals(deltaTime) {
    for (const strike of this.lightningStrikes) {
      strike.timer -= deltaTime;
    }
    this.lightningStrikes = this.lightningStrikes.filter((strike) => strike.timer > 0);
  }

  updateProjectiles(deltaTime) {
    for (const projectile of this.projectiles) {
      if (!projectile.alive) continue;
      projectile.x += projectile.vx * deltaTime;
      projectile.y += projectile.vy * deltaTime;
      projectile.life -= deltaTime;
      if (projectile.gravity) {              // axes arc under gravity and spin
        projectile.vy += 900 * deltaTime;
        projectile._spin += deltaTime * 12;
      }
      if (projectile._spawned !== undefined) projectile._spawned++;

      // Endless world: projectiles only expire by lifetime now.
      if (projectile.life <= 0) {
        projectile.alive = false;
        continue;
      }

      // Skip obstacle checks for the first few frames so projectiles can
      // escape from inside an obstacle they were fired next to.
      const justSpawned = projectile._spawned !== undefined && projectile._spawned < 3;
      if (!justSpawned && this.projectileHitsObstacle(projectile)) continue;

      if (projectile.owner === 'player') {
        this.resolvePlayerProjectileHits(projectile);
      } else if (this.player.alive && dist(projectile, this.player) < projectile.size + this.player.size) {
        this.damagePlayer(projectile.damage, null);
        projectile.alive = false;
      }
    }
    this.projectiles = this.projectiles.filter((projectile) => projectile.alive);

    // Soul-arrow muzzle flash at the spot the volley was fired from.
    if (this.lastSoulArrowPos) {
      audio.play('slash');
      this.particles.emit(this.lastSoulArrowPos.x, this.lastSoulArrowPos.y, 6, { speed: 120, life: 0.3, color: '#4fc3f7', size: 4, glow: true });
      this.lastSoulArrowPos = null;
    }
  }

  projectileHitsObstacle(projectile) {
    for (const obstacle of this.obstacles) {
      if (obstacle.intersects(projectile.x, projectile.y, projectile.size)) {
        projectile.alive = false;
        return true;
      }
    }
    return false;
  }

  resolvePlayerProjectileHits(projectile) {
    for (const enemy of this.enemies) {
      if (!enemy.alive || projectile.hit.has(enemy)) continue;
      if (dist(projectile, enemy) >= projectile.size + enemy.size) continue;

      enemy.takeDamage(projectile.damage, this.player, this.particles, this.cam, audio);
      this.floatingNumbers.push(new FloatingNumber(enemy.x, enemy.y - enemy.size - 8, Math.round(projectile.damage).toString(), '#ce93d8'));
      projectile.hit.add(enemy);
      applyLifesteal(this.player, projectile.damage);

      if (projectile.explosive) {
        detonateExplosion(projectile.x, projectile.y, projectile.damage, this.player, enemy, this.enemies, this.particles, this.cam, audio);
      }

      projectile.pierceLeft--;
      if (projectile.pierceLeft <= 0) {
        projectile.alive = false;
        break;
      }
    }
  }

    // Runs every equipped weapon once per frame.
  updateWeapons(deltaTime) {
    const player = this.player;
    if (!player || !player.alive) return;
    if (player.weapons.orbital) this.updateOrbitals(deltaTime);
    if (player.weapons.soulArrow) this.fireSoulArrows(deltaTime);
    if (player.weapons.lightning) this.fireLightningStrikes(deltaTime);
    this.fireWhip(deltaTime);
    this.throwAxes(deltaTime);
    this.updateGarlicAura(deltaTime);
    this.fireFireWand(deltaTime);
  }

  // Phantom Whip: sweeps a rectangle on one side of the player (both sides
  // from level 4), piercing every foe caught in the arc.
  fireWhip(deltaTime) {
    const player = this.player;
    if (!player.alive || !player.weapons.whip) { this.weaponTimers.whip = 0; return; }

    let timer = (this.weaponTimers.whip ?? 0) - deltaTime;
    if (timer <= 0) {
      timer = player.whipInterval * player.cooldownMult;
      const reach = player.whipReach * Math.sqrt(player.aoeRadiusMult);
      const halfHeight = reach * 0.35;
      const sides = player.whipHitsBothSides ? [1, -1] : [this.whipSide];
      const whipDamage = player.whipDamage * player.damageMult;

      for (const side of sides) {
        for (const enemy of this.enemies) {
          if (!enemy.alive) continue;
          const offsetX = enemy.x - player.x;
          const offsetY = enemy.y - player.y;
          if (offsetX * side < -enemy.size) continue;                // wrong side
          if (Math.abs(offsetX) > reach + enemy.size) continue;      // too far out
          if (Math.abs(offsetY) > halfHeight + enemy.size) continue; // off the arc

          enemy.takeDamage(whipDamage, player, this.particles, this.cam, audio);
          this.floatingNumbers.push(new FloatingNumber(enemy.x, enemy.y - enemy.size - 8, Math.round(whipDamage).toString(), '#b39ddb'));
          applyLifesteal(player, whipDamage);
        }
        for (let i = 0; i < 10; i++) {   // purple sweep particles along the arc
          const sweepX = player.x + side * (reach * (i / 9));
          const sweepY = player.y + rand(-halfHeight, halfHeight) * 0.6;
          this.particles.emit(sweepX, sweepY, 1, { speed: 30, life: 0.15, color: '#b39ddb', size: 4, glow: true });
        }
      }
      this.whipSide *= -1;
      audio.play('slash');
    }
    this.weaponTimers.whip = timer;
  }

  // Reaper's Axe: hurled skyward with gravity, spinning, pierces everything.
  throwAxes(deltaTime) {
    const player = this.player;
    if (!player.alive || !player.weapons.axe) { this.weaponTimers.axe = 0; return; }

    let timer = (this.weaponTimers.axe ?? 0) - deltaTime;
    if (timer <= 0) {
      timer = player.axeInterval * player.cooldownMult;
      for (let axeIndex = 0; axeIndex < player.axeCount; axeIndex++) {
        const driftAngle = rand(0, TAU);
        this.projectiles.push({
          x: player.x,
          y: player.y - 10,
          vx: Math.cos(driftAngle) * rand(60, 160),
          vy: -rand(380, 460),                 // launched upward; gravity pulls it down
          gravity: true,
          _spin: rand(0, TAU),
          damage: player.axeDamage * player.damageMult,
          pierceLeft: 999,                     // effectively infinite pierce
          size: 11,
          life: 2.4,
          alive: true,
          hit: new Set(),
          explosive: false,
          owner: 'player',
          isAxe: true
        });
      }
      audio.play('slash');
    }
    this.weaponTimers.axe = timer;
  }

  // Hellfire Aura: periodic burn ticks on every enemy inside the ring.
  updateGarlicAura(deltaTime) {
    const player = this.player;
    if (!player.alive || !player.weapons.garlic) { this.weaponTimers.garlic = 0; return; }

    let timer = (this.weaponTimers.garlic ?? 0) - deltaTime;
    if (timer <= 0) {
      timer = player.garlicTick * player.cooldownMult;
      const burnDamage = player.garlicDamage * player.damageMult;
      for (const enemy of this.enemies) {
        if (!enemy.alive) continue;
        if (dist(player, enemy) >= player.garlicRadius + enemy.size) continue;

        enemy.takeDamage(burnDamage, player, this.particles, this.cam, audio);
        const pushAngle = angle(player, enemy);   // slight burn knockback outward
        enemy.x += Math.cos(pushAngle) * 6;
        enemy.y += Math.sin(pushAngle) * 6;
        applyLifesteal(player, burnDamage);
        if (Math.random() < 0.3) {
          this.particles.emit(enemy.x, enemy.y, 1, { speed: 40, life: 0.25, color: '#ff7043', size: 3, glow: true });
        }
      }
    }
    this.weaponTimers.garlic = timer;
  }

  // Fire Wand: lobs an explosive bolt at a RANDOM enemy (not the nearest).
  fireFireWand(deltaTime) {
    const player = this.player;
    if (!player.alive || !player.weapons.firewand) { this.weaponTimers.firewand = 0; return; }

    let timer = (this.weaponTimers.firewand ?? 0) - deltaTime;
    if (timer <= 0) {
      const aliveEnemies = this.enemies.filter((enemy) => enemy.alive);
      if (aliveEnemies.length === 0) { this.weaponTimers.firewand = 0.2; return; }

      timer = player.firewandInterval * player.cooldownMult;
      for (let boltIndex = 0; boltIndex < player.firewandCount; boltIndex++) {
        const target = choose(aliveEnemies);
        const launchAngle = angle(player, target) + rand(-0.05, 0.05);
        const BOLT_SPEED = 430;
        this.projectiles.push({
          x: player.x,
          y: player.y,
          vx: Math.cos(launchAngle) * BOLT_SPEED,
          vy: Math.sin(launchAngle) * BOLT_SPEED,
          damage: player.firewandDamage * player.damageMult,
          pierceLeft: 0,                       // explodes on first contact
          size: 7,
          life: 3,
          alive: true,
          hit: new Set(),
          explosive: true,
          color: '#ff7043',
          owner: 'player'
        });
        this.particles.emit(player.x, player.y, 4, { speed: 90, life: 0.2, color: '#ff7043', size: 4, glow: true });
      }
    }
    this.weaponTimers.firewand = timer;
  }

  // Grant kill credit, XP orbs, and item drops for enemies slain this frame,
  // then remove them from the active list.
  collectEnemyDrops() {
    for (const enemy of this.enemies) {
      // Despawned stragglers vanish without rewarding kills/XP/drops.
      if (!enemy.alive && !enemy.despawned && enemy.hp <= 0) {
        this.kills++;
        this.xpOrbs.push(new XpOrb(enemy.x, enemy.y, enemy.xpValue));
        // Elites always drop a treasure chest; regular kills roll the tables.
        if (enemy.elite) {
          this.items.push(new Item(enemy.x, enemy.y, 'chest'));
        } else {
          const droppedItem = rollItemDrop(enemy.x, enemy.y, this);
          if (droppedItem) this.items.push(droppedItem);
        }
        this.updateHUD();
      }
    }
    this.enemies = this.enemies.filter((enemy) => enemy.alive);
  }

  updatePickups(deltaTime) {
    for (const orb of this.xpOrbs) {
      if (!orb.alive) continue;
      const pickedUp = orb.update(deltaTime, this.player);
      if (pickedUp) {
        audio.play('xp');
        this.addXP(orb.value);
        this.particles.emit(orb.x, orb.y, 6, { speed: 60, life: 0.3, color: '#ce93d8', size: 3 });
      }
    }
    this.xpOrbs = this.xpOrbs.filter((orb) => orb.alive);

    for (const item of this.items) {
      if (!item.alive) continue;
      item.update(deltaTime, this.player, this);
    }
    this.items = this.items.filter((item) => item.alive);

    for (const floatingNumber of this.floatingNumbers) {
      floatingNumber.update(deltaTime);
    }
    this.floatingNumbers = this.floatingNumbers.filter((floatingNumber) => floatingNumber.alive);
  }

  updateWaveAnnouncement() {
    if (this.waveManager.announcing) {
      this.ui.waveAnnouncement.classList.add('show');
      this.ui.waveAnnouncementNumber.textContent = this.waveManager.wave;
      const isBossWave = this.waveManager.wave % 5 === 0;
      this.ui.waveAnnouncementText.textContent = isBossWave ? 'THE LICH AWAKENS' : 'The hordes descend...';
    } else {
      this.ui.waveAnnouncement.classList.remove('show');
    }

    // Timed swarm-event banner.
    if (this.gameTime < this.swarmBannerUntil) {
      this.ui.swarmBanner.classList.add('show');
    } else {
      this.ui.swarmBanner.classList.remove('show');
    }
  }

  showSwarmBanner(text) {
    this.swarmBannerUntil = this.gameTime + 2.5;
    this.ui.swarmBanner.textContent = text;
  }

  loop(timestampMs) {
    if (this.lastFrameTimeMs === undefined) this.lastFrameTimeMs = timestampMs;
    let deltaTime = (timestampMs - this.lastFrameTimeMs) / 1000;
    this.lastFrameTimeMs = timestampMs;

    // Clamp the frame time so background tabs and hitches can't cause a
    // giant simulation step (and treat zero/negative time as one frame).
    const MAX_FRAME_TIME_SECONDS = 0.1;
    if (deltaTime <= 0) deltaTime = 1 / 60;
    if (deltaTime > MAX_FRAME_TIME_SECONDS) deltaTime = MAX_FRAME_TIME_SECONDS;

    input.update();
    if (this.state === 'playing' && input.escapePressed) {
      input.escapePressed = false;
      this.togglePause();
    }

    this.update(deltaTime);
    this.renderer.render(this);
    input.endFrame();
    requestAnimationFrame((nextTimestampMs) => this.loop(nextTimestampMs));
  }
}

const game = new Game();
let chosenDifficulty = 'midnight';

// Persistent high-score table (localStorage). Sorted by survival time, then kills.
const HIGHSCORE_KEY = 'ktoKys.highscores';
const MAX_HIGHSCORES = 10;
const DIFFICULTY_ORDER = ['dusk', 'midnight', 'void', 'oblivion'];
const DIFFICULTY_LABEL = { dusk: 'Dusk', midnight: 'Midnight', void: 'Void', oblivion: 'Oblivion' };
// Which difficulty's board is currently displayed; pre-1.x saved runs (no
// difficulty field) are treated as Midnight.
let selectedHighscoreDifficulty = 'midnight';
const scoreDifficulty = (s) => DIFFICULTY_ORDER.includes(s.difficulty) ? s.difficulty : 'midnight';

function loadHighScores() {
  try {
    const raw = localStorage.getItem(HIGHSCORE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

function saveHighScores(scores) {
  try { localStorage.setItem(HIGHSCORE_KEY, JSON.stringify(scores)); } catch (e) { /* storage unavailable */ }
}

function addHighScore(run) {
  const scores = loadHighScores();
  scores.push({ difficulty: scoreDifficulty(run), time: run.time, waves: run.waves, kills: run.kills, level: run.level });
  scores.sort((a, b) => b.time - a.time || b.kills - a.kills);
  if (scores.length > MAX_HIGHSCORES) scores.length = MAX_HIGHSCORES;
  saveHighScores(scores);
  // Open the board matching the just-finished run and return its rank there.
  selectedHighscoreDifficulty = scoreDifficulty(run);
  const board = scores.filter((s) => scoreDifficulty(s) === selectedHighscoreDifficulty);
  return board.indexOf(board.find((s) => s.time === run.time && s.kills === run.kills));
}

function formatRunTime(seconds) {
  const total = Math.floor(seconds) || 0;
  return Math.floor(total / 60) + ':' + (total % 60).toString().padStart(2, '0');
}

function renderHighScores(highlightIndex) {
  const list = document.getElementById('highscore-list');
  const scores = loadHighScores().filter((s) => scoreDifficulty(s) === selectedHighscoreDifficulty);
  for (const tab of document.querySelectorAll('#highscore-tabs .hs-tab')) {
    tab.classList.toggle('active', tab.dataset.diff === selectedHighscoreDifficulty);
  }
  if (!scores.length) {
    list.innerHTML = '<div class="highscore-empty">No souls have been claimed on '
      + DIFFICULTY_LABEL[selectedHighscoreDifficulty] + ' yet.<br>The darkness still waits to be tested.</div>';
    return;
  }
  list.innerHTML = scores.map((s, i) => `
    <div class="highscore-row${i === highlightIndex ? ' me' : ''}">
      <span class="rank">${i + 1}.</span>
      <span class="time">${formatRunTime(s.time)}</span>
      <span class="stat">Wave ${s.waves || 0}</span>
      <span class="stat">${s.kills || 0} kills</span>
      <span class="stat">Lv ${s.level || 1}</span>
    </div>`).join('');
}

document.getElementById('menu-highscores').addEventListener('click', () => {
  renderHighScores(game.latestRunRank);
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('highscore-panel').classList.add('show');
});

document.getElementById('highscore-tabs').addEventListener('click', (e) => {
  const tab = e.target.closest('.hs-tab');
  if (!tab) return;
  selectedHighscoreDifficulty = tab.dataset.diff;
  renderHighScores(-1);
});

document.getElementById('highscore-back-btn').addEventListener('click', () => {
  document.getElementById('highscore-panel').classList.remove('show');
  document.getElementById('start-screen').style.display = 'flex';
});

document.getElementById('highscore-clear-btn').addEventListener('click', () => {
  if (!confirm(`Erase all ${DIFFICULTY_LABEL[selectedHighscoreDifficulty]} souls?`)) return;
  const remaining = loadHighScores().filter((s) => scoreDifficulty(s) !== selectedHighscoreDifficulty);
  saveHighScores(remaining);
  renderHighScores(-1);
});

document.getElementById('menu-start').addEventListener('click', () => {
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('diff-panel').style.display = 'flex';
});

// OPTIONS — opens the options overlay from the main menu.
document.getElementById('menu-options').addEventListener('click', () => {
  const soundBtn = document.getElementById('options-sound-btn');
  soundBtn.textContent = audio.enabled ? 'SOUND: ON' : 'SOUND: OFF';
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('exit-note').textContent = '';
  document.getElementById('options-panel').classList.add('show');
});

document.getElementById('options-back-btn').addEventListener('click', () => {
  document.getElementById('options-panel').classList.remove('show');
  document.getElementById('start-screen').style.display = 'flex';
});

document.getElementById('options-sound-btn').addEventListener('click', function () {
  const enabled = audio.toggle();
  this.textContent = enabled ? 'SOUND: ON' : 'SOUND: OFF';
  if (document.getElementById('pause-panel').style.display === 'flex') {
    document.getElementById('sound-btn').textContent = enabled ? 'SOUND: ON' : 'SOUND: OFF';
  }
});

// EXIT — browsers only allow scripted close of script-opened windows, so fall
// back to a hint that the player should close the tab.
document.getElementById('menu-exit').addEventListener('click', () => {
  const note = document.getElementById('exit-note');
  try { window.close(); } catch (e) { /* ignored */ }
  setTimeout(() => {
    if (document.visibilityState !== 'hidden') {
      note.textContent = 'This tab cannot close itself — press Alt+F4 (or close the tab).';
    }
  }, 150);
});

// Build the character cards from config (portraits + blurbs).
(function buildCharacterCards() {
  const container = document.getElementById('char-choices');
  for (const character of CHARACTERS) {
    const card = document.createElement('button');
    card.className = 'char-btn';
    card.dataset.char = character.id;
    const startWeaponDef = findUpgrade(character.startWeapon);
    card.innerHTML = `
      <img class="char-portrait" src="${character.portrait}" alt="${character.name}">
      <span class="char-name">${character.name}</span>
      <span class="char-weapon">Starts: ${startWeaponDef.icon} ${startWeaponDef.name}</span>
      <span class="char-blurb">${character.blurb}</span>
    `;
    card.addEventListener('click', () => {
      audio.init();
      document.getElementById('char-panel').style.display = 'none';
      game.start(chosenDifficulty, character.id);
    });
    container.appendChild(card);
  }
})();

document.getElementById('diff-choices').addEventListener('click', e => {
  const btn = e.target.closest('.diff-btn');
  if (!btn) return;
  audio.init();
  chosenDifficulty = btn.dataset.diff;
  document.getElementById('diff-panel').style.display = 'none';
  document.getElementById('char-panel').style.display = 'flex';
});
document.getElementById('restart-btn').addEventListener('click', () => { audio.init(); game.start(game.difficultyId, game.characterId); });
document.getElementById('gameover-menu-btn').addEventListener('click', () => game.goToMenu());
document.getElementById('resume-btn').addEventListener('click', () => game.togglePause());
document.getElementById('pause-restart-btn').addEventListener('click', () => { audio.init(); game.start(game.difficultyId, game.characterId); });
document.getElementById('menu-btn').addEventListener('click', () => game.goToMenu());
document.getElementById('sound-btn').addEventListener('click', () => {
  const enabled = audio.toggle();
  document.getElementById('sound-btn').textContent = enabled ? 'SOUND: ON' : 'SOUND: OFF';
});
game.loop();
