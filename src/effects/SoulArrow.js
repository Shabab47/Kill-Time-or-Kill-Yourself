const SOUL_ARROW_FRAMES = [];

(function loadSoulArrow() {
  for (let i = 1; i <= 5; i++) {
    const img = new Image();
    const entry = { img, w: 0, h: 0, ready: false };
    img.onload = () => {
      entry.w = img.naturalWidth;
      entry.h = img.naturalHeight;
      entry.ready = true;
    };
    img.onerror = () => { entry.ready = true; };
    img.src = 'assets/Elements/Soul arrow/saf' + i + '.png';
    SOUL_ARROW_FRAMES.push(entry);
  }
})();

function getSoulArrowFrame(gameTime) {
  const idx = Math.floor(gameTime * 10) % 5;
  const entry = SOUL_ARROW_FRAMES[idx];
  if (entry && entry.ready && entry.w > 0) return entry;
  return null;
}