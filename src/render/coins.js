function renderCoins(ctx, game) {
  for (const coin of game.coins) {
    if (!coin.alive) continue;
    const pulse = Math.sin(coin.pulse) * 0.18 + 1;
    const size = coin.size * 2.4 * pulse;
    // Fake a spin by squashing the horizontal axis.
    const squash = Math.abs(Math.cos(coin.spin));
    const drawW = size * (0.35 + 0.65 * squash);
    const drawH = size;

    ctx.save();
    ctx.shadowColor = '#c9a84c';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#c9a84c';
    ctx.beginPath();
    ctx.ellipse(coin.x, coin.y, drawW / 2, drawH / 2, 0, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Inner highlight so the coin reads as metal, not a flat dot.
    ctx.fillStyle = 'rgba(255,240,190,0.85)';
    ctx.beginPath();
    ctx.ellipse(coin.x - drawW * 0.12, coin.y - drawH * 0.16, drawW * 0.18, drawH * 0.28, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
}
