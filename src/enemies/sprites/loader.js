const ENEMY_ACTIONS = ['idle', 'run', 'attack', 'hit', 'dead'];
const ENEMY_SPRITES = {};

const ENEMY_FRAME_COUNTS = {
  skeleton: {
    run: { default: 3, N: 4, NE: 4 }
  }
};

// Tallest opaque frame in a pack; every frame is scaled against this one value
// so a type never changes apparent size mid-animation.
const ENEMY_REF_HEIGHT = {};

function getEnemyFrameCount(type, action, dir) {
  const actionCfg = ENEMY_FRAME_COUNTS[type]?.[action];
  if (!actionCfg) return 1;
  return actionCfg[dir] || actionCfg.default || 1;
}

// Every frame in a pack is auto-cropped to its own opaque bounding box, so the
// images do NOT share a canvas size (a skeleton "run" cycle mixes 127px and
// 135px tall frames). Normalising each frame by its own height therefore makes
// the sprite pulse in size and slide as it animates. Instead we measure each
// frame's real opaque box once, then draw every frame of a type at ONE shared
// scale and anchor it by the bottom-centre of that box, so the skeleton keeps a
// constant size and its feet stay planted on the ground.
const BBOX_ALPHA_THRESHOLD = 8;
const bboxCanvas = document.createElement('canvas');
const bboxCtx = bboxCanvas.getContext('2d', { willReadFrequently: true });

function measureOpaqueBox(img) {
  const w = img.naturalWidth, h = img.naturalHeight;
  if (!w || !h) return null;
  try {
    bboxCanvas.width = w;
    bboxCanvas.height = h;
    bboxCtx.clearRect(0, 0, w, h);
    bboxCtx.drawImage(img, 0, 0);
    const { data } = bboxCtx.getImageData(0, 0, w, h);
    let minX = w, minY = h, maxX = -1, maxY = -1;
    for (let y = 0; y < h; y++) {
      const row = y * w * 4;
      for (let x = 0; x < w; x++) {
        if (data[row + x * 4 + 3] > BBOX_ALPHA_THRESHOLD) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < 0 || maxY < 0) return null;   // fully transparent frame
    return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
  } catch (err) {
    // Tainted canvas (e.g. opened straight from file://) — fall back to the
    // full image box so the sprite still draws.
    return { x: 0, y: 0, w, h };
  }
}

function refreshTypeRefHeight(type) {
  let refH = 0;
  const set = ENEMY_SPRITES[type];
  if (!set) return 0;
  for (const action of Object.keys(set)) {
    for (const dir of Object.keys(set[action])) {
      for (const entry of set[action][dir]) {
        if (entry.ready && entry.box && entry.box.h > refH) refH = entry.box.h;
      }
    }
  }
  ENEMY_REF_HEIGHT[type] = refH;
  return refH;
}

// Shared on-screen height for a target draw height, identical for every frame
// of the same enemy type.
function getEnemySpriteScale(type, targetH) {
  const refH = ENEMY_REF_HEIGHT[type] || 0;
  return refH > 0 ? targetH / refH : 1;
}

function loadEnemySprites(type) {
  const folder = 'assets/enemies/' + type + '/';
  ENEMY_SPRITES[type] = {};
  for (const action of ENEMY_ACTIONS) {
    ENEMY_SPRITES[type][action] = {};
    for (const dir of DIRS_8) {
      const frameCount = getEnemyFrameCount(type, action, dir);
      const frames = [];
      for (let f = 0; f < frameCount; f++) {
        const suffix = f === 0 ? '' : '_f' + f;
        const img = new Image();
        const entry = { img, w: 0, h: 0, box: null, ready: false };
        img.onload = () => {
          entry.w = img.naturalWidth;
          entry.h = img.naturalHeight;
          entry.box = measureOpaqueBox(img) || { x: 0, y: 0, w: entry.w, h: entry.h };
          entry.ready = true;
          refreshTypeRefHeight(type);
        };
        img.onerror = () => {
          entry.ready = true;
        };
        img.src = folder + action + '_' + dir + suffix + '.png';
        frames.push(entry);
      }
      ENEMY_SPRITES[type][action][dir] = frames;
    }
  }
}

function getEnemySprite(type, action, dir, frame) {
  const set = ENEMY_SPRITES[type];
  if (!set) return null;
  const actionSet = set[action];
  if (!actionSet) return null;
  const frames = actionSet[dir];
  if (!frames || frames.length === 0) return null;
  const frameIdx = (frame !== undefined ? frame : 0) % frames.length;
  const entry = frames[frameIdx];
  if (entry && entry.ready && entry.w > 0) return entry;
  const idleFrames = set.idle?.[dir];
  if (idleFrames && idleFrames[0] && idleFrames[0].ready && idleFrames[0].w > 0) return idleFrames[0];
  return null;
}

loadEnemySprites('skeleton');
