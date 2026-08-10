class Camera {
  constructor() {
    this.x = 0; this.y = 0;
    this.shakeX = 0; this.shakeY = 0;
    this.shakeMag = 0;
    this.shakeDecay = 4;
  }
  shake(mag) { this.shakeMag = Math.max(this.shakeMag, mag); }
  follow(target, dt) {
    this.x = target.x - DW() / RENDER_SCALE / 2;
    this.y = target.y - DH() / RENDER_SCALE / 2;
    if (this.shakeMag > 0.1) {
      this.shakeMag -= dt * this.shakeDecay;
      this.shakeX = rand(-this.shakeMag, this.shakeMag);
      this.shakeY = rand(-this.shakeMag, this.shakeMag);
    } else {
      this.shakeMag = 0; this.shakeX = 0; this.shakeY = 0;
    }
  }
  get sx() { return this.x + this.shakeX; }
  get sy() { return this.y + this.shakeY; }
}
