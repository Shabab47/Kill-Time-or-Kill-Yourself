function renderProjectiles(ctx, game) {
  for (const p of game.projectiles) {
    if (!p.alive || p.isSoulArrow) continue;
    const projSprite = p.owner === 'player' ? sprites.playerProj : sprites.enemyProj;
    const ss = p.size * 3;
    if (p.owner === 'player') {
      ctx.drawImage(sprites.playerProjGlow, p.x - ss, p.y - ss, ss * 2, ss * 2);
    }
    ctx.drawImage(projSprite, p.x - ss / 2, p.y - ss / 2, ss, ss);
  }
}