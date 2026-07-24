function renderPlayer(ctx, game) {
  if (!game.player || !game.player.alive) return;
  const p = game.player;
  const ss = p.size * 2.8;
  ctx.save();

  let action = 'idle';
  if (p.animState === 'attack') action = 'attack';
  else if (p.animState === 'dash') action = p.dashFrame === 0 ? 'jump' : 'fall';
  else if (p.animState === 'walk') action = p.walkFrame === 0 ? 'walk' : 'run';

  const spriteEntry = getPlayerSprite(action, p.facing);

  if (spriteEntry && spriteEntry.img.complete) {
    const targetH = p.size * 4.6;
    const scale = targetH / spriteEntry.h;
    const drawW = spriteEntry.w * scale;
    const drawH = targetH;
    const drawX = p.x - drawW / 2;
    const drawY = p.y + p.size * 0.9 - drawH;

    ctx.shadowColor = '#5ce1ff';
    ctx.shadowBlur = 18;
    ctx.drawImage(spriteEntry.img, drawX, drawY, drawW, drawH);
    ctx.shadowBlur = 0;
  } else {
    ctx.fillStyle = '#123a4a';
    ctx.beginPath();
    ctx.arc(p.x, p.y, ss / 2, 0, TAU);
    ctx.fill();
  }

  if (p.invincibleTimer > 0) {
    ctx.strokeStyle = `rgba(255,200,200,${0.3 + Math.sin(p.invincibleTimer * 40) * 0.2})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, ss / 2 + 4, 0, TAU);
    ctx.stroke();
  }

  if (p.dashCooldown > 0) {
    ctx.strokeStyle = 'rgba(180,180,180,0.15)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(p.x, p.y, ss / 2 + 8, 0, TAU * (1 - p.dashCooldown / p.baseDashCooldown));
    ctx.stroke();
  }
  ctx.restore();
}