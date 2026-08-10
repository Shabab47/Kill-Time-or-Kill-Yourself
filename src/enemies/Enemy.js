class Enemy {
  constructor(type, x, y, wave, difficulty) {
    const base = G.enemyBase[type];
    const d = difficulty || DIFFICULTIES.midnight;
    const scale = d.baseStatMult * (1 + (wave - 1) * d.hpScale);
    this.x = x; this.y = y;
    this.type = type;
    this.size = base.size;
    this.baseHp = base.hp * scale;
    this.hp = this.baseHp;
    this.maxHp = this.baseHp;
    this.speed = base.speed * d.baseStatMult * (1 + (wave - 1) * d.spdScale);
    this.damage = base.damage * d.baseStatMult * (1 + (wave - 1) * d.dmgScale);
    this.xpValue = base.xp;
    this.color = base.color;
    this.alive = true;
    this.hitFlash = 0;
  }

  takeDamage(dmg, source, particles, cam, audio) {
    this.hp -= dmg;
    this.hitFlash = 0.08;
    if (this.hp <= 0) {
      this.alive = false;
      audio.play(this.type + '_kill');
      particles.emit(this.x, this.y, 12, { speed: 120, life: 0.5, color: this.color, size: 4 });
    } else {
      audio.play(this.type + '_hit');
      particles.emit(this.x, this.y, 5, { speed: 80, life: 0.3, color: '#ce93d8', size: 3 });
    }
  }

  update(dt, player, enemies, projectiles, particles, cam, audio) {
    this.hitFlash -= dt;
  }
}
