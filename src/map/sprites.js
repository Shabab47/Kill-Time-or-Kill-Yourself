sprite('grassTile', 60, 60, (ctx, w, h) => {
  const base = ['#2a3320', '#2d3622', '#28311e', '#2f3825'];
  ctx.fillStyle = base[randInt(0, 3)];
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 12; i++) {
    ctx.fillStyle = `hsla(${randInt(90, 130)}, ${randInt(15, 35)}%, ${randInt(12, 20)}%, ${rand(0.3, 0.6)})`;
    const dx = rand(0, w);
    const dy = rand(0, h);
    ctx.fillRect(dx, dy, rand(1, 3), rand(3, 8));
  }
  ctx.fillStyle = 'rgba(60,40,20,0.08)';
  for (let i = 0; i < 3; i++) {
    const dx = rand(4, w - 8);
    const dy = rand(4, h - 8);
    ctx.beginPath();
    ctx.ellipse(dx, dy, rand(4, 10), rand(2, 4), rand(0, TAU), 0, TAU);
    ctx.fill();
  }
});

sprite('orbitalGlow', 40, 40, (ctx, w, h) => {
  const cx = w / 2, cy = h / 2;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, w / 2);
  grad.addColorStop(0, 'rgba(255,120,50,0.5)');
  grad.addColorStop(0.4, 'rgba(255,60,10,0.2)');
  grad.addColorStop(1, 'rgba(200,30,0,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, w / 2, 0, TAU);
  ctx.fill();
});

const mudGrassImg = new Image();
mudGrassImg.src = 'assets/Elements/Ground/mudgrass.png';

sprite('mudGrassTile', 60, 60, (ctx, w, h) => {
  ctx.fillStyle = '#2a1f14';
  ctx.fillRect(0, 0, w, h);
});

