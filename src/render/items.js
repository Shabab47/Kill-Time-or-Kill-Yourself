function renderItems(ctx, game) {
  for (const item of game.items) {
    if (!item.alive) continue;
    const pulse = Math.sin(item.pulse) * 0.15 + 1;
    const ss = item.size * pulse * 2.2;
    ctx.shadowColor = item.glowColor;
    ctx.shadowBlur = 14;
    ctx.drawImage(sprites[item.spriteId], item.x - ss / 2, item.y - ss / 2, ss, ss);
    ctx.shadowBlur = 0;
  }
}