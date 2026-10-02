const RENDER_SCALE = 1.5;
const G = {
  worldSize: 3000,
  playerBase: {
    hp: 100,
    speed: 220,
    damage: 10,
    attackSpeed: 0.55,
    attackRange: 150,
    projectileSpeed: 500
  },
  enemyBase: {
    skeleton: { hp: 30, speed: 90, damage: 8, size: 16, xp: 3, color: '#d7ccc8' },
    cultist: { hp: 20, speed: 70, damage: 6, size: 14, xp: 4, color: '#6a1b9a', shootRange: 280, shootInterval: 1.5 },
    hound: { hp: 15, speed: 150, damage: 5, size: 12, xp: 3, color: '#b71c1c' },
    knight: { hp: 80, speed: 50, damage: 12, size: 25, xp: 8, color: '#37474f' },
    lich: { hp: 400, speed: 60, damage: 18, size: 40, xp: 50, color: '#1a0000' }
  },
  xpLevels: [0, 10, 25, 45, 70, 100, 140, 190, 250, 320, 400, 500, 620, 760, 920, 1100, 1300, 1520, 1760, 2020, 2300],
  maxLevel: 20,
  // Vampire-Survivors-style limits
  maxWeapons: 4,
  maxPassives: 5,
  maxEnemies: 300,          // hard cap on concurrent active enemies; spawns pause above this
  edgeSpawnMargin: 80,      // enemies spawn just past the camera's visible edge
  spawnSmoothing: 0.14159265, // golden-ratio-ish stride: spreads spawns evenly along edges
  timeScaleWaveBonus: 45,   // every N seconds survived adds +1 effective spawn wave
  spaceBetweenWaves: 0.8,   // breather seconds between timed waves
  despawnDistance: 1400     // enemies left this far behind vanish silently
};

function xpForLevel(l) {
  return G.xpLevels[l] || (G.xpLevels[G.xpLevels.length - 1] + (l - G.xpLevels.length + 1) * 300);
}

// ---------------------------------------------------------------------------
// WEAPONS — up to G.maxWeapons equipped; each levels up to maxLevel.
// apply(p) runs once per gained level and mutates player stat fields; firing
// behaviour lives in Game.updateWeapons.
// ---------------------------------------------------------------------------

function weaponEntry(id, name, icon, desc, maxLevel, applyFn) {
  return { kind: 'weapon', id, name, icon, desc, maxLevel, apply: applyFn };
}

const WEAPONS = [
  weaponEntry('scythe', 'Soul Scythe', '💀', 'Slash the foe ahead with a spectral scythe, sweeping multiple targets.', 8, (p) => {
    const lvl = p.weapons.scythe;
    p.scytheSwings = 1 + Math.floor(lvl / 3);          // extra quick swings
    p.scytheTargets = 1 + Math.floor(lvl / 2);
    p.scytheDamageMult = 1 + 0.15 * (lvl - 1);
    p.attackRange = G.playerBase.attackRange * (1 + 0.06 * (lvl - 1));
  }),
  weaponEntry('whip', 'Phantom Whip', '🗡️', 'Lash a line of shadow through every enemy in front of you.', 8, (p) => {
    const lvl = p.weapons.whip;
    p.whipDamage = 14 * (1 + 0.35 * (lvl - 1));
    p.whipReach = 95 + 14 * lvl;
    p.whipHitsBothSides = lvl >= 4;
    p.whipInterval = Math.max(0.55, 1.3 - 0.09 * lvl);
  }),
  weaponEntry('axe', "Reaper's Axe", '🪓', 'Hurl a heavy axe that arcs over the horde and strikes as it falls.', 8, (p) => {
    const lvl = p.weapons.axe;
    p.axeCount = 1 + Math.floor((lvl - 1) / 3);
    p.axeDamage = 22 * (1 + 0.3 * (lvl - 1));
    p.axeInterval = Math.max(0.7, 1.5 - 0.1 * lvl);
  }),
  weaponEntry('garlic', 'Hellfire Aura', '🔥', 'Cloak yourself in hellfire that scorches anything close by.', 8, (p) => {
    const lvl = p.weapons.garlic;
    p.garlicRadius = (60 + 9 * lvl) * p.aoeRadiusMult;
    p.garlicDamage = 4 + 2.2 * (lvl - 1);
    p.garlicTick = Math.max(0.25, 0.5 - 0.03 * lvl);
  }),
  weaponEntry('firewand', 'Fire Wand', '🧨', 'Hurl a burning bolt of fire at the nearest foe.', 8, (p) => {
    const lvl = p.weapons.firewand;
    p.firewandCount = 1 + Math.floor((lvl - 1) / 4);
    p.firewandDamage = 30 * (1 + 0.28 * (lvl - 1));
    p.firewandInterval = Math.max(0.9, 2.4 - 0.18 * lvl);
  }),
  weaponEntry('soulArrow', 'Soul Arrow', '🔮', 'Fire a seeking soul arrow at the closest enemy.', 8, (p) => {
    const lvl = p.weapons.soulArrow;
    p.soulArrowCount = 1 + Math.floor(lvl / 3);
    p.soulArrowDamage = 10 * Math.pow(1.25, lvl - 1);
    p.soulArrowInterval = Math.max(0.7, 1.5 - 0.1 * lvl);
  }),
  weaponEntry('orbital', 'Infernal Orbit', '🌑', 'Conjure shadow orbs that orbit you, grinding whatever they touch.', 8, (p) => {
    const lvl = p.weapons.orbital;
    p.orbitalCount = Math.min(lvl, 6);
    p.orbitalDamage = 10 * Math.pow(1.4, lvl - 1);
    p.orbitalRadius = 80 + 5 * lvl;
    p.orbitalSpeed = 3 + 0.15 * lvl;
  }),
  weaponEntry('lightning', 'Divine Wrath', '⚡', 'Smite the nearest foes with lances of holy lightning.', 8, (p) => {
    const lvl = p.weapons.lightning;
    p.lightningStrikeCount = Math.min(1 + Math.floor((lvl - 1) / 2), 5);
    p.lightningStrikeDamage = 25 * Math.pow(1.28, lvl - 1);
    p.lightningStrikeInterval = Math.max(0.9, 2 - 0.13 * lvl);
  }),
];

