function renderFloatingNumbers(ctx, game) {
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const fn of game.floatingNumbers) {
    ctx.globalAlpha = fn.life / fn.maxLife;
    ctx.fillStyle = fn.color;
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 3;
    ctx.strokeText(fn.text, fn.x, fn.y);
    ctx.fillText(fn.text, fn.x, fn.y);
  }
  ctx.globalAlpha = 1;
  ctx.lineWidth = 1;
}