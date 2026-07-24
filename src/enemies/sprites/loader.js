const ENEMY_ACTIONS = ['idle', 'run', 'attack', 'hit', 'dead'];
const ENEMY_SPRITES = {};

const ENEMY_FRAME_COUNTS = {
  skeleton: {
    run: { default: 3, N: 4, NE: 4 }
  }
};

function getEnemyFrameCount(type, action, dir) {
  const actionCfg = ENEMY_FRAME_COUNTS[type]?.[action];
  if (!actionCfg) return 1;
  return actionCfg[dir] || actionCfg.default || 1;
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
        const entry = { img, w: 0, h: 0, ready: false };
        img.onload = () => {
          entry.w = img.naturalWidth;
          entry.h = img.naturalHeight;
          entry.ready = true;
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