sprite('mudTile', 60, 60, (ctx, w, h) => {
  const base = ['#2a1f14', '#2d2217', '#271c11', '#30251a'];
  ctx.fillStyle = base[randInt(0, 3)];
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(40,30,20,0.4)';
  for (let i = 0; i < 5; i++) {
    const dx = rand(2, w - 6);
    const dy = rand(2, h - 6);
    ctx.beginPath();
    ctx.ellipse(dx, dy, rand(6, 14), rand(3, 6), rand(0, TAU), 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(80,60,30,0.06)';
  for (let i = 0; i < 8; i++) {
    const dx = rand(0, w);
    const dy = rand(0, h);
    ctx.fillRect(dx, dy, rand(1, 2), 1);
  }
});

sprite('grassFlowers', 60, 60, (ctx, w, h) => {
  const base = ['#2a3320', '#2d3622', '#28311e', '#2f3825'];
  ctx.fillStyle = base[randInt(0, 3)];
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = `hsla(${randInt(90, 130)}, ${randInt(15, 35)}%, ${randInt(12, 20)}%, ${rand(0.3, 0.6)})`;
    ctx.fillRect(rand(0, w), rand(0, h), rand(1, 3), rand(3, 8));
  }
  for (let i = 0; i < randInt(3, 6); i++) {
    const fx = rand(6, w - 6);
    const fy = rand(6, h - 6);
    const colors = ['#e8d5f5', '#f5e1d5', '#d5f5e8', '#f5f0d5'];
    ctx.fillStyle = colors[randInt(0, 3)];
    for (let p = 0; p < 5; p++) {
      const a = p * TAU / 5;
      const px = fx + Math.cos(a) * 2;
      const py = fy + Math.sin(a) * 2;
      ctx.beginPath();
      ctx.arc(px, py, rand(1, 2), 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = '#c9b84c';
    ctx.beginPath();
    ctx.arc(fx, fy, 1, 0, TAU);
    ctx.fill();
  }
});

sprite('grassRocks', 60, 60, (ctx, w, h) => {
  const base = ['#2a3320', '#2d3622', '#28311e', '#2f3825'];
  ctx.fillStyle = base[randInt(0, 3)];
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = `hsla(${randInt(90, 130)}, ${randInt(15, 35)}%, ${randInt(12, 20)}%, ${rand(0.3, 0.6)})`;
    ctx.fillRect(rand(0, w), rand(0, h), rand(1, 3), rand(3, 8));
  }
  for (let i = 0; i < randInt(2, 4); i++) {
    const rx = rand(8, w - 8);
    const ry = rand(8, h - 8);
    const rs = rand(3, 7);
    ctx.fillStyle = `hsl(${randInt(0, 30)}, ${randInt(5, 15)}%, ${randInt(25, 40)}%)`;
    ctx.beginPath();
    ctx.arc(rx, ry, rs, 0, TAU);
    ctx.fill();
    ctx.fillStyle = `hsla(0, 0%, ${randInt(40, 55)}%, 0.3)`;
    ctx.beginPath();
    ctx.arc(rx - rs * 0.25, ry - rs * 0.25, rs * 0.4, 0, TAU);
    ctx.fill();
  }
});

sprite('grassDark', 60, 60, (ctx, w, h) => {
  const base = ['#1e2617', '#212a1a', '#1b2314', '#242d1c'];
  ctx.fillStyle = base[randInt(0, 3)];
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = `hsla(${randInt(100, 140)}, ${randInt(10, 25)}%, ${randInt(8, 14)}%, ${rand(0.2, 0.5)})`;
    ctx.fillRect(rand(0, w), rand(0, h), rand(1, 3), rand(4, 10));
  }
  ctx.fillStyle = 'rgba(20,15,10,0.1)';
  for (let i = 0; i < 4; i++) {
    const dx = rand(2, w - 4);
    const dy = rand(2, h - 4);
    ctx.beginPath();
    ctx.ellipse(dx, dy, rand(3, 8), rand(2, 3), rand(0, TAU), 0, TAU);
    ctx.fill();
  }
});

sprite('mudCracked', 60, 60, (ctx, w, h) => {
  const base = ['#2a1f14', '#2d2217', '#271c11', '#30251a'];
  ctx.fillStyle = base[randInt(0, 3)];
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(40,30,20,0.3)';
  for (let i = 0; i < 3; i++) {
    const dx = rand(4, w - 10);
    const dy = rand(4, h - 10);
    ctx.beginPath();
    ctx.ellipse(dx, dy, rand(6, 12), rand(3, 5), rand(0, TAU), 0, TAU);
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(60,40,20,0.25)';
  ctx.lineWidth = 1;
  for (let i = 0; i < randInt(3, 6); i++) {
    const sx = rand(4, w - 4);
    const sy = rand(4, h - 4);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    const segments = randInt(2, 4);
    for (let s = 0; s < segments; s++) {
      ctx.lineTo(sx + rand(-8, 8), sy + rand(-8, 8));
    }
    ctx.stroke();
  }
});

sprite('mudPuddle', 60, 60, (ctx, w, h) => {
  const base = ['#2a1f14', '#2d2217', '#271c11', '#30251a'];
  ctx.fillStyle = base[randInt(0, 3)];
  ctx.fillRect(0, 0, w, h);
  const px = rand(10, w - 10);
  const py = rand(10, h - 10);
  const pw = rand(16, 36);
  const ph = rand(10, 22);
  const grad = ctx.createRadialGradient(px, py, 0, px, py, pw / 2);
  grad.addColorStop(0, 'rgba(50,40,30,0.5)');
  grad.addColorStop(0.5, 'rgba(40,32,24,0.35)');
  grad.addColorStop(1, 'rgba(40,32,24,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(px, py, pw / 2, ph / 2, rand(-0.3, 0.3), 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(90,70,50,0.08)';
  ctx.beginPath();
  ctx.ellipse(px - 2, py - 2, pw / 3, ph / 3, 0, 0, TAU);
  ctx.fill();
});

sprite('mudGravel', 60, 60, (ctx, w, h) => {
  const base = ['#2a1f14', '#2d2217', '#271c11', '#30251a'];
  ctx.fillStyle = base[randInt(0, 3)];
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < randInt(8, 15); i++) {
    const gx = rand(2, w - 4);
    const gy = rand(2, h - 4);
    const gs = rand(2, 4);
    ctx.fillStyle = `hsl(${randInt(20, 40)}, ${randInt(5, 15)}%, ${randInt(25, 45)}%)`;
    ctx.beginPath();
    ctx.ellipse(gx, gy, gs, gs * rand(0.6, 0.9), rand(0, TAU), 0, TAU);
    ctx.fill();
    ctx.fillStyle = `hsla(0, 0%, ${randInt(50, 65)}%, 0.2)`;
    ctx.beginPath();
    ctx.ellipse(gx - gs * 0.2, gy - gs * 0.2, gs * 0.3, gs * 0.2, 0, 0, TAU);
    ctx.fill();
  }
});

sprite('pathStone', 60, 60, (ctx, w, h) => {
  const base = ['#353025', '#3a352a', '#302b20'];
  ctx.fillStyle = base[randInt(0, 2)];
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(60,55,45,0.3)';
  ctx.beginPath();
  const cx = w / 2 + rand(-2, 2);
  const cy = h / 2 + rand(-2, 2);
  ctx.ellipse(cx, cy, rand(18, 26), rand(14, 20), rand(-0.2, 0.2), 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(80,75,60,0.12)';
  ctx.beginPath();
  ctx.ellipse(cx - 2, cy - 2, rand(8, 14), rand(6, 10), 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(40,35,25,0.15)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rand(18, 26), rand(14, 20), rand(-0.2, 0.2), 0, TAU);
  ctx.stroke();
});
