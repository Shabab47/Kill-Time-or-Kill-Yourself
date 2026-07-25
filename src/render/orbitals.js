function renderOrbitals(ctx, game) {
  for (const orb of game.orbitals) {
    const p = game.player;
    if (!p || !p.alive) continue;
    const fx = p.x + Math.cos(orb.angle) * p.orbitalRadius;
    const fy = p.y + Math.sin(orb.angle) * p.orbitalRadius;
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