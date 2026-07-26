sprite('xp', 24, 24, (ctx, w, h) => {
  const x = w / 2, y = h / 2, s = 10;
  const g = ctx.createRadialGradient(x, y, 0, x, y, s);
  g.addColorStop(0, '#ffcccc');
  g.addColorStop(0.4, '#c62828');
  g.addColorStop(1, '#4a0000');
  ctx.fillStyle = g;
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU - PI / 2;
    const r = i % 2 === 0 ? s : s * 0.45;
    if (i === 0) ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    else ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
});

sprite('healthPotion', 20, 24, (ctx, w, h) => {
  const x = w / 2;
  ctx.fillStyle = '#0a0000';
  ctx.fillRect(x - 5, 0, 10, h);
  ctx.fillRect(x - 8, 3, 16, h - 3);
  ctx.fillStyle = '#c62828';
  ctx.shadowColor = '#c62828';
  ctx.shadowBlur = 6;
  ctx.fillRect(x - 3, 4, 6, h - 7);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ff4444';
  ctx.beginPath();
  ctx.arc(x, 3, 2.5, PI, 0);
  ctx.fill();
});

sprite('shieldPotion', 20, 24, (ctx, w, h) => {
  const x = w / 2, y = h / 2;
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(x - 5, 0, 10, h);
  ctx.fillRect(x - 8, 3, 16, h - 3);
  ctx.fillStyle = '#2a2a2a';
  ctx.shadowColor = '#555555';
  ctx.shadowBlur = 6;
  ctx.fillRect(x - 3, 4, 6, h - 7);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#888888';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, 5, PI * 0.9, PI * 0.1);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 3.5, y);
  ctx.lineTo(x, y - 5);
  ctx.lineTo(x + 3.5, y);
  ctx.stroke();
});

const shieldImg = new Image();
shieldImg.onload = () => {
  const c = document.createElement('canvas');
  c.width = shieldImg.naturalWidth;
  c.height = shieldImg.naturalHeight;
  c.getContext('2d').drawImage(shieldImg, 0, 0);
  sprites['shieldPotion'] = c;
};
shieldImg.src = 'assets/Elements/Shield/Shield.png';

sprite('speedBoost', 22, 22, (ctx, w, h) => {
  const x = w / 2, y = h / 2;
  ctx.fillStyle = '#0a1a00';
  ctx.fillRect(x - 6, 14, 12, 6);
  ctx.fillRect(x - 4, 10, 8, 4);
  ctx.fillStyle = '#388e3c';
  ctx.shadowColor = '#388e3c';
  ctx.shadowBlur = 6;
  ctx.fillRect(x - 4, 14, 8, 5);
  ctx.fillRect(x - 3, 10, 6, 4);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#4caf50';
  ctx.beginPath();
  ctx.moveTo(x - 6, 10);
  ctx.lineTo(x, 1);
  ctx.lineTo(x + 6, 10);
  ctx.closePath();
  ctx.fill();
});

sprite('chest', 28, 22, (ctx, w, h) => {
  const x = w / 2;
  ctx.fillStyle = '#0a0500';
  ctx.fillRect(x - 13, 6, 26, 16);
  ctx.fillStyle = '#3e2723';
  ctx.fillRect(x - 11, 8, 22, 12);
  ctx.fillStyle = '#4e342e';
  ctx.fillRect(x - 10, 9, 20, 10);
  ctx.fillStyle = '#c9a84c';
  ctx.shadowColor = '#c9a84c';
  ctx.shadowBlur = 4;
  ctx.fillRect(x - 2, 9, 4, 4);
  ctx.shadowBlur = 0;
  ctx.fillRect(x - 1, 8, 2, 6);
  ctx.strokeStyle = '#c9a84c';
  ctx.lineWidth = 1;
  ctx.strokeRect(x - 12, 6, 24, 16);
  ctx.strokeStyle = '#c9a84c';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(x - 12, 11);
  ctx.lineTo(x + 12, 11);
  ctx.stroke();
});