// ---------------------------------------------------------------------------
// PASSIVES — stat boosters, up to G.maxPassives held.
// ---------------------------------------------------------------------------

function passiveEntry(id, name, icon, desc, maxLevel, applyFn) {
  return { kind: 'passive', id, name, icon, desc, maxLevel, apply: applyFn };
}

const PASSIVES = [
  passiveEntry('might', 'Blood Pact', '🗡️', '+12% damage dealt.', 5, (p) => { p.damageMult *= 1.12; }),
  passiveEntry('armor', 'Dark Aegis', '⚰️', 'Incoming damage reduced by 10%.', 5, (p) => { p.armorMult *= 0.9; }),
  passiveEntry('vitality', 'Vampiric Rite', '🩸', '+20 maximum HP and instantly heal 20.', 5, (p) => { p.maxHp += 20; p.hp += 20; }),
  passiveEntry('lifesteal', 'Vampiric Thirst', '🧛', 'Heal for 10% of the damage you deal to enemies.', 5, (p) => { p.lifesteal += 0.1; }),
  passiveEntry('recovery', "Hydra's Blessing", '🐍', 'Regenerate 1.5 HP per second.', 5, (p) => { p.regen += 1.5; }),
  passiveEntry('alacrity', 'Alacrity', '⏳', 'All weapons cool down 8% faster.', 5, (p) => { p.cooldownMult *= 0.92; }),
  passiveEntry('reach', 'Hellfire Reach', '💫', 'Area of effect grows 12% larger.', 5, (p) => {
    p.aoeRadiusMult *= 1.12;
    if (p.weapons.garlic) p.garlicRadius *= 1.12;   // keep aura radius in sync
  }),
  passiveEntry('swiftness', 'Ghostwalk', '🌪️', 'Move 8% faster.', 5, (p) => { p.speedMult *= 1.08; }),
  passiveEntry('magnet', 'Soul Lantern', '🕯️', 'Pickup collection range widens 25%.', 5, (p) => { p.magnetRange *= 1.25; }),
];

// Lookup helpers -------------------------------------------------------------
const ALL_UPGRADE_ENTRIES = [...WEAPONS, ...PASSIVES];
function findUpgrade(id) { return ALL_UPGRADE_ENTRIES.find((u) => u.id === id) || null; }

// ---------------------------------------------------------------------------
// CHARACTERS — chosen on the select screen; each grants a starting weapon
// and a permanent bonus.
// ---------------------------------------------------------------------------

const CHARACTERS = [
  {
    id: 'knight',
    name: 'The Knight',
    portrait: 'assets/characters/knight/portrait.png',
    blurb: '+20 HP · takes 10% less damage',
    startWeapon: 'axe',
    apply: (p) => { p.maxHp += 20; p.hp += 20; p.armorMult *= 0.9; }
  },
  {
    id: 'necromancer',
    name: 'The Necromancer',
    portrait: 'assets/characters/necromancer/portrait.png',
    blurb: 'Soul Arrow start · +15% damage · wider pickup range',
    startWeapon: 'soulArrow',
    apply: (p) => { p.damageMult *= 1.15; p.magnetRange *= 1.3; }
  },
  {
    id: 'rogue',
    name: 'The Rogue',
    portrait: 'assets/characters/rogue/portrait.png',
    blurb: 'Phantom Whip start · +15% speed · faster weapons',
    startWeapon: 'whip',
    apply: (p) => { p.speedMult *= 1.15; p.cooldownMult *= 0.92; }
  },
];
function findCharacter(id) { return CHARACTERS.find((c) => c.id === id) || CHARACTERS[0]; }

