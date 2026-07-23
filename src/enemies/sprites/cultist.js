sprite('cultist', 72, 72, (ctx, w, h) => {
  const x = w / 2, y = h / 2;

  ctx.fillStyle = '#0a0a0a';
  ctx.beginPath();
  ctx.moveTo(x - 28, y + 30);
  ctx.lineTo(x + 28, y + 30);
  ctx.lineTo(x + 24, y - 10);
  ctx.lineTo(x - 24, y - 10);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.moveTo(x - 18, y - 10);
  ctx.lineTo(x + 18, y - 10);
  ctx.lineTo(x + 14, y - 28);
  ctx.lineTo(x - 14, y - 28);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#d7ccc8';
  ctx.beginPath();
  ctx.arc(x, y - 20, 14, 0, TAU);
  ctx.fill();

  ctx.fillStyle = '#050505';
  ctx.beginPath();
  ctx.arc(x - 5, y - 22, 4, 0, TAU);
  ctx.arc(x + 5, y - 22, 4, 0, TAU);
  ctx.fill();

  ctx.fillStyle = '#c62828';
  ctx.shadowColor = '#c62828';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(x - 5, y - 22, 2.5, 0, TAU);
  ctx.arc(x + 5, y - 22, 2.5, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#0a0000';
  ctx.beginPath();
  ctx.moveTo(x - 3, y - 15);
  ctx.arc(x, y - 13, 3, PI, 0);
  ctx.closePath();
  ctx.fill();

  for (let i = 0; i < 5; i++) {
    const ry = -6 + i * 6;
    ctx.fillStyle = '#c62828';
    ctx.shadowColor = '#c62828';
    ctx.shadowBlur = 4;
    ctx.fillRect(x - 14 + ry * 0.5, y + ry, 4, 1.5);
    ctx.shadowBlur = 0;
  }

  ctx.fillStyle = '#4a0000';
  ctx.shadowColor = '#4a0000';
  ctx.shadowBlur = 3;
  ctx.beginPath();
  ctx.moveTo(x - 14, y + 18);
  ctx.lineTo(x - 18, y + 30);
  ctx.lineTo(x - 10, y + 30);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x + 14, y + 18);
  ctx.lineTo(x + 18, y + 30);
  ctx.lineTo(x + 10, y + 30);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = '#c62828';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - 24, y - 10);
  ctx.lineTo(x - 32, y + 4);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(198,40,40,0.2)';
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 4]);
  ctx.beginPath();
  ctx.arc(x, y - 6, 12, 0, TAU);
  ctx.stroke();
  ctx.setLineDash([]);
});
