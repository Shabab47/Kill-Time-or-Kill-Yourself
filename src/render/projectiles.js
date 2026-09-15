function renderProjectiles(ctx, game) {
  for (const p of game.projectiles) {
    if (!p.alive || p.isSoulArrow) continue;

    if (p.isAxe) {   // spinning reaper's axe, rendered from the Throw axe sprite
      const axe = sprites.throwAxe;
      if (axe && axe.ready && axe.w > 0) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p._spin || 0);
        ctx.shadowColor = 'rgba(79, 195, 247, 0.9)';   // light-blue glow for visibility
        ctx.shadowBlur = 16;
        const fit = 64.0 / axe.h;        // 2x sprite size, height clamped to 64 world px
        ctx.drawImage(axe.img, -axe.w * fit / 2, -32, axe.w * fit, 64);
        ctx.restore();
      }
      continue;
    }

    const projSprite = p.owner === 'player' ? sprites.playerProj : sprites.enemyProj;
    const ss = p.size * 3;
    if (p.owner === 'player') {
      ctx.drawImage(sprites.playerProjGlow, p.x - ss, p.y - ss, ss * 2, ss * 2);
    }
    ctx.drawImage(projSprite, p.x - ss / 2, p.y - ss / 2, ss, ss);
  }
}