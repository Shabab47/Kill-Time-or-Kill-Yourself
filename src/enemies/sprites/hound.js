sprite('hound', 60, 60, (ctx, w, h) => {
  const x = w / 2, y = h / 2;

  ctx.fillStyle = '#1a0000';
  ctx.beginPath();
  ctx.arc(x, y - 2, 24, 0, TAU);
  ctx.fill();

  ctx.fillStyle = '#0a0000';
  ctx.beginPath();
  ctx.arc(x, y - 6, 20, PI * 0.1, PI * 0.9);
  ctx.fill();

  ctx.fillStyle = '#c62828';
  ctx.shadowColor = '#c62828';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(x - 7, y - 8, 3.5, 0, TAU);
  ctx.arc(x + 7, y - 8, 3.5, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#050000';
  ctx.beginPath();
  ctx.arc(x - 7, y - 8, 2, 0, TAU);
  ctx.arc(x + 7, y - 8, 2, 0, TAU);
  ctx.fill();

  ctx.fillStyle = '#4a0000';
  ctx.beginPath();
  ctx.ellipse(x, y + 2, 12, 8, 0, 0, TAU);
  ctx.fill();

  ctx.fillStyle = '#d7ccc8';
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const tx = -8 + i * 3.2;
    const ty = y + 2 + Math.sin(i * 1.8) * 2;
    ctx.fillRect(x + tx, ty, 2.5, 4);
  }
  ctx.fill();

  ctx.fillStyle = '#1a0000';
  ctx.beginPath();
  ctx.ellipse(x, y + 8, 8, 3, 0, 0, TAU);
  ctx.fill();

  ctx.fillStyle = '#c62828';
  ctx.shadowColor = '#c62828';
  ctx.shadowBlur = 3;
  ctx.beginPath();
  ctx.moveTo(x - 14, y + 2);
  ctx.lineTo(x - 18, y + 8);
  ctx.moveTo(x + 14, y + 2);
  ctx.lineTo(x + 18, y + 8);
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#2a0000';
  ctx.beginPath();
  ctx.moveTo(x - 8, y - 28);
  ctx.lineTo(x - 5, y - 18);
  ctx.lineTo(x - 12, y - 20);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 8, y - 28);
  ctx.lineTo(x + 5, y - 18);
  ctx.lineTo(x + 12, y - 20);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#c62828';
  ctx.fillRect(x - 5, y - 26, 3, 2);
  ctx.fillRect(x + 2, y - 26, 3, 2);
});
