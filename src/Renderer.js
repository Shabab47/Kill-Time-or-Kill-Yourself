class Renderer {
  render(game) {
    const scale = DPR() * RENDER_SCALE;
    const dw = DW(), dh = DH();
    const ww = dw * DPR() / scale, wh = dh * DPR() / scale;

    renderClear();

    ctx.save();
    ctx.scale(scale, scale);

    ctx.save();
    ctx.translate(-Math.round(game.cam.sx / 2) * 2, -Math.round(game.cam.sy / 2) * 2);

    renderTiles(ctx, game, ww, wh);
    renderObstacles(ctx, game, ww, wh);
    renderXpOrbs(ctx, game);
    renderItems(ctx, game);
    renderEnemies(ctx, game);
    renderProjectiles(ctx, game);
    renderPlayer(ctx, game);
    renderOrbitals(ctx, game);
    renderFloatingNumbers(ctx, game);
    renderParticles(ctx, game);
    renderSoulArrows(ctx, game);

    ctx.restore();

    ctx.save();
    ctx.setTransform(DPR(), 0, 0, DPR(), 0, 0);
    renderDuskHaze(ctx, dw, dh);
    renderTouchUI(ctx, dw, dh);
    renderVignette(ctx, dw, dh);
    ctx.restore();

    ctx.restore();
  }
}