sprite('enemyProj', 12, 12, (ctx, w, h) => {
  const x = w / 2, y = h / 2;
  const g = ctx.createRadialGradient(x, y, 0, x, y, 5);
  g.addColorStop(0, '#f3e5f5');
  g.addColorStop(0.4, '#e040fb');
  g.addColorStop(1, '#7b1fa2');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, TAU);
  ctx.fill();
});
