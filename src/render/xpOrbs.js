function renderXpOrbs(ctx, game) {
  for (const orb of game.xpOrbs) {
    if (!orb.alive) continue;
    const pulse = Math.sin(orb.pulse) * 0.3 + 1;
    const ss = orb.size * pulse * 2.5;
    ctx.shadowColor = '#c62828';
    ctx.shadowBlur = 10;
    ctx.drawImage(sprites.xp, orb.x - ss / 2, orb.y - ss / 2, ss, ss);
    ctx.shadowBlur = 0;
  }
}