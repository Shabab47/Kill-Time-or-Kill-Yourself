sprite('skeleton', 72, 72, (ctx, w, h) => {
  const x = w / 2, y = h / 2;

  ctx.fillStyle = '#1a0a0a';
  ctx.beginPath();
  ctx.moveTo(x - 20, y + 30);
  ctx.lineTo(x + 20, y + 30);
  ctx.lineTo(x + 16, y - 4);
  ctx.lineTo(x - 16, y - 4);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#d7ccc8';
  ctx.shadowColor = '#8d6e63';
  ctx.shadowBlur = 3;
  ctx.beginPath();
  ctx.arc(x, y - 6, 22, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#1a0000';
  ctx.beginPath();
  ctx.arc(x - 8, y - 10, 5, 0, TAU);
  ctx.arc(x + 8, y - 10, 5, 0, TAU);
  ctx.fill();

  ctx.fillStyle = '#c62828';
  ctx.shadowColor = '#c62828';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(x - 8, y - 10, 3, 0, TAU);
  ctx.arc(x + 8, y - 10, 3, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#050000';
  ctx.beginPath();
  ctx.arc(x - 8, y - 10, 1.5, 0, TAU);
  ctx.arc(x + 8, y - 10, 1.5, 0, TAU);
  ctx.fill();

  ctx.fillStyle = '#1a0000';
  ctx.beginPath();
  ctx.moveTo(x - 4, y - 2);
  ctx.arc(x, y + 1, 5, PI, 0);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#d7ccc8';
  ctx.strokeStyle = '#bcaaa4';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 6; i++) {
    const rx = -8 + i * 3.2;
    ctx.fillRect(x + rx, y + 6, 2, 4);
    ctx.strokeRect(x + rx, y + 6, 2, 4);
  }

  ctx.fillStyle = '#c62828';
  for (let i = 1; i < 5; i++) {
    const rx = -6 + i * 3;
    ctx.fillRect(x + rx + 0.5, y + 10, 1, 1 + (i % 2));
  }

  ctx.strokeStyle = '#bcaaa4';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - 22, y + 2);
  ctx.lineTo(x - 30, y + 24);
  ctx.moveTo(x + 22, y + 2);
  ctx.lineTo(x + 30, y + 24);
  ctx.stroke();

  ctx.strokeStyle = '#8d6e63';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - 30, y + 24);
  ctx.lineTo(x - 26, y + 32);
  ctx.moveTo(x + 30, y + 24);
  ctx.lineTo(x + 26, y + 32);
  ctx.stroke();
});
