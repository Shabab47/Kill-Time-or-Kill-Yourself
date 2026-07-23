sprite('playerProjGlow', 28, 28, (ctx, w, h) => {
  const x = w / 2, y = h / 2;
  const g = ctx.createRadialGradient(x, y, 0, x, y, 13);
  g.addColorStop(0, 'rgba(206,147,216,0.4)');
  g.addColorStop(1, 'rgba(206,147,216,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, 13, 0, TAU);
  ctx.fill();
});
