class Game {
  constructor() {
    this.renderer = new Renderer();
    this.player = null;
    this.enemies = [];
    this.projectiles = [];
    this.xpOrbs = [];
    this.items = [];
    this.obstacles = [];
    this.floatingNumbers = [];
    this.particles = new ParticleSystem();
    this.cam = new Camera();
    this.waveManager = new WaveManager();
    this.kills = 0;
    this.xp = 0;
    this.level = 1;
    this.upgradeStacks = {};
    this.orbitals = [];
    this.state = 'menu';
    this.gameTime = 0;
    this.bossAlive = false;
    this.difficultyId = 'midnight';
    this.difficulty = DIFFICULTIES.midnight;
  }

  start(difficultyId) {
    audio.init();
    this.difficultyId = difficultyId || 'midnight';
    this.difficulty = DIFFICULTIES[this.difficultyId] || DIFFICULTIES.midnight;
    this.player = new Player();
    this.enemies = [];
    this.projectiles = [];
    this.xpOrbs = [];
    this.items = [];
    this.obstacles = generateObstacles();
    this.floatingNumbers = [];
    this.particles = new ParticleSystem();
    this.orbitals = [];
    this.waveManager = new WaveManager(this.difficulty);
    this.kills = 0;
    this.xp = 0;
    this.level = 1;
    this.upgradeStacks = {};
    this.gameTime = 0;
    this._lastTime = undefined;
    this._accumulator = 0;
    this.bossAlive = false;
    this.state = 'playing';
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('diff-panel').style.display = 'none';
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('upgrade-panel').style.display = 'none';
    document.getElementById('pause-panel').style.display = 'none';
    this.waveManager.startNextWave();
    this.updateHUD();
  }

