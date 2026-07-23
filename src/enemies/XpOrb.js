class XpOrb {
  constructor(x, y, value) {
    this.x = x; this.y = y;
    this.value = value;
    this.size = 4 + value * 0.6;
    this.alive = true;
    this.pickupTimer = 0.15;
    this.pulse = rand(0, TAU);
  }
  update(dt, player) {
    this.pulse += dt * 3;
    const d = dist(this, player);
    const magnetRange = player.magnetRange;
    if (d < magnetRange) {
      const a = angle(this, player);
      const speed = 200 * (1 - d / magnetRange);
      this.x += Math.cos(a) * speed * dt;
      this.y += Math.sin(a) * speed * dt;
    }
    this.pickupTimer -= dt;
    if (player.alive && d < player.size + this.size + 4 && this.pickupTimer <= 0) {
      this.alive = false;
      return true;
    }
    return false;
  }
}
