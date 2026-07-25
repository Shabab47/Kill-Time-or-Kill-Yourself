function renderParticles(ctx, game) {
  for (const part of game.particles.particles) {
    const alpha = part.life / part.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = part.color;
    if (part.glow) {
      ctx.shadowColor = part.color;
      ctx.shadowBlur = 8;
    }
    ctx.beginPath();
    ctx.arc(part.x, part.y, part.shrink ? part.size * alpha : part.size, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  ctx.globalAlpha = 1;
}