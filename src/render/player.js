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

  const spriteCenterY = p.y - p.size * 1.4;

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

  if (p.shieldActive) {
    const r = p.size * 3.5;
    const pulse = 0.35 + Math.sin(Date.now() * 0.004) * 0.15;
    const grad = ctx.createRadialGradient(p.x, spriteCenterY, r * 0.15, p.x, spriteCenterY, r);
    grad.addColorStop(0, `rgba(80,160,255,${pulse})`);
    grad.addColorStop(0.5, `rgba(50,130,255,${pulse * 0.7})`);
    grad.addColorStop(1, 'rgba(30,80,255,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, spriteCenterY, r, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = `rgba(100,200,255,${pulse * 0.8})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, spriteCenterY, r, 0, TAU);
    ctx.stroke();
  } else if (p.invincibleTimer > 0) {
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