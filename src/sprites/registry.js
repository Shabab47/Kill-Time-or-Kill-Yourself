const sprites = {};
function sprite(id, w, h, fn) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  fn(c.getContext('2d'), w, h);
  sprites[id] = c;
}

// Image-backed sprite loaded from an asset file. `entry` mirrors the canvas
// sprite contract (w/h/ready) so render code can treat both uniformly.
function spriteImage(id, src) {
  const entry = { img: new Image(), w: 0, h: 0, ready: false };
  entry.img.onload = () => {
    entry.w = entry.img.naturalWidth;
    entry.h = entry.img.naturalHeight;
    entry.ready = true;
  };
  entry.img.onerror = () => { entry.ready = true; };
  entry.img.src = src;
  sprites[id] = entry;
}
