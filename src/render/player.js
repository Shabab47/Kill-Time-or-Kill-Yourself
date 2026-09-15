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

  // Scythe swing overlay: the handle (left edge) pivots close to the player
  // while the blade sweeps around; the aura marks the arc the blade reaches.
  if (p.scytheOverlay > 0 && p.attackAnimMax > 0) {
    const total = p.attackAnimMax + p.scytheLinger;
    const progress = 1 - Math.max(0, p.scytheOverlay) / total;
    // Fade out only during the very last stretch of the lingering tail.
    const fade = progress > 0.85 ? 1 - (progress - 0.85) / 0.15 : 1;
    // The swing itself completes early into the overlay, then holds in place
    // while the tail fades — reads as a faster, snappier slash.
    const swingP = Math.min(1, progress * 1.8);

    // Aura — sits out at the blade's reach, sized to cover the whole swing.
    const aura = sprites.scytheAura;
    if (aura && aura.ready && aura.w > 0) {
      const range = p.attackRange;
      const centerX = p.x + Math.cos(p.lastAttackAngle) * range * 0.62;
      const centerY = p.y + Math.sin(p.lastAttackAngle) * range * 0.62;
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(p.lastAttackAngle);
      ctx.shadowColor = 'rgba(92,225,255,0.9)';
      ctx.shadowBlur = 20;
      ctx.globalAlpha = 0.85 * fade;
      // Width (across the swing arc) is enlarged; the reach extent stays natural.
      const h = range * 1.4;
      const w = aura.w / aura.h * h;
      ctx.drawImage(aura.img, -w / 2, -h / 2, w, h);
      ctx.restore();
    }

    // Scythe — left (handle) end sits on the pivot, the rest swings through.
    const scy = sprites.scythe;
    if (scy && scy.ready && scy.w > 0) {
      const sweep = p.lastAttackAngle + (swingP - 0.5) * 1.8;
      // Pivot sits clear of the player's body so the handle never overlaps.
      const pivotX = p.x + Math.cos(p.lastAttackAngle) * p.size * 1.6;
      const pivotY = p.y + Math.sin(p.lastAttackAngle) * p.size * 1.6;
      ctx.save();
      ctx.translate(pivotX, pivotY);
      ctx.rotate(sweep);
      ctx.shadowColor = 'rgba(92,225,255,0.8)';
      ctx.shadowBlur = 14;
      ctx.globalAlpha = fade;
      const h = p.size * 4.4;
      const w = scy.w / scy.h * h;
      ctx.drawImage(scy.img, 0, -h / 2, w, h);     // handle edge on the pivot
      ctx.restore();
    }
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