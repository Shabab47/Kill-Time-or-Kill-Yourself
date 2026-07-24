function renderDuskHaze(ctx, dw, dh) {
  const haze = ctx.createRadialGradient(dw / 2, dh * 0.2, dw * 0.1, dw / 2, dh * 0.1, dw * 1.2);
  haze.addColorStop(0, 'rgba(200,120,60,0.04)');
  haze.addColorStop(0.5, 'rgba(180,90,50,0.025)');
  haze.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = haze;
  ctx.fillRect(0, 0, dw, dh);
  ctx.restore();
}

function renderVignette(ctx, dw, dh) {
  const vig = ctx.createRadialGradient(dw / 2, dh / 2, dw * 0.25, dw / 2, dh / 2, dw * 0.65);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, dw, dh);
}