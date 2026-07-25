function renderTiles(ctx, game, dw, dh) {
  const tileSize = 60;
  const GRID = 6;
  const imgReady = mudGrassImg.complete && mudGrassImg.naturalWidth > 0;
  const sw = mudGrassImg.naturalWidth / GRID;
  const sh = mudGrassImg.naturalHeight / GRID;

  const startTileX = Math.floor(game.cam.sx / tileSize);
  const startTileY = Math.floor(game.cam.sy / tileSize);
  const endTileX = Math.ceil((game.cam.sx + dw) / tileSize);
  const endTileY = Math.ceil((game.cam.sy + dh) / tileSize);

  for (let tx = startTileX; tx <= endTileX; tx++) {
    for (let ty = startTileY; ty <= endTileY; ty++) {
      if (imgReady) {
        const sx = ((tx % GRID + GRID) % GRID) * sw;
        const sy = ((ty % GRID + GRID) % GRID) * sh;
        ctx.drawImage(mudGrassImg, sx, sy, sw, sh, tx * tileSize, ty * tileSize, tileSize, tileSize);
      } else {
        ctx.drawImage(sprites.mudGrassTile, tx * tileSize, ty * tileSize, tileSize, tileSize);
      }
    }
  }

  const border = 30;
  if (game.cam.sx < border || game.cam.sy < border || game.cam.sx + dw > G.worldSize - border || game.cam.sy + dh > G.worldSize - border) {
    ctx.fillStyle = 'rgba(30,30,30,0.08)';
    ctx.fillRect(0, 0, G.worldSize, border);
    ctx.fillRect(0, G.worldSize - border, G.worldSize, border);
    ctx.fillRect(0, 0, border, G.worldSize);
    ctx.fillRect(G.worldSize - border, 0, border, G.worldSize);
  }
}