function renderLightningStrikes(ctx, game) {
  for (const strike of game.lightningStrikes) {
    const frame = getLightningFrame(game.gameTime);
    if (!frame) continue;
    const progress = 1 - strike.timer / strike.maxTimer;
    const sc = (120 / frame.w) * 1.5;
    const sw = frame.w * sc;
    const sh = frame.h * sc;
    const x = Math.round(strike.x);

    ctx.save();
    ctx.shadowColor = '#88ccff';
    ctx.shadowBlur = 30;

    if (progress < 0.6) {
      const t = progress / 0.6;
      const curY = strike.startY + (strike.y - strike.startY) * t;
      const alpha = t;
      ctx.globalAlpha = alpha;
      const stretch = 1 + (1 - t) * 2;
      ctx.drawImage(frame.img, x - sw / 2, curY - sh * stretch, sw, sh * stretch);
    } else {
      const t = (progress - 0.6) / 0.4;
      const flash = t < 0.3 ? 1 : 1 - (t - 0.3) / 0.7;
      ctx.globalAlpha = flash;
      ctx.shadowBlur = 30 + flash * 20;
      ctx.drawImage(frame.img, x - sw / 2, strike.y - sh, sw, sh);
    }

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}
