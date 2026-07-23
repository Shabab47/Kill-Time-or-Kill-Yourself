sprite('torchPost', 16, 32, (ctx, w, h) => {
  ctx.fillStyle = '#1a1410';
  ctx.fillRect(5, 2, 6, 30);
  ctx.fillStyle = '#2a1e14';
  ctx.fillRect(6, 2, 2, 30);
  ctx.fillStyle = '#0d0a08';
  ctx.fillRect(4, 0, 8, 4);
  ctx.fillRect(6, 0, 4, 2);
});

sprite('torchFlame', 24, 28, (ctx, w, h) => {
  const cx = w / 2;
  const g = ctx.createRadialGradient(cx, 20, 0, cx, 20, 12);
  g.addColorStop(0, '#fff7e0');
  g.addColorStop(0.2, '#ffaa33');
  g.addColorStop(0.5, '#ff5500');
  g.addColorStop(0.75, '#cc2200');
  g.addColorStop(1, 'rgba(80,10,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(cx, 4);
  ctx.quadraticCurveTo(cx + 10, 14, cx + 8, 24);
  ctx.quadraticCurveTo(cx, 30, cx - 8, 24);
  ctx.quadraticCurveTo(cx - 10, 14, cx, 4);
  ctx.closePath();
  ctx.fill();
});

sprite('torchGlow', 120, 120, (ctx, w, h) => {
  const cx = w / 2, cy = h / 2 + 10;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
  g.addColorStop(0, 'rgba(255,170,50,0.15)');
  g.addColorStop(0.3, 'rgba(255,85,0,0.08)');
  g.addColorStop(0.6, 'rgba(200,30,0,0.03)');
  g.addColorStop(1, 'rgba(200,30,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, 60, 0, TAU);
  ctx.fill();
});

sprite('torchFloorGlow', 100, 50, (ctx, w, h) => {
  const cx = w / 2, cy = h;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 50);
  g.addColorStop(0, 'rgba(255,150,30,0.08)');
  g.addColorStop(0.4, 'rgba(200,60,10,0.04)');
  g.addColorStop(1, 'rgba(200,60,10,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 50, 25, 0, 0, TAU);
  ctx.fill();
});
