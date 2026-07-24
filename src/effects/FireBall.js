const FIREBALL_COUNT = 8;
const FIREBALL_FRAMES = [];
const FIREBALL_FPS = 12;

(function loadFireBall() {
  for (let i = 1; i <= FIREBALL_COUNT; i++) {
    const img = new Image();
    const entry = { img, w: 0, h: 0, ready: false };
    img.onload = () => {
      entry.w = img.naturalWidth;
      entry.h = img.naturalHeight;
      entry.ready = true;
    };
    img.onerror = () => { entry.ready = true; };
    img.src = 'assets/Elements/FireBall/f' + i + '.png';
    FIREBALL_FRAMES.push(entry);
  }
})();

function getFireBallFrame(gameTime) {
  const idx = Math.floor(gameTime * FIREBALL_FPS) % FIREBALL_COUNT;
  const entry = FIREBALL_FRAMES[idx];
  if (entry && entry.ready && entry.w > 0) return entry;
  return null;
}
