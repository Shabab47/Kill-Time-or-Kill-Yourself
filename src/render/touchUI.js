function renderTouchUI(ctx, dw, dh) {
  if (input.touch.active) {
    const cx = input.touch.startX;
    const cy = input.touch.startY;
    const jx = input.joystick.x;
    const jy = input.joystick.y;
    const js = 50;
    ctx.fillStyle = 'rgba(40,40,40,0.08)';
    ctx.beginPath();
    ctx.arc(cx, cy, js, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(100,100,100,0.15)';
    ctx.beginPath();
    ctx.arc(cx + jx * js, cy + jy * js, 18, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(201,168,76,0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, js, 0, TAU);
    ctx.stroke();
  }

  if (input.touch2.active || navigator.maxTouchPoints > 0) {
    const bx = dw - 60;
    const by = dh - 60;
    ctx.fillStyle = 'rgba(40,40,40,0.1)';
    ctx.beginPath();
    ctx.arc(bx, by, 32, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(201,168,76,0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(bx, by, 32, 0, TAU);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💨', bx, by);
  }
}