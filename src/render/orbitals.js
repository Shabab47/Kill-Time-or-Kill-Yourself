function renderAura(ctx, game) {
  const p = game.player;
  if (!p || !p.alive || !p.weapons.garlic) return;
  const flicker = 1 + Math.sin(game.gameTime * 6) * 0.02;
  const r = p.garlicRadius * flicker;
  const gradient = ctx.createRadialGradient(p.x, p.y, r * 0.35, p.x, p.y, r);
  gradient.addColorStop(0, 'rgba(255,112,67,0)');
  gradient.addColorStop(0.75, 'rgba(255,87,34,0.06)');
  gradient.addColorStop(1, 'rgba(255,70,20,0.16)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, TAU);
  ctx.fill();
}

function renderOrbitals(ctx, game) {
  for (const orb of game.orbitals) {
    const p = game.player;
    if (!p || !p.alive) continue;
    const fx = p.x + Math.cos(orb.angle) * p.orbitalRadius;
    const fy = (p.y - p.size * 1.4) + Math.sin(orb.angle) * p.orbitalRadius;
    const pulse = 0.9 + Math.sin(game.gameTime * 8 + orb.angle) * 0.1;
    const gs = 74 * pulse;
    ctx.drawImage(sprites.orbitalGlow, fx - gs / 2, fy - gs / 2, gs, gs);
    const fb = getFireBallFrame(game.gameTime);
    if (fb) {
      const targetH = 74 * pulse;
      const scale = targetH / fb.h;
      ctx.drawImage(fb.img, fx - fb.w * scale / 2, fy - targetH / 2, fb.w * scale, targetH);
    }
  }
}