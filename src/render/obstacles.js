function renderObstacles(ctx, game, dw, dh) {
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
}