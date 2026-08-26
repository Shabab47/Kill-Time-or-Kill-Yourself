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
}