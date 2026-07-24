function renderFloatingNumbers(ctx, game) {
  for (const fn of game.floatingNumbers) {
    const alpha = fn.life / fn.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = fn.color;
    ctx.font = `bold ${fn.size}px Cinzel, Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 6;
    ctx.fillText(fn.text, fn.x, fn.y);
    ctx.shadowBlur = 0;
  }
}