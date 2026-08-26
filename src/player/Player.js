class Player {
  constructor(character) {
    // Endless world: everyone spawns at the origin.
    this.x = 0;
    this.y = 0;
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
    this.orbitalRadius = 80;
    this.orbitalSpeed = 3;
    this.soulArrowCount = 1;
    this.soulArrowDamage = 10;
    this.soulArrowRange = 800;
    this.soulArrowFireTimer = 0;
    this.soulArrowInterval = 1.5;
    this.lightningStrikeCount = 0;
    this.lightningStrikeDamage = 25;
    this.lightningStrikeFireTimer = 0;
    this.lightningStrikeInterval = 2;
    this.speedBoostTimer = 0;
    this.speedBoostStacks = 0;
    this.invincibleTimer = 0;
    this.shieldActive = false;
    this.attackTimer = 0;

    // --- Vampire-Survivors-style build state ---
    this.weapons = {};        // weaponId -> level
    this.passives = {};       // passiveId -> level
    this.cooldownMult = 1;    // lowered by the Alacrity passive
    // Soul Scythe (base weapon) stats; re-derived by its apply() on level-up.
    this.scytheSwings = 1;
    this.scytheTargets = 1;
    this.scytheDamageMult = 1;

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

    // Character selection: grants the starting weapon and its passive bonus.
    if (character) {
      this.characterId = character.id;
      this.weapons[character.startWeapon] = 1;
      findUpgrade(character.startWeapon).apply(this);
      character.apply(this);
    }
  }

  get speed() { return this.baseSpeed * this.speedMult; }
  get damage() { return this.baseDamage * this.damageMult; }
  get attackSpeed() { return this.baseAttackSpeed / this.attackSpeedMult; }
  get attackRange() { return this.baseAttackRange; }
  get projectileSpeed() { return this.baseProjectileSpeed; }

  update(deltaTime, enemies, projectiles, particles, cam, audio, floatingNumbers) {
    if (!this.alive) return;
    this.applyTimers(deltaTime);

    const moveInput = this.readMovementInput();
    // No world bounds: the map is endless (Vampire Survivors-style).
    const isMoving = this.applyMovement(moveInput, deltaTime, enemies, particles, cam, audio);
    this.tryDash(moveInput, particles, audio);
    this.attackNearestEnemy(deltaTime, enemies, particles, cam, audio, floatingNumbers);
    this.updateAnimationState(deltaTime, isMoving);
    this.applyRegeneration(deltaTime);

    if (this.hp <= 0) {
      this.alive = false;
    }
  }

  applyTimers(deltaTime) {
    this.invincibleTimer -= deltaTime;
    this.dashCooldown -= deltaTime;
    this.attackAnimTimer -= deltaTime;

    // Haste stacks each expire independently: when one runs out, one stack's
    // speed bonus is removed and the next stack's timer restarts.
    if (this.speedBoostStacks > 0) {
      this.speedBoostTimer -= deltaTime;
      if (this.speedBoostTimer <= 0) {
        this.speedBoostStacks -= 1;
        this.speedMult /= 1.5;
        this.speedBoostTimer = 5;
      }
    }
  }

  // Returns the (normalized) movement vector from keyboard or touch input.
  readMovementInput() {
    let inputX = input.moveX;
    let inputY = input.moveY;
    const inputLength = Math.hypot(inputX, inputY);
    if (inputLength > 1) {
      inputX /= inputLength;
      inputY /= inputLength;
    }
    return { x: inputX, y: inputY, length: Math.min(1, inputLength) };
  }

  // Moves the player (dash overrides normal walking) and returns whether the
  // player was visibly moving this frame.
  applyMovement(moveInput, deltaTime, enemies, particles, cam, audio) {
    let isMoving = false;

    if (this.dashDuration > 0) {
      this.dashDuration -= deltaTime;
      this.x += this.dashDir.x * this.dashSpeed * deltaTime;
      this.y += this.dashDir.y * this.dashSpeed * deltaTime;
      this.damageEnemiesDashedThrough(enemies, particles, cam, audio);
      isMoving = true;
    } else if (moveInput.length > 0.1) {
      this.x += moveInput.x * this.speed * deltaTime;
      this.y += moveInput.y * this.speed * deltaTime;
      this.moveAngle = Math.atan2(moveInput.y, moveInput.x);
      isMoving = true;
    }
    return isMoving;
  }

  damageEnemiesDashedThrough(enemies, particles, cam, audio) {
    if (this.dashDamage <= 0) return;
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      if (dist(this, enemy) < this.size + enemy.size) {
        enemy.takeDamage(this.dashDamage, this, particles, cam, audio);
      }
    }
  }

  tryDash(moveInput, particles, audio) {
    const canDash = this.dashCooldown <= 0 && this.dashDuration <= 0 && moveInput.length > 0.1;
    if (!input.getDash() || !canDash) return;

    this.dashDuration = 0.18;
    this.dashCooldown = this.baseDashCooldown;
    this.dashDir = moveInput.length > 0.1 ? { x: moveInput.x, y: moveInput.y } : { x: 1, y: 0 };
    this.invincibleTimer = 0.2;
    audio.play('dash');
    particles.emit(this.x, this.y, 10, { speed: 150, life: 0.3, color: '#7c4dff', size: 6 });
  }

  // Auto-attacks the closest enemy in range whenever the attack cooldown is
  // ready. Scythe level widens the cleave (`scytheTargets`) and adds extra
  // quick swings (`scytheSwings`); Might multiplies the damage dealt.
  attackNearestEnemy(deltaTime, enemies, particles, cam, audio, floatingNumbers) {
    this.attackTimer -= deltaTime;
    const target = findNearestEnemy(this, enemies, this.attackRange);
    if (!target || this.attackTimer > 0) return;

    this.attackTimer = this.attackSpeed * this.cooldownMult;
    const targetAngle = angle(this, target);
    this.facing = angleToDir8(targetAngle);
    this.attackAnimTimer = Math.min(0.25, this.attackSpeed * 0.8);
    audio.play('slash');

    const swingTargets = enemies
      .filter((enemy) => enemy.alive && dist(this, enemy) <= this.attackRange)
      .sort((enemyA, enemyB) => dist(this, enemyA) - dist(this, enemyB))
      .slice(0, this.scytheTargets);

    const slashDamage = this.damage * this.scytheDamageMult;
    for (let swingIndex = 0; swingIndex < this.scytheSwings; swingIndex++) {
      for (const enemy of swingTargets) {
        if (!enemy.alive) continue;

        enemy.takeDamage(slashDamage, this, particles, cam, audio);
        if (floatingNumbers) {
          floatingNumbers.push(new FloatingNumber(enemy.x, enemy.y - enemy.size - 8, Math.round(slashDamage).toString(), '#5ce1ff'));
        }
        applyLifesteal(this, slashDamage);

        if (Math.random() < this.explosiveChance) {
          detonateExplosion(enemy.x, enemy.y, slashDamage, this, enemy, enemies, particles, cam, audio);
        }
      }
    }

    this.emitSlashArcParticles(targetAngle, particles);
  }

  // Cyan slash-arc particles, swept across the facing direction.
  emitSlashArcParticles(slashAngle, particles) {
    const ARC_PARTICLE_COUNT = 12;
    const arcRadius = this.attackRange * 0.35;
    for (let particleIndex = 0; particleIndex < ARC_PARTICLE_COUNT; particleIndex++) {
      const spreadAngle = slashAngle + (particleIndex / (ARC_PARTICLE_COUNT - 1) - 0.5) * 1.4;
      const particleX = this.x + Math.cos(spreadAngle) * arcRadius;
      const particleY = this.y + Math.sin(spreadAngle) * arcRadius;
      particles.emit(particleX, particleY, 1, { speed: 40, life: 0.18, color: '#5ce1ff', size: 4, glow: true });
    }
  }

  updateAnimationState(deltaTime, isMoving) {
    if (this.dashDuration > 0) {
      this.animState = 'dash';
      this.facing = angleToDir8(Math.atan2(this.dashDir.y, this.dashDir.x));
      this.dashFrameTimer -= deltaTime;
      if (this.dashFrameTimer <= 0) {
        this.dashFrameTimer = 0.09;
        this.dashFrame = 1 - this.dashFrame;
      }
    } else if (this.attackAnimTimer > 0) {
      this.animState = 'attack';
    } else if (isMoving) {
      this.animState = 'walk';
      this.facing = angleToDir8(this.moveAngle);
      // Walk cycle speeds up with movement speed.
      this.walkCycleTimer -= deltaTime;
      const walkCycleSpeed = clamp(0.32 - this.speed / 1400, 0.1, 0.3);
      if (this.walkCycleTimer <= 0) {
        this.walkCycleTimer = walkCycleSpeed;
        this.walkFrame = 1 - this.walkFrame;
      }
    } else {
      this.animState = 'idle';
    }
  }

  applyRegeneration(deltaTime) {
    if (this.hp < this.maxHp && this.regen > 0) {
      this.hp = Math.min(this.maxHp, this.hp + this.regen * deltaTime);
    }
  }
}