  getUpgradeChoices(count = 4) {
    const available = UPGRADES.filter(u => {
      const stack = this.upgradeStacks[u.id] || 0;
      return stack < u.maxStack;
    });
    if (available.length <= count) return available;
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  applyUpgrade(upgrade) {
    upgrade.apply(this.player);
    this.upgradeStacks[upgrade.id] = (this.upgradeStacks[upgrade.id] || 0) + 1;
    audio.play('levelup');
    this.particles.emit(this.player.x, this.player.y, 30, { speed: 200, life: 0.8, color: '#ce93d8', size: 5, glow: true });
    document.getElementById('upgrade-panel').style.display = 'none';
    this.state = 'playing';
  }

  showUpgradeScreen() {
    this.state = 'upgrade';
    const choices = this.getUpgradeChoices(4);
    const container = document.getElementById('upgrade-choices');
    container.innerHTML = '';
    for (const u of choices) {
      const card = document.createElement('div');
      card.className = 'upgrade-card';
      const stack = (this.upgradeStacks[u.id] || 0) + 1;
      card.innerHTML = `
        <div class="icon">${u.icon}</div>
        <div class="name">${u.name}</div>
        <div class="desc">${u.desc}</div>
        <div class="level-badge">Lv.${stack}/${u.maxStack}</div>
      `;
      card.addEventListener('click', () => this.applyUpgrade(u));
      container.appendChild(card);
    }
    document.getElementById('upgrade-panel').style.display = 'flex';
  }

  addXP(amount) {
    this.xp += amount * (1 / this.difficulty.xpMult);
    const needed = xpForLevel(this.level);
    while (this.xp >= needed && this.level < G.maxLevel) {
      this.xp -= needed;
      this.level++;
      this.showUpgradeScreen();
      this.updateHUD();
      const neededNext = xpForLevel(this.level);
      if (this.xp >= neededNext && this.level < G.maxLevel) continue;
      break;
    }
    this.updateHUD();
  }

  pushApartFromObstacles(entity) {
    for (const ob of this.obstacles) {
      if (!ob.alive) continue;
      const nearX = clamp(entity.x, ob.x, ob.x + ob.w);
      const nearY = clamp(entity.y, ob.y, ob.y + ob.h);
      const dx = entity.x - nearX;
      const dy = entity.y - nearY;
      const d = Math.hypot(dx, dy);
      if (d < entity.size + 2) {
        const push = entity.size + 2 - d;
        if (d > 0.01) {
          entity.x += (dx / d) * push;
          entity.y += (dy / d) * push;
        } else {
          entity.x += push;
        }
      }
    }
  }

  damagePlayer(dmg, enemy) {
    if (!this.player.alive || this.player.invincibleTimer > 0) return;
    const finalDmg = dmg * this.player.armorMult;
    this.player.hp -= finalDmg;
    this.player.invincibleTimer = 0.15;
    this.cam.shake(8);
    this.particles.emit(this.player.x, this.player.y, 8, { speed: 100, life: 0.3, color: '#c62828', size: 5 });
    this.floatingNumbers.push(new FloatingNumber(this.player.x, this.player.y - 16, Math.round(finalDmg).toString(), '#c62828', 22));

    if (this.player.thorns > 0 && enemy && enemy.alive) {
      enemy.takeDamage(finalDmg * this.player.thorns, this.player, this.particles, this.cam, audio);
    }

    if (this.player.hp <= 0) {
      this.player.alive = false;
      this.gameOver();
    }
    this.updateHUD();
  }

  gameOver() {
    this.state = 'gameover';
    document.getElementById('game-over').style.display = 'flex';
    document.getElementById('final-waves').textContent = Math.max(0, this.waveManager.wave - 1);
    document.getElementById('final-kills').textContent = this.kills;
    document.getElementById('final-level').textContent = this.level;
    this.particles.emitExplosion(this.player.x, this.player.y, 80, { speed: 250, count: 40, color: '#c62828', life: 0.8, size: 6 });
  }

  syncOrbitals() {
    const p = this.player;
    if (!p || p.orbitalCount <= 0) { this.orbitals = []; return; }
    const prev = this.orbitals.length;
    while (this.orbitals.length < p.orbitalCount) {
      this.orbitals.push({ angle: 0, hitTimers: new Map() });
    }
    while (this.orbitals.length > p.orbitalCount) {
      this.orbitals.pop();
    }
    if (prev !== p.orbitalCount) {
      for (let i = 0; i < this.orbitals.length; i++) {
        this.orbitals[i].angle = (i / p.orbitalCount) * TAU;
      }
    }
  }

  updateOrbitals(dt) {
    if (!this.player.alive) return;
    this.syncOrbitals();
    const p = this.player;
    for (const orb of this.orbitals) {
      orb.angle += p.orbitalSpeed * dt;
      if (orb.angle > TAU) orb.angle -= TAU;
      const fx = p.x + Math.cos(orb.angle) * p.orbitalRadius;
      const fy = p.y + Math.sin(orb.angle) * p.orbitalRadius;
      for (const e of this.enemies) {
        if (!e.alive) continue;
        const remaining = orb.hitTimers.get(e) || 0;
        if (remaining > 0) continue;
        if (dist({ x: fx, y: fy }, e) < 12 + e.size) {
          e.takeDamage(p.orbitalDamage, p, this.particles, this.cam, audio);
          this.floatingNumbers.push(new FloatingNumber(e.x, e.y - e.size - 8, Math.round(p.orbitalDamage).toString(), '#ff6d00'));
          orb.hitTimers.set(e, 0.35);
          if (p.lifesteal > 0) {
            p.hp = Math.min(p.maxHp, p.hp + p.orbitalDamage * p.lifesteal);
          }
          this.particles.emit(fx, fy, 4, { speed: 80, life: 0.2, color: '#ff6d00', size: 4, glow: true });
        }
      }
      for (const [enemy, timer] of orb.hitTimers) {
        const next = timer - dt;
        if (next <= 0) orb.hitTimers.delete(enemy);
        else orb.hitTimers.set(enemy, next);
      }
    }
  }

  fireSoulArrows(dt) {
    const p = this.player;
    if (!p || !p.alive || p.soulArrowCount <= 0) return;
    p.soulArrowFireTimer -= dt;
    if (p.soulArrowFireTimer > 0) return;
    p.soulArrowFireTimer = p.soulArrowInterval / p.attackSpeedMult;

    let nearest = null;
    let nearDist = p.soulArrowRange;
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const d = dist(p, e);
      if (d < nearDist) { nearDist = d; nearest = e; }
    }
    if (!nearest) return;

    const baseAngle = angle(p, nearest);
    const spread = 0.12;
    const count = p.soulArrowCount;
    const startOff = (count - 1) * spread / 2;

    for (let i = 0; i < count; i++) {
      const a = baseAngle + i * spread - startOff + rand(-0.03, 0.03);
      this.projectiles.push({
        x: p.x + Math.cos(a) * 20, y: p.y + Math.sin(a) * 20,
        vx: Math.cos(a) * 200, vy: Math.sin(a) * 200, _angle: a,
        damage: p.soulArrowDamage,
        pierceLeft: 1,
        size: 8,
        life: 4,
        alive: true, hit: new Set(),
        explosive: false,
        owner: 'player',
        isSoulArrow: true,
        _spawned: 0,
        _soulOffset: rand(0, 100)
      });
    }
    this._lastSoulArrowPos = { x: p.x, y: p.y };
  }

