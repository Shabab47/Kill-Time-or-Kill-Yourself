sprite('lich', 120, 120, (ctx, w, h) => {
  const x = w / 2, y = h / 2;

  ctx.fillStyle = '#050000';
  ctx.beginPath();
  ctx.moveTo(x - 42, y + 48);
  ctx.lineTo(x + 42, y + 48);
  ctx.lineTo(x + 38, y - 10);
  ctx.lineTo(x - 38, y - 10);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#0a0000';
  ctx.beginPath();
  ctx.moveTo(x - 30, y - 10);
  ctx.lineTo(x + 30, y - 10);
  ctx.lineTo(x + 24, y - 34);
  ctx.lineTo(x - 24, y - 34);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#d7ccc8';
  ctx.shadowColor = '#5d4037';
  ctx.shadowBlur = 4;
  ctx.beginPath();
  ctx.arc(x, y - 16, 24, PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#1a0000';
  ctx.beginPath();
  ctx.arc(x - 7, y - 20, 5, 0, TAU);
  ctx.arc(x + 7, y - 20, 5, 0, TAU);
  ctx.fill();

  ctx.fillStyle = '#c62828';
  ctx.shadowColor = '#c62828';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(x - 7, y - 20, 3.5, 0, TAU);
  ctx.arc(x + 7, y - 20, 3.5, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#050000';
  ctx.beginPath();
  ctx.moveTo(x - 5, y - 8);
  ctx.arc(x, y - 4, 5, PI, 0);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#d7ccc8';
  ctx.strokeStyle = '#bcaaa4';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 6; i++) {
    const rx = -9 + i * 3.6;
    ctx.fillRect(x + rx, y + 4, 2, 5);
    ctx.strokeRect(x + rx, y + 4, 2, 5);
  }

  ctx.fillStyle = '#1a0000';
  ctx.beginPath();
  ctx.moveTo(x - 18, y - 38);
  ctx.lineTo(x - 12, y - 52);
  ctx.lineTo(x - 6, y - 38);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x + 18, y - 38);
  ctx.lineTo(x + 12, y - 52);
  ctx.lineTo(x + 6, y - 38);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x, y - 38);
  ctx.lineTo(x, y - 56);
  ctx.lineTo(x + 4, y - 44);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(198,40,40,0.12)';
  ctx.beginPath();
  ctx.arc(x, y - 6, 32, 0, TAU);
  ctx.fill();

  ctx.strokeStyle = 'rgba(198,40,40,0.15)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    const a = i * TAU / 3 + 0.3;
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * 38, y - 6 + Math.sin(a) * 14, 8 + i * 3, 0, TAU);
    ctx.stroke();
  }

  ctx.fillStyle = '#c62828';
  ctx.shadowColor = '#c62828';
  ctx.shadowBlur = 4;
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(x - 16 + i * 16, y + 20 + i * 3, 2, 6 + i * 2);
  }
  ctx.shadowBlur = 0;
});
