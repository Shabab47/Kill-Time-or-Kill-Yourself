sprite('grassTile', 60, 60, (ctx, w, h) => {
  const base = ['#2a3320', '#2d3622', '#28311e', '#2f3825'];
  ctx.fillStyle = base[randInt(0, 3)];
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 12; i++) {
    ctx.fillStyle = `hsla(${randInt(90, 130)}, ${randInt(15, 35)}%, ${randInt(12, 20)}%, ${rand(0.3, 0.6)})`;
    const dx = rand(0, w);
    const dy = rand(0, h);
    ctx.fillRect(dx, dy, rand(1, 3), rand(3, 8));
  }
  ctx.fillStyle = 'rgba(60,40,20,0.08)';
  for (let i = 0; i < 3; i++) {
    const dx = rand(4, w - 8);
    const dy = rand(4, h - 8);
    ctx.beginPath();
    ctx.ellipse(dx, dy, rand(4, 10), rand(2, 4), rand(0, TAU), 0, TAU);
    ctx.fill();
  }
});

sprite('orbitalGlow', 40, 40, (ctx, w, h) => {
  const cx = w / 2, cy = h / 2;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, w / 2);
  grad.addColorStop(0, 'rgba(255,120,50,0.5)');
  grad.addColorStop(0.4, 'rgba(255,60,10,0.2)');
  grad.addColorStop(1, 'rgba(200,30,0,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, w / 2, 0, TAU);
  ctx.fill();
});

sprite('mudTile', 60, 60, (ctx, w, h) => {
  const base = ['#2a1f14', '#2d2217', '#271c11', '#30251a'];
  ctx.fillStyle = base[randInt(0, 3)];
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(40,30,20,0.4)';
  for (let i = 0; i < 5; i++) {
    const dx = rand(2, w - 6);
    const dy = rand(2, h - 6);
    ctx.beginPath();
    ctx.ellipse(dx, dy, rand(6, 14), rand(3, 6), rand(0, TAU), 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(80,60,30,0.06)';
  for (let i = 0; i < 8; i++) {
    const dx = rand(0, w);
    const dy = rand(0, h);
    ctx.fillRect(dx, dy, rand(1, 2), 1);
  }
});
