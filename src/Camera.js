class Camera {
  constructor() {
    this.x = 0; this.y = 0;
    this.shakeX = 0; this.shakeY = 0;
    this.shakeMag = 0;
    this.shakeDecay = 4;
  }
  shake(mag) { this.shakeMag = Math.max(this.shakeMag, mag); }
  follow(target, dt) {
    const tx = target.x - DW() / 2;
    const ty = target.y - DH() / 2;
    this.x = lerp(this.x, tx, 1 - Math.pow(0.01, dt));
    this.y = lerp(this.y, ty, 1 - Math.pow(0.01, dt));
    if (this.shakeMag > 0.1) {
      this.shakeX = rand(-this.shakeMag, this.shakeMag);
      this.shakeY = rand(-this.shakeMag, this.shakeMag);
      this.shakeMag -= this.shakeDecay * dt;
    } else {
      this.shakeX = 0; this.shakeY = 0; this.shakeMag = 0;
    }
  }
  get sx() { return this.x + this.shakeX; }
  get sy() { return this.y + this.shakeY; }
}
