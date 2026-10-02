// Persistent meta-progression: the gold bank and everything bought with it.
// Mirrors the high-score storage style in Game.js — plain localStorage JSON
// wrapped in try/catch so private-mode browsers degrade instead of throwing.

// Gold is banked the moment a coin is picked up, so dying never costs you
// currency you actually reached.
const META_KEY = 'ktoKys.meta.v1';

let metaCache = null;

function defaultMeta() {
  return { gold: 0, unlocks: {}, relics: {} };
}

function loadMeta() {
  if (metaCache) return metaCache;
  let parsed = null;
  try {
    const raw = localStorage.getItem(META_KEY);
    parsed = raw ? JSON.parse(raw) : null;
  } catch (e) {
    parsed = null;
  }
  metaCache = Object.assign(defaultMeta(), parsed && typeof parsed === 'object' ? parsed : {});
  if (!metaCache.unlocks || typeof metaCache.unlocks !== 'object') metaCache.unlocks = {};
  if (!metaCache.relics || typeof metaCache.relics !== 'object') metaCache.relics = {};
  if (typeof metaCache.gold !== 'number' || !isFinite(metaCache.gold) || metaCache.gold < 0) {
    metaCache.gold = 0;
  }
  return metaCache;
}

function saveMeta() {
  try { localStorage.setItem(META_KEY, JSON.stringify(metaCache)); } catch (e) { /* storage unavailable */ }
}

function getGold() { return loadMeta().gold; }

function addGold(amount) {
  const meta = loadMeta();
  meta.gold += Math.max(0, Math.floor(amount));
  saveMeta();
}

function getRelicLevel(id) { return loadMeta().relics[id] || 0; }

// Cost of the NEXT level of a relic; each purchase raises the price.
function getRelicCost(id) {
  const relic = findRelic(id);
  if (!relic) return Infinity;
  const level = getRelicLevel(id);
  if (level >= relic.maxLevel) return Infinity;
  return relic.baseCost + relic.costStep * level;
}

function isMaxedRelic(id) {
  const relic = findRelic(id);
  return !!relic && getRelicLevel(id) >= relic.maxLevel;
}

// Free entries are owned from the start; everything else needs a purchase.
function isPowerupOwned(id) {
  const entry = findShopPowerup(id);
  if (!entry) return false;
  return entry.free || !!loadMeta().unlocks[id];
}

// Gold multiplier granted by the Gilded Touch relic, applied to coin values.
function goldMultiplier() {
  const level = getRelicLevel('fortune');
  return 1 + 0.10 * level;
}

// Apply every purchased relic to a freshly created player. Called once per run,
// after the character's own bonuses, so relics stack on top of class identity.
function applyRelicsToPlayer(player) {
  for (const relic of SHOP_RELICS) {
    const level = getRelicLevel(relic.id);
    for (let i = 0; i < level; i++) relic.apply(player);
  }
}

function buyPowerup(id) {
  const entry = findShopPowerup(id);
  if (!entry || isPowerupOwned(id)) return false;
  const meta = loadMeta();
  if (meta.gold < entry.cost) return false;
  meta.gold -= entry.cost;
  meta.unlocks[id] = true;
  saveMeta();
  return true;
}

function buyRelic(id) {
  const relic = findRelic(id);
  if (!relic) return false;
  const cost = getRelicCost(id);
  if (!isFinite(cost)) return false;
  const meta = loadMeta();
  if (meta.gold < cost) return false;
  meta.gold -= cost;
  meta.relics[id] = getRelicLevel(id) + 1;
  saveMeta();
  return true;
}

// Clears every purchase but keeps the gold balance — "reset purchases", not
// "reset account". Use wipeMeta() for a full clear.
function resetPurchases() {
  const meta = loadMeta();
  const gold = meta.gold;
  metaCache = defaultMeta();
  metaCache.gold = gold;
  saveMeta();
}

// Full wipe, including gold.
function wipeMeta() {
  metaCache = defaultMeta();
  saveMeta();
}
