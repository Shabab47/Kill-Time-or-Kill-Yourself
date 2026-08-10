class Item {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.size = 10;
    this.alive = true;
    this.pulse = rand(0, TAU);
    this.life = 15;
    this.pickupTimer = 0.3;
    this.glowColor = '#c62828';
    this.spriteId = 'healthPotion';
    this.color = '#c62828';
    this.label = 'Health';
    this.scaleX = 1;
    this.scaleY = 1;

    switch (type) {
      case 'health':
        this.glowColor = '#c62828';
        this.spriteId = 'healthPotion';
        this.color = '#c62828';
        this.label = 'Health';
        break;
      case 'shield':
        this.glowColor = '#7c4dff';
        this.spriteId = 'shieldPotion';
        this.color = '#7c4dff';
        this.label = 'Shield';
        this.size = 13.75;
        this.scaleX = 2;
        this.scaleY = 2.25;
        break;
      case 'speed':
        this.glowColor = '#66bb6a';
        this.spriteId = 'speedBoost';
        this.color = '#66bb6a';
        this.label = 'Haste';
        this.size = 11;
        break;
      case 'chest':
        this.glowColor = '#c9a84c';
        this.spriteId = 'chest';
        this.color = '#c9a84c';
        this.label = 'Chest';
        this.size = 14;
        this.life = 30;
        break;
    }
  }

  update(dt, player, game) {
    this.pulse += dt * 2;
    this.life -= dt;
    if (this.life <= 0) { this.alive = false; return false; }

    const d = dist(this, player);
    if (d < this.size + player.size + 4 && this.pickupTimer <= 0) {
      this.alive = false;
      this.onPickup(player, game);
      return true;
    }

    this.pickupTimer -= dt;
    return false;
  }

  onPickup(player, game) {
    switch (this.type) {
      case 'health':
        player.hp = Math.min(player.maxHp, player.hp + 30);
        game.particles.emit(this.x, this.y, 10, { speed: 80, life: 0.4, color: '#c62828', size: 4 });
        break;
      case 'shield':
        player.shieldActive = true;
        game.particles.emit(this.x, this.y, 12, { speed: 100, life: 0.5, color: '#7c4dff', size: 5, glow: true });
        break;
      case 'speed':
        player.speedMult *= 1.5;
        player.speedBoostStacks += 1;
        player.speedBoostTimer = 5;
        game.particles.emit(this.x, this.y, 12, { speed: 100, life: 0.5, color: '#66bb6a', size: 4, glow: true });
        break;
      case 'chest':
        const choices = game.getUpgradeChoices(3);
        if (choices.length > 0) {
          const picked = choose(choices);
          game.applyUpgrade(picked);
        } else {
          player.hp = Math.min(player.maxHp, player.hp + 20);
        }
        break;
    }
    if (this.type !== 'chest') {
      game.floatingNumbers.push(new FloatingNumber(this.x, this.y - 10, '+' + this.label, this.color));
    }
    game.updateHUD();
  }
}

function rollItemDrop(x, y, game) {
  const r = Math.random();
  const waveBonus = game.waveManager.wave * 0.02;
  if (r < 0.06 + waveBonus) {
    return new Item(x, y, 'chest');
  } else if (r < 0.18 + waveBonus) {
    return new Item(x, y, 'health');
  } else if (r < 0.26 + waveBonus * 0.5) {
    return new Item(x, y, 'shield');
  } else if (r < 0.33 + waveBonus * 0.3) {
    return new Item(x, y, 'speed');
  }
  return null;
}
