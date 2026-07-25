function renderSoulArrows(ctx, game) {
  for (const p of game.projectiles) {
    if (!p.alive || !p.isSoulArrow) continue;
    const frame = getSoulArrowFrame(game.gameTime);
    if (!frame) continue;
    const sc = (72 / frame.w) * 1.25;
    const sw = frame.w * sc, sh = frame.h * sc;
    const x = Math.round(p.x), y = Math.round(p.y);
    const a = p._angle || 0;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a + Math.PI);

    ctx.shadowColor = '#5b1a66';
    ctx.shadowBlur = 25;
    ctx.drawImage(frame.img, -sw / 2, -sh / 2, sw, sh);

    ctx.shadowBlur = 0;
    ctx.restore();
  }
}