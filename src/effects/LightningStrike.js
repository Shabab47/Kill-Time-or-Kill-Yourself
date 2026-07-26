const LIGHTNING_FRAMES = [];
const LIGHTNING_FPS = 8;

(function loadLightningStrike() {
  for (let i = 1; i <= 2; i++) {
    const img = new Image();
    const entry = { img, w: 0, h: 0, ready: false };
    img.onload = () => {
      entry.w = img.naturalWidth;
      entry.h = img.naturalHeight;
      entry.ready = true;
    };
    img.onerror = () => { entry.ready = true; };
    img.src = 'assets/Elements/Lighting Strike/LF' + i + '.png';
    LIGHTNING_FRAMES.push(entry);
  }
})();

function getLightningFrame(gameTime) {
  const idx = Math.floor(gameTime * LIGHTNING_FPS) % LIGHTNING_FRAMES.length;
  const entry = LIGHTNING_FRAMES[idx];
  if (entry && entry.ready && entry.w > 0) return entry;
  return null;
}