  updateHUD() {
    const p = this.player;
    if (!p) return;
    document.getElementById('hp-fill').style.width = (p.hp / p.maxHp * 100) + '%';
    const needed = xpForLevel(this.level);
    document.getElementById('xp-fill').style.width = (this.xp / needed * 100) + '%';
    document.getElementById('hud-level').textContent = this.level;
    document.getElementById('hud-wave').textContent = this.waveManager.wave;
    document.getElementById('hud-kills').textContent = this.kills;
  }

  togglePause() {
    if (this.state === 'playing') {
      this.state = 'paused';
      this._prevCamSx = this.cam.sx;
      this._prevCamSy = this.cam.sy;
      document.getElementById('pause-panel').style.display = 'flex';
    } else if (this.state === 'paused') {
      this.state = 'playing';
      document.getElementById('pause-panel').style.display = 'none';
    }
  }

  goToMenu() {
    this.state = 'menu';
    this.player = null;
    this.enemies = [];
    this.projectiles = [];
    this.xpOrbs = [];
    this.items = [];
    this.obstacles = [];
    this.floatingNumbers = [];
    this.particles = new ParticleSystem();
    this.orbitals = [];
    this.waveManager = new WaveManager(this.difficulty);
    this.kills = 0;
    this.xp = 0;
    this.level = 1;
    this.upgradeStacks = {};
    this.gameTime = 0;
    this.bossAlive = false;
    this.cam = new Camera();
    document.getElementById('pause-panel').style.display = 'none';
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('start-screen').style.display = 'flex';
  }

  update(dt) {
    if (this.state === 'paused') {
      if (input.escapePressed) { input.escapePressed = false; this.togglePause(); }
      return;
    }
    if (this.state !== 'playing') { input.escapePressed = false; return; }
    this.gameTime += dt;

    this.cam.follow(this.player, dt);
    this.player.update(dt, this.enemies, this.projectiles, this.particles, this.cam, audio, this.floatingNumbers);
    this.pushApartFromObstacles(this.player);

    for (const e of this.enemies) {
      if (!e.alive) continue;
      e.update(dt, this.player, this.enemies, this.projectiles, this.particles, this.cam, audio);
      this.pushApartFromObstacles(e);
      if (this.player.alive && dist(this.player, e) < this.player.size + e.size && !e.dying) {
        this.damagePlayer(e.damage, e);
      }
    }

    this.updateOrbitals(dt);
    this.fireSoulArrows(dt);

    for (const p of this.projectiles) {
      if (!p.alive) continue;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p._spawned !== undefined) p._spawned++;
      if (p.life <= 0 || p.x < -50 || p.x > G.worldSize + 50 || p.y < -50 || p.y > G.worldSize + 50) {
        p.alive = false;
        continue;
      }
      if (!p._spawned || p._spawned >= 3) for (const ob of this.obstacles) {
        if (ob.intersects(p.x, p.y, p.size)) {
          p.alive = false;
          break;
        }
      }
      if (!p.alive) continue;
      if (p.owner === 'player') {
        for (const e of this.enemies) {
          if (!e.alive || p.hit.has(e)) continue;
          if (dist(p, e) < p.size + e.size) {
            e.takeDamage(p.damage, this.player, this.particles, this.cam, audio);
            this.floatingNumbers.push(new FloatingNumber(e.x, e.y - e.size - 8, Math.round(p.damage).toString(), '#ce93d8'));
            p.hit.add(e);
            if (this.player.lifesteal > 0) {
              this.player.hp = Math.min(this.player.maxHp, this.player.hp + p.damage * this.player.lifesteal);
            }
            if (p.explosive) {
              const radius = 60 * this.player.aoeRadiusMult;
              this.particles.emitExplosion(p.x, p.y, radius, { speed: 180, count: 15, color: '#c62828', life: 0.4, size: 5 });
              audio.play('explosion');
              this.cam.shake(6);
              for (const e2 of this.enemies) {
                if (!e2.alive || e2 === e) continue;
                const d = dist(p, e2);
                if (d < radius) {
                  const falloff = 1 - d / radius;
                  e2.takeDamage(p.damage * 0.5 * falloff, this.player, this.particles, this.cam, audio);
                }
              }
            }
            p.pierceLeft--;
            if (p.pierceLeft <= 0) { p.alive = false; break; }
          }
        }
      } else {
        if (this.player.alive && dist(p, this.player) < p.size + this.player.size) {
          this.damagePlayer(p.damage, null);
          p.alive = false;
        }
      }
    }
    this.projectiles = this.projectiles.filter(p => p.alive);

