sprite('knight', 84, 84, (ctx, w, h) => {
  const x = w / 2, y = h / 2;

  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(x, y - 8, 26, PI, 0);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(x - 24, y - 8, 48, 34);

  ctx.fillStyle = '#0d0d0d';
  ctx.fillRect(x - 22, y - 6, 44, 30);

  ctx.fillStyle = '#050505';
  ctx.fillRect(x - 3, y - 22, 6, 16);

  ctx.fillStyle = '#ffd600';
  ctx.shadowColor = '#ffd600';
  ctx.shadowBlur = 4;
  ctx.beginPath();
  ctx.arc(x - 8, y - 16, 2, 0, TAU);
  ctx.arc(x + 8, y - 16, 2, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#050000';
  ctx.beginPath();
  ctx.arc(x - 8, y - 16, 1, 0, TAU);
  ctx.arc(x + 8, y - 16, 1, 0, TAU);
  ctx.fill();

  ctx.strokeStyle = '#c9a84c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y - 8, 27, PI * 1.05, PI * 1.95);
  ctx.stroke();

  ctx.strokeStyle = '#6d4c41';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y + 10, 24, 0, TAU);
  ctx.stroke();

  ctx.fillStyle = '#3e2723';
  ctx.fillRect(x - 22, y + 8, 20, 20);

  ctx.strokeStyle = '#5d4037';
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(x - 12 + i * 6, y + 16, 2, 0, TAU);
    ctx.stroke();
  }

  ctx.fillStyle = '#c62828';
  ctx.shadowColor = '#c62828';
  ctx.shadowBlur = 3;
  ctx.fillRect(x + 6, y + 12, 18, 3);
  ctx.fillRect(x + 8, y + 10, 3, 16);
  ctx.fillRect(x + 20, y + 14, 2, 10);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#2a1a0a';
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(x - 14 + i * 8, y - 28, 4, 6);
  }
});
