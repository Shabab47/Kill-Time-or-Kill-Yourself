class Renderer {
  render(game) {
    const scale = DPR();
    const dw = DW(), dh = DH();

    renderClear();

    ctx.save();
    ctx.scale(scale, scale);

    ctx.save();
    ctx.translate(-game.cam.sx, -game.cam.sy);

    renderTiles(ctx, game, dw, dh);
    renderObstacles(ctx, game, dw, dh);
    renderXpOrbs(ctx, game);
    renderItems(ctx, game);
    renderEnemies(ctx, game);
    renderProjectiles(ctx, game);
    renderPlayer(ctx, game);
    renderOrbitals(ctx, game);
    renderFloatingNumbers(ctx, game);
    renderParticles(ctx, game);

    ctx.restore();

    renderDuskHaze(ctx, dw, dh);
    renderTouchUI(ctx, dw, dh);
    renderVignette(ctx, dw, dh);

    ctx.restore();
  }
}