// ---------------------------------------------------------------------------
// SHOP — Vampire-Survivors-style permanent meta progression bought with gold.
// Two kinds of purchase:
//   POWER-UPS  one-off unlocks that add a weapon/passive to the level-up pool.
//              Locked entries never appear as level-up choices.
//   RELICS     repeatable permanent stat boosts, cost rising each level.
// Anything with free:true is owned from the first run, so a new save is never
// left with an empty level-up pool.
// ---------------------------------------------------------------------------

function shopEntry(id, cost, free) {
  const def = findUpgrade(id);
  return { id, cost, free: !!free, icon: def.icon, name: def.name, desc: def.desc, kind: def.kind };
}

const SHOP_POWERUPS = [
  // Characters' starting weapons are always owned.
  shopEntry('whip', 0, true),
  shopEntry('soulArrow', 0, true),
  shopEntry('axe', 0, true),
  shopEntry('might', 0, true),
  shopEntry('armor', 0, true),
  shopEntry('vitality', 0, true),
  shopEntry('swiftness', 0, true),
  shopEntry('scythe', 50),
  shopEntry('lifesteal', 70),
  shopEntry('recovery', 70),
  shopEntry('alacrity', 85),
  shopEntry('garlic', 90),
  shopEntry('reach', 95),
  shopEntry('magnet', 110),
  shopEntry('firewand', 120),
  shopEntry('orbital', 165),
  shopEntry('lightning', 210)
];

function relicEntry(id, name, icon, desc, maxLevel, baseCost, costStep, applyFn) {
  return { id, name, icon, desc, maxLevel, baseCost, costStep, apply: applyFn };
}

const SHOP_RELICS = [
  relicEntry('vigor', 'Empowered Vigor', '❤', '+15 maximum HP, healed on purchase.', 10, 60, 50,
    (p) => { p.maxHp += 15; p.hp = Math.min(p.maxHp, p.hp + 15); }),
  relicEntry('fury', 'Blood Fury', '🗡', '+6% damage dealt.', 10, 80, 70,
    (p) => { p.damageMult *= 1.06; }),
  relicEntry('haste', 'Windward', '🌪', '+4% movement speed.', 8, 70, 60,
    (p) => { p.speedMult *= 1.04; }),
  relicEntry('aegis', 'Bone Ward', '🛡', 'Incoming damage reduced by 4%.', 8, 85, 75,
    (p) => { p.armorMult *= 0.96; }),
  relicEntry('fortune', 'Gilded Touch', '🪙', '+12% pickup range and +10% gold found.', 6, 90, 80,
    (p) => { p.magnetRange *= 1.12; }),
  relicEntry('reflex', 'Cat Reflexes', '💨', 'Dash cooldown reduced by 6%.', 6, 75, 65,
    (p) => { p.baseDashCooldown = Math.max(0.6, p.baseDashCooldown * 0.94); })
];

function findRelic(id) { return SHOP_RELICS.find((r) => r.id === id) || null; }
function findShopPowerup(id) { return SHOP_POWERUPS.find((u) => u.id === id) || null; }

const DIFFICULTIES = {
  dusk: {
    label: 'Dusk', desc: 'The darkness stirs slowly…',
    hpScale: 0.08, dmgScale: 0.05, spdScale: 0.04,
    spawnBonus: -2, spawnIntervalMult: 1.3, xpMult: 0.8, baseStatMult: 0.85,
    goldChance: 0.07, goldMult: 1
  },
  midnight: {
    label: 'Midnight', desc: 'The balance of shadow.',
    hpScale: 0.12, dmgScale: 0.07, spdScale: 0.05,
    spawnBonus: 0, spawnIntervalMult: 1.0, xpMult: 1.0, baseStatMult: 1.0,
    goldChance: 0.11, goldMult: 1.5
  },
  void: {
    label: 'Void', desc: 'The abyss hungers…',
    hpScale: 0.17, dmgScale: 0.10, spdScale: 0.07,
    spawnBonus: 2, spawnIntervalMult: 0.8, xpMult: 1.3, baseStatMult: 1.15,
    goldChance: 0.16, goldMult: 2.2
  },
  oblivion: {
    label: 'Oblivion', desc: 'The end of all things.',
    hpScale: 0.24, dmgScale: 0.15, spdScale: 0.10,
    spawnBonus: 5, spawnIntervalMult: 0.6, xpMult: 1.5, baseStatMult: 1.25,
    goldChance: 0.22, goldMult: 3.2
  }
};
