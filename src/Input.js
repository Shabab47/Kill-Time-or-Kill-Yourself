class Input {
  constructor() {
    this.keys = {};
    this.mouse = { x: 0, y: 0, down: false };
    this.touch = { active: false, id: -1, startX: 0, startY: 0, x: 0, y: 0, dx: 0, dy: 0 };
    this.touch2 = { active: false, id: -1, x: 0, y: 0, tapped: false };
    this.joystick = { x: 0, y: 0, magnitude: 0, angle: 0 };
    this.dashPressed = false;
    this.dashTapped = false;
    this.anyPressed = false;
    this.escapePressed = false;

    const self = this;
    document.addEventListener('keydown', e => {
      self.keys[e.key.toLowerCase()] = true;
      if (e.key === ' ') { self.dashPressed = true; e.preventDefault(); }
      self.anyPressed = true;
    });
    document.addEventListener('keyup', e => {
      self.keys[e.key.toLowerCase()] = false;
      if (e.key === 'Escape') self.escapePressed = true;
    });

    canvas.addEventListener('mousedown', e => { self.mouse.down = true; });
    canvas.addEventListener('mouseup', e => { self.mouse.down = false; });
    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      self.mouse.x = (e.clientX - rect.left) * DPR();
      self.mouse.y = (e.clientY - rect.top) * DPR();
    });

    canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        const rect = canvas.getBoundingClientRect();
        const tx = t.clientX - rect.left;
        const ty = t.clientY - rect.top;
        if (!self.touch.active && tx < DW() * 0.5) {
          self.touch.active = true;
          self.touch.id = t.identifier;
          self.touch.startX = tx;
          self.touch.startY = ty;
          self.touch.x = tx;
          self.touch.y = ty;
        } else if (!self.touch2.active && tx >= DW() * 0.7 && ty > DH() * 0.6) {
          self.touch2.active = true;
          self.touch2.id = t.identifier;
          self.dashTapped = true;
        }
      }
    }, { passive: false });

    canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        const rect = canvas.getBoundingClientRect();
        const tx = t.clientX - rect.left;
        const ty = t.clientY - rect.top;
        if (t.identifier === self.touch.id) { self.touch.x = tx; self.touch.y = ty; }
        if (t.identifier === self.touch2.id) { self.touch2.x = tx; self.touch2.y = ty; }
      }
    }, { passive: false });

    canvas.addEventListener('touchend', e => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        if (t.identifier === self.touch.id) {
          self.touch.active = false; self.touch.id = -1;
          self.joystick.x = 0; self.joystick.y = 0; self.joystick.magnitude = 0;
        }
        if (t.identifier === self.touch2.id) { self.touch2.active = false; self.touch2.id = -1; }
      }
    }, { passive: false });
  }

  update() {
    if (this.touch.active) {
      const dx = this.touch.x - this.touch.startX;
      const dy = this.touch.y - this.touch.startY;
      const maxDist = 60;
      const d = Math.hypot(dx, dy);
      const mag = Math.min(d / maxDist, 1);
      const a = d > 0 ? Math.atan2(dy, dx) : 0;
      this.joystick.x = Math.cos(a) * mag;
      this.joystick.y = Math.sin(a) * mag;
      this.joystick.magnitude = mag;
      this.joystick.angle = a;
    }
    this.dashPressed = this.dashPressed || this.dashTapped;
    this.anyPressed = this.anyPressed || this.dashTapped;
  }

  get moveX() {
    if (this.touch.active) return this.joystick.x;
    let v = 0;
    if (this.keys['a'] || this.keys['arrowleft']) v -= 1;
    if (this.keys['d'] || this.keys['arrowright']) v += 1;
    return v;
  }
  get moveY() {
    if (this.touch.active) return this.joystick.y;
    let v = 0;
    if (this.keys['w'] || this.keys['arrowup']) v -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) v += 1;
    return v;
  }
  getDash() {
    const v = this.dashPressed || this.dashTapped;
    this.dashPressed = false;
    this.dashTapped = false;
    return v;
  }
  getAny() {
    const v = this.anyPressed;
    this.anyPressed = false;
    return v;
  }
  endFrame() {
    this.dashTapped = false;
  }
}
const input = new Input();
