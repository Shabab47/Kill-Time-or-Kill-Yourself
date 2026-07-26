function renderItems(ctx, game) {
  for (const item of game.items) {
    if (!item.alive) continue;
    const pulse = Math.sin(item.pulse) * 0.15 + 1;
    const sw = item.size * pulse * 2.2 * (item.scaleX || 1);
    const sh = item.size * pulse * 2.2 * (item.scaleY || 1);
    ctx.shadowColor = item.glowColor;
    ctx.shadowBlur = 14;
    if (item.type === 'shield') {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }
    ctx.drawImage(sprites[item.spriteId], item.x - sw / 2, item.y - sh / 2, sw, sh);
    ctx.imageSmoothingEnabled = false;
    ctx.shadowBlur = 0;
  }
}