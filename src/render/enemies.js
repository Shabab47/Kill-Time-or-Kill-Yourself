function renderEnemies(ctx, game, dw, dh) {
  for (const e of game.enemies) {
    if (!e.alive) continue;
    const ss = e.size * 2.8;
    ctx.save();

    if (e.type === 'skeleton' && ENEMY_SPRITES.skeleton) {
      const spriteEntry = getEnemySprite('skeleton', e.animState || 'idle', e.facing || 'S', e.animFrame || 0);
      if (spriteEntry) {
        const sizeMult = e.animState === 'dead' ? 0.65 : 1;
        const targetH = e.size * 4.6 * sizeMult;
        const scale = targetH / spriteEntry.h;
        const drawW = spriteEntry.w * scale;
        const drawH = targetH;
        const drawX = e.x - drawW / 2;
        const drawY = e.y + e.size * 0.9 - drawH;
        ctx.drawImage(spriteEntry.img, drawX, drawY, drawW, drawH);
      } else {
        ctx.drawImage(sprites[e.type], e.x - ss / 2, e.y - ss / 2, ss, ss);
      }
    } else {
      ctx.drawImage(sprites[e.type], e.x - ss / 2, e.y - ss / 2, ss, ss);
    }

    if (e.hitFlash > 0) {
      ctx.fillStyle = `rgba(255,200,200,${e.hitFlash * 5})`;
      ctx.beginPath();
      ctx.arc(e.x, e.y, ss / 2, 0, TAU);
      ctx.fill();
    }

    if (e.type === 'lich') {
      const phaseColors = ['rgba(198,40,40,0.2)', 'rgba(198,40,40,0.3)', 'rgba(255,23,68,0.35)'];
      const phaseColor = phaseColors[(e.phase || 1) - 1];
      ctx.strokeStyle = phaseColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(e.x, e.y, ss / 2 + 8 + Math.sin(game.gameTime * 2) * 3, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = phaseColor.replace('0.2', '0.04').replace('0.3', '0.06').replace('0.35', '0.07');
      ctx.beginPath();
      ctx.arc(e.x, e.y, ss / 2 + 16, 0, TAU);
      ctx.fill();
    }

    if (e.elite) {   // elites wear a pulsing golden crown-ring
      const pulse = 6 + Math.sin(game.gameTime * 4) * 3;
      ctx.strokeStyle = 'rgba(201,168,76,0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(e.x, e.y, ss / 2 + pulse, 0, TAU);
      ctx.stroke();
    }

    if (e.hp < e.maxHp) {
      const barW = ss * 0.9;
      const barH = 3;
      const bx = e.x - barW / 2;
      const by = e.y - ss / 2 - 6;
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(bx, by, barW, barH);
      ctx.fillStyle = e.hp / e.maxHp > 0.5 ? '#c62828' : e.hp / e.maxHp > 0.25 ? '#ff4444' : '#4a0000';
      ctx.fillRect(bx, by, barW * (e.hp / e.maxHp), barH);
    }

    if (e.type === 'cultist') {
      ctx.strokeStyle = 'rgba(198,40,40,0.12)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 6]);
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.shootRange, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  }

  for (const e of game.enemies) {
    if (!e.alive || e.type !== 'lich') continue;
    const ss = e.size * 2.8;
    const phaseColors = ['rgba(198,40,40,0.03)', 'rgba(198,40,40,0.05)', 'rgba(255,23,68,0.06)'];
    ctx.fillStyle = phaseColors[(e.phase || 1) - 1];
    ctx.beginPath();
    ctx.arc(e.x, e.y, ss / 2 + 22 + Math.sin(game.gameTime * 3) * 5, 0, TAU);
    ctx.fill();
  }
}