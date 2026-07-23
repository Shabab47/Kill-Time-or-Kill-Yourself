// Loads the player's animation frames from plain PNG files in
// frontend/assets/player/. Each file is named "<action>_<direction>.png",
// e.g. "walk_NE.png" or "attack_S.png".
//
// TO EDIT THE ART: just open any of those PNG files in an image editor
// (Photoshop, GIMP, paint.net, Krita, etc.), edit it, and save it back
// under the exact same filename. Keep the background transparent and
// keep the character roughly centered/bottom-anchored in the frame the
// same way the original does. No code changes needed - refresh the page
// and your new picture shows up.

const PLAYER_ACTIONS = ['idle', 'walk', 'run', 'jump', 'fall', 'attack'];
const PLAYER_DIRS = ['E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'NE'];
const PLAYER_SPRITE_FOLDER = 'assets/player/';

const PLAYER_SPRITES = {};

(function loadPlayerSprites() {
  for (const action of PLAYER_ACTIONS) {
    PLAYER_SPRITES[action] = {};
    for (const dir of PLAYER_DIRS) {
      const img = new Image();
      const entry = { img, w: 0, h: 0, ready: false };
      img.onload = () => {
        entry.w = img.naturalWidth;
        entry.h = img.naturalHeight;
        entry.ready = true;
      };
      img.onerror = () => {
        console.error('Missing/unreadable player sprite:', img.src);
      };
      img.src = PLAYER_SPRITE_FOLDER + action + '_' + dir + '.png';
      PLAYER_SPRITES[action][dir] = entry;
    }
  }
})();

// Converts a movement/facing angle (radians, screen space) into one of
// the 8 compass directions used by the file names above.
function angleToDir8(angleRad) {
  let deg = (angleRad * 180 / Math.PI) % 360;
  if (deg < 0) deg += 360;
  const idx = Math.round(deg / 45) % 8;
  return PLAYER_DIRS[idx];
}

// Returns the best available sprite entry for an action/direction,
// falling back to the idle pose facing the same direction if a frame
// hasn't finished loading yet.
function getPlayerSprite(action, dir) {
  const set = PLAYER_SPRITES[action];
  const entry = set && set[dir];
  if (entry && entry.ready) return entry;
  const idleEntry = PLAYER_SPRITES.idle && PLAYER_SPRITES.idle[dir];
  if (idleEntry && idleEntry.ready) return idleEntry;
  return null;
}