    if (this._lastSoulArrowPos) {
      audio.play('slash');
      this.particles.emit(this._lastSoulArrowPos.x, this._lastSoulArrowPos.y, 6, { speed: 120, life: 0.3, color: '#4fc3f7', size: 4, glow: true });
      this._lastSoulArrowPos = null;
    }

    for (const e of this.enemies) {
      if (!e.alive && e.hp <= 0) {
        this.kills++;
        this.xpOrbs.push(new XpOrb(e.x, e.y, e.xpValue));
        const item = rollItemDrop(e.x, e.y, this);
        if (item) this.items.push(item);
        this.updateHUD();
      }
    }
    this.enemies = this.enemies.filter(e => e.alive);

    for (const orb of this.xpOrbs) {
      if (!orb.alive) continue;
      const picked = orb.update(dt, this.player);
      if (picked) {
        audio.play('xp');
        this.addXP(orb.value);
        this.particles.emit(orb.x, orb.y, 6, { speed: 60, life: 0.3, color: '#ce93d8', size: 3 });
      }
    }
    this.xpOrbs = this.xpOrbs.filter(o => o.alive);

    for (const item of this.items) {
      if (!item.alive) continue;
      item.update(dt, this.player, this);
    }
    this.items = this.items.filter(i => i.alive);

    for (const fn of this.floatingNumbers) {
      fn.update(dt);
    }
    this.floatingNumbers = this.floatingNumbers.filter(f => f.alive);

    this.waveManager.update(dt, this.enemies, this.player, this.particles, this.cam, audio);
    this.particles.update(dt);

    this.bossAlive = this.enemies.some(e => e.type === 'lich' && e.alive);
    this.updateHUD();

    if (this.waveManager.announcing) {
      const ann = document.getElementById('wave-announce');
      ann.classList.add('show');
      document.getElementById('wave-num').textContent = this.waveManager.wave;
      if (this.waveManager.wave % 5 === 0) {
        document.querySelector('#wave-announce span').textContent = 'THE LICH AWAKENS';
      } else {
        document.querySelector('#wave-announce span').textContent = 'The hordes descend...';
      }
    } else {
      document.getElementById('wave-announce').classList.remove('show');
    }

    if (!this.player.alive && this.state === 'playing') {
      this.gameOver();
    }
  }

  loop(t) {
    if (this._lastTime === undefined) this._lastTime = t;
    this._lastTime = t;

    input.update();
    if (this.state === 'playing' && input.escapePressed) {
      input.escapePressed = false;
      this.togglePause();
    }

    this.update(1/60);

    this.renderer.render(this);
    input.endFrame();
    requestAnimationFrame(t2 => this.loop(t2));
  }
}

const game = new Game();
document.getElementById('start-btn').addEventListener('click', () => {
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('diff-panel').style.display = 'flex';
});
document.getElementById('diff-choices').addEventListener('click', e => {
  const btn = e.target.closest('.diff-btn');
  if (!btn) return;
  audio.init();
  document.getElementById('diff-panel').style.display = 'none';
  game.start(btn.dataset.diff);
});
document.getElementById('restart-btn').addEventListener('click', () => { audio.init(); game.start(game.difficultyId); });
document.getElementById('resume-btn').addEventListener('click', () => game.togglePause());
document.getElementById('pause-restart-btn').addEventListener('click', () => { audio.init(); game.start(game.difficultyId); });
document.getElementById('menu-btn').addEventListener('click', () => game.goToMenu());
document.getElementById('sound-btn').addEventListener('click', () => {
  const enabled = audio.toggle();
  document.getElementById('sound-btn').textContent = enabled ? 'SOUND: ON' : 'SOUND: OFF';
});
game.loop();
