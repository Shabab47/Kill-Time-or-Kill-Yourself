// A dropped gold coin. Behaves like an XP orb (magnetised toward the player
// once inside pickup range) but carries the shop currency instead of XP.
class Coin {
  constructor(x, y, value) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.size = 4 + value * 0.5;
    this.alive = true;
    this.pickupTimer = 0.15;
    this.pulse = rand(0, TAU);
    this.spin = rand(0, TAU);
  }

  update(deltaTime, player) {
    this.pulse += deltaTime * 3;
    this.spin += deltaTime * 4;
    const distance = dist(this, player);
    const magnetRange = player.magnetRange;
    if (distance < magnetRange) {
      const pull = angle(this, player);
      // Coins are lighter than XP: they drift in a little slower.
      const speed = 170 * (1 - distance / magnetRange);
      this.x += Math.cos(pull) * speed * deltaTime;
      this.y += Math.sin(pull) * speed * deltaTime;
    }
    this.pickupTimer -= deltaTime;
    if (player.alive && distance < player.size + this.size + 4 && this.pickupTimer <= 0) {
      this.alive = false;
      return true;
    }
    return false;
  }
}
