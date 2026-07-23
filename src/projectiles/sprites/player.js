sprite('playerProj', 16, 16, (ctx, w, h) => {
  const x = w / 2, y = h / 2;
  const g = ctx.createRadialGradient(x, y, 0, x, y, 7);
  g.addColorStop(0, '#e1bee7');
  g.addColorStop(0.4, '#ce93d8');
  g.addColorStop(1, '#7c4dff');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, 7, 0, TAU);
  ctx.fill();
});
