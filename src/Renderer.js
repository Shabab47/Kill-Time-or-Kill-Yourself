class Renderer {
  render(game) {
    const w = W(), h = H();
    const scale = DPR();
    const dw = DW(), dh = DH();

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#120c08';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.scale(scale, scale);
    ctx.translate(-game.cam.sx, -game.cam.sy);

    const tileSize = 60;
    function hash2d(a, b) {
      let h = a * 374761393 + b * 668265263;
      h = (h ^ (h >> 13)) * 1274126177;
      return (h ^ (h >> 16)) & 0x7fffffff;
    }
    const startTileX = Math.floor(game.cam.sx / tileSize);
    const startTileY = Math.floor(game.cam.sy / tileSize);
    const endTileX = Math.ceil((game.cam.sx + dw) / tileSize);
    const endTileY = Math.ceil((game.cam.sy + dh) / tileSize);
    for (let tx = startTileX; tx <= endTileX; tx++) {
      for (let ty = startTileY; ty <= endTileY; ty++) {
        const h = hash2d(tx, ty);
        const tile = h % 7 < 5 ? sprites.grassTile : sprites.mudTile;
        ctx.drawImage(tile, tx * tileSize, ty * tileSize, tileSize, tileSize);
      }
    }

    const duskHaze = ctx.createRadialGradient(dw / 2, dh * 0.2, dw * 0.1, dw / 2, dh * 0.1, dw * 1.2);
    duskHaze.addColorStop(0, 'rgba(200,120,60,0.04)');
    duskHaze.addColorStop(0.5, 'rgba(180,90,50,0.025)');
    duskHaze.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = duskHaze;
    ctx.fillRect(0, 0, dw, dh);
    ctx.restore();

    for (const ob of game.obstacles) {
      if (!ob.alive || ob.type === 'tombstone') continue;
      if (ob.x + ob.w < game.cam.sx - 60 || ob.x > game.cam.sx + dw + 60) continue;
      if (ob.y + ob.h < game.cam.sy - 60 || ob.y > game.cam.sy + dh + 60) continue;

      if (ob.type === 'bloodPool') {
        const flicker = 0.7 + Math.sin(game.gameTime * 1.5 + ob.x) * 0.3;
        ctx.globalAlpha = 0.4 * flicker;
        ctx.fillStyle = '#1a0000';
        ctx.beginPath();
        ctx.ellipse(ob.x + ob.w / 2, ob.y + ob.h / 2, ob.w / 2, ob.h / 2, 0, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#0d0000';
        ctx.beginPath();
        ctx.ellipse(ob.x + ob.w / 2 - 2, ob.y + ob.h / 2 - 1, ob.w / 3, ob.h / 3, 0, 0, TAU);
        ctx.fill();
        ctx.globalAlpha = 1;
        continue;
      }

      ctx.fillStyle = '#0d0d0d';
      ctx.fillRect(ob.x, ob.y, ob.w, ob.h);

      if (ob.type === 'pillar') {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(ob.x + 1, ob.y + 1, ob.w - 2, ob.h - 2);
        ctx.strokeStyle = 'rgba(50,50,50,0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(ob.x, ob.y, ob.w, ob.h);
        ctx.fillStyle = 'rgba(60,60,60,0.05)';
        ctx.beginPath();
        ctx.arc(ob.x + ob.w / 2, ob.y + ob.h / 2, ob.w / 2 - 2, 0, TAU);
        ctx.fill();
      } else if (ob.type === 'rubble') {
        ctx.fillStyle = '#0d0d0d';
        ctx.beginPath();
        ctx.arc(ob.x + ob.w / 2, ob.y + ob.h / 2, Math.min(ob.w, ob.h) / 2, 0, TAU);
        ctx.fill();
        ctx.fillStyle = 'rgba(30,30,30,0.08)';
        ctx.beginPath();
        ctx.arc(ob.x + ob.w / 2 - 2, ob.y + ob.h / 2 - 1, Math.min(ob.w, ob.h) / 3, 0, TAU);
        ctx.fill();
      }
    }

    for (const ob of game.obstacles) {
      if (!ob.alive || ob.type !== 'tombstone') continue;
      if (ob.x + ob.w < game.cam.sx - 60 || ob.x > game.cam.sx + dw + 60) continue;
      if (ob.y + ob.h < game.cam.sy - 60 || ob.y > game.cam.sy + dh + 60) continue;

      ctx.fillStyle = '#0d0d0d';
      ctx.fillRect(ob.x, ob.y, ob.w, ob.h);
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(ob.x + 1, ob.y + 1, ob.w - 2, ob.h - 2);
      ctx.strokeStyle = 'rgba(60,60,60,0.15)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(ob.x + 0.5, ob.y + 0.5, ob.w - 1, ob.h - 1);

      ctx.strokeStyle = 'rgba(80,80,80,0.08)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(ob.x + ob.w / 2, ob.y + ob.h * 0.3, ob.w * 0.3, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = 'rgba(80,80,80,0.04)';
      ctx.beginPath();
      ctx.arc(ob.x + ob.w / 2, ob.y + ob.h * 0.3, ob.w * 0.2, 0, TAU);
      ctx.fill();
    }

    for (const ob of game.obstacles) {
      if (!ob.alive || !ob.hasTorch) continue;
      const flameScale = 0.85 + Math.sin(game.gameTime * 6 + ob.torchPhase) * 0.15;
      const flicker = 0.8 + Math.sin(game.gameTime * 4 + ob.torchPhase * 1.3) * 0.2;

      ctx.globalAlpha = 0.5 * flicker;
      ctx.drawImage(sprites.torchFloorGlow, ob.x + ob.w / 2 - 50, ob.y + ob.h - 25, 100, 50);
      ctx.globalAlpha = 1;

      ctx.drawImage(sprites.torchPost, ob.x + ob.w / 2 - 8, ob.y - 32, 16, 32);

      const fw = 24 * flameScale;
      const fh = 28 * flameScale;
      const fx = ob.x + ob.w / 2 - fw / 2;
      const fy = ob.y - 28 - fh + 4;
      ctx.drawImage(sprites.torchFlame, fx, fy, fw, fh);

      ctx.globalAlpha = 0.7 * flicker;
      const gw = 120 * flameScale;
      const gh = 120 * flameScale;
      ctx.drawImage(sprites.torchGlow, ob.x + ob.w / 2 - gw / 2, ob.y - 28 - gh / 2 + 10, gw, gh);
      ctx.globalAlpha = 1;
    }

    const border = 30;
    if (game.cam.sx < border || game.cam.sy < border || game.cam.sx + dw > G.worldSize - border || game.cam.sy + dh > G.worldSize - border) {
      ctx.fillStyle = 'rgba(30,30,30,0.08)';
      ctx.fillRect(0, 0, G.worldSize, border);
      ctx.fillRect(0, G.worldSize - border, G.worldSize, border);
      ctx.fillRect(0, 0, border, G.worldSize);
      ctx.fillRect(G.worldSize - border, 0, border, G.worldSize);
    }

    for (const orb of game.xpOrbs) {
      if (!orb.alive) continue;
      const pulse = Math.sin(orb.pulse) * 0.3 + 1;
      const ss = orb.size * pulse * 2.5;
      ctx.shadowColor = '#c62828';
      ctx.shadowBlur = 10;
      ctx.drawImage(sprites.xp, orb.x - ss / 2, orb.y - ss / 2, ss, ss);
      ctx.shadowBlur = 0;
    }

    for (const item of game.items) {
      if (!item.alive) continue;
      const pulse = Math.sin(item.pulse) * 0.15 + 1;
      const ss = item.size * pulse * 2.2;
      ctx.shadowColor = item.glowColor;
      ctx.shadowBlur = 14;
      ctx.drawImage(sprites[item.spriteId], item.x - ss / 2, item.y - ss / 2, ss, ss);
      ctx.shadowBlur = 0;
    }

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

    for (const p of game.projectiles) {
      if (!p.alive) continue;
      const projSprite = p.owner === 'player' ? sprites.playerProj : sprites.enemyProj;
      const ss = p.size * 3;
      if (p.owner === 'player') {
        ctx.drawImage(sprites.playerProjGlow, p.x - ss, p.y - ss, ss * 2, ss * 2);
      }
      ctx.drawImage(projSprite, p.x - ss / 2, p.y - ss / 2, ss, ss);
    }

    if (game.player && game.player.alive) {
      const p = game.player;
      const ss = p.size * 2.8;
      ctx.save();

      // Pick which sheet row (action) to pull the current frame from based
      // on the player's animation state, and alternate frames for the
      // 2-pose walk/dash cycles.
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
        // Fallback while the sprite sheet is still decoding (should only
        // ever be visible for a frame or two right after page load).
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

    for (const orb of game.orbitals) {
      const p = game.player;
      if (!p || !p.alive) continue;
      const fx = p.x + Math.cos(orb.angle) * p.orbitalRadius;
      const fy = p.y + Math.sin(orb.angle) * p.orbitalRadius;
      const pulse = 0.9 + Math.sin(game.gameTime * 8 + orb.angle) * 0.1;
      const gs = 28 * pulse;
      ctx.drawImage(sprites.orbitalGlow, fx - gs / 2, fy - gs / 2, gs, gs);
      const fb = getFireBallFrame(game.gameTime);
      if (fb) {
        const targetH = 28 * pulse;
        const scale = targetH / fb.h;
        ctx.drawImage(fb.img, fx - fb.w * scale / 2, fy - targetH / 2, fb.w * scale, targetH);
      }
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
    ctx.globalAlpha = 1;

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

    ctx.restore();

    if (input.touch.active) {
      const cx = input.touch.startX;
      const cy = input.touch.startY;
      const jx = input.joystick.x;
      const jy = input.joystick.y;
      const js = 50;
      ctx.fillStyle = 'rgba(40,40,40,0.08)';
      ctx.beginPath();
      ctx.arc(cx, cy, js, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(100,100,100,0.15)';
      ctx.beginPath();
      ctx.arc(cx + jx * js, cy + jy * js, 18, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = 'rgba(201,168,76,0.1)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, js, 0, TAU);
      ctx.stroke();
    }

    if (input.touch2.active || navigator.maxTouchPoints > 0) {
      const bx = dw - 60;
      const by = dh - 60;
      ctx.fillStyle = 'rgba(40,40,40,0.1)';
      ctx.beginPath();
      ctx.arc(bx, by, 32, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = 'rgba(201,168,76,0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bx, by, 32, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('💨', bx, by);
    }

    const vignette = ctx.createRadialGradient(dw / 2, dh / 2, dw * 0.25, dw / 2, dh / 2, dw * 0.65);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, dw, dh);
  }
}
