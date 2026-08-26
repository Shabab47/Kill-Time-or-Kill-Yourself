function renderProjectiles(ctx, game) {
  for (const p of game.projectiles) {
    if (!p.alive || p.isSoulArrow) continue;

    if (p.isAxe) {   // spinning reaper's axe: blade + handle drawn rotated
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p._spin || 0);
      ctx.fillStyle = '#5d4037';                    // handle
      ctx.fillRect(-1.5, -10, 3, 20);
      ctx.fillStyle = '#b0bec5';                    // blade edge
      ctx.beginPath();
      ctx.moveTo(-2, -10);
      ctx.lineTo(-12, -4);
      ctx.lineTo(-2, 2);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();                              // mirrored blade
      ctx.moveTo(2, -10);
      ctx.lineTo(12, -4);
      ctx.lineTo(2, 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#78909c';                    // blade shading
      ctx.fillRect(-12, -4.5, 24, 1.5);
      ctx.restore();
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