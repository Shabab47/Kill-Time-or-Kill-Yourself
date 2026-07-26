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
  maxLevel: 20
};

function xpForLevel(l) {
  return G.xpLevels[l] || (G.xpLevels[G.xpLevels.length - 1] + (l - G.xpLevels.length + 1) * 300);
}

const DIFFICULTIES = {
  dusk: {
    label: 'Dusk', desc: 'The darkness stirs slowly…',
    hpScale: 0.05, dmgScale: 0.03, spdScale: 0.02,
    spawnBonus: -2, spawnIntervalMult: 1.3, xpMult: 0.8, baseStatMult: 0.85
  },
  midnight: {
    label: 'Midnight', desc: 'The balance of shadow.',
    hpScale: 0.08, dmgScale: 0.05, spdScale: 0.03,
    spawnBonus: 0, spawnIntervalMult: 1.0, xpMult: 1.0, baseStatMult: 1.0
  },
  void: {
    label: 'Void', desc: 'The abyss hungers…',
    hpScale: 0.12, dmgScale: 0.08, spdScale: 0.05,
    spawnBonus: 2, spawnIntervalMult: 0.8, xpMult: 1.3, baseStatMult: 1.15
  },
  oblivion: {
    label: 'Oblivion', desc: 'The end of all things.',
    hpScale: 0.18, dmgScale: 0.12, spdScale: 0.07,
    spawnBonus: 5, spawnIntervalMult: 0.6, xpMult: 1.5, baseStatMult: 1.25
  }
};

const UPGRADES = [
  { id: 'dmg', name: 'Blood Pact', desc: '+25% damage', icon: '🗡️', apply: p => { p.damageMult *= 1.25; }, maxStack: 5 },
  { id: 'aspd', name: 'Shadow Pact', desc: '+20% attack speed', icon: '🌑', apply: p => { p.attackSpeedMult *= 1.2; }, maxStack: 5 },
  { id: 'spd', name: 'Ghostwalk', desc: '+15% move speed', icon: '🌪️', apply: p => { p.speedMult *= 1.15; }, maxStack: 4 },
  { id: 'hp', name: 'Vampiric Rite', desc: '+40 max HP', icon: '🩸', apply: p => { p.maxHp += 40; p.hp = Math.min(p.hp + 40, p.maxHp); }, maxStack: 5 },
  { id: 'regen', name: 'Necrotic Boon', desc: '+3 HP/sec', icon: '💀', apply: p => { p.regen += 3; }, maxStack: 3 },
  { id: 'multi', name: 'Soul Fissure', desc: '+1 extra slash per swing', icon: '🔮', apply: p => { p.projectileCount += 1; }, maxStack: 3 },
  { id: 'pierce', name: 'Bone Shard', desc: 'Slash cleaves +1 more enemy', icon: '🗡️', apply: p => { p.pierce += 1; }, maxStack: 3 },
  { id: 'magnet', name: 'Soul Lantern', desc: '+50% XP pickup range', icon: '🕯️', apply: p => { p.magnetRange *= 1.5; }, maxStack: 3 },
  { id: 'armor', name: 'Dark Aegis', desc: '-15% damage taken', icon: '⚰️', apply: p => { p.armorMult *= 0.85; }, maxStack: 4 },
  { id: 'thorns', name: 'Crimson Ward', desc: '20% damage reflected', icon: '🩸', apply: p => { p.thorns += 0.2; }, maxStack: 3 },
  { id: 'lifesteal', name: 'Vampiric Aura', desc: '8% damage healed as HP', icon: '🧛', apply: p => { p.lifesteal += 0.08; }, maxStack: 3 },
  { id: 'explosive', name: 'Demonic Rupture', desc: '20% chance for AoE explosion', icon: '💫', apply: p => { p.explosiveChance += 0.2; }, maxStack: 2 },
  { id: 'dashdmg', name: 'Phantom Rush', desc: 'Dash deals 40 damage', icon: '👻', apply: p => { p.dashDamage += 40; }, maxStack: 2 },
  { id: 'aoe', name: 'Hellfire', desc: '+30% explosion radius', icon: '🔥', apply: p => { p.aoeRadiusMult *= 1.3; }, maxStack: 3 },
  { id: 'orbital', name: 'Infernal Orbit', desc: 'Fireball circles you, burning enemies', icon: '🔥', apply: p => { p.orbitalCount += 1; p.orbitalDamage = p.orbitalDamage ? p.orbitalDamage * 1.5 : 10; }, maxStack: 3 },
  { id: 'soulArrow', name: 'Soul Arrow', desc: 'Auto-fire soul arrows at nearest foe', icon: '🔮', apply: p => { p.soulArrowCount += 1; p.soulArrowDamage = (p.soulArrowDamage || 10) * 1.25; }, maxStack: 5 },
  { id: 'lightning', name: 'Divine Wrath', desc: 'Lightning strikes a random enemy', icon: '⚡', apply: p => { p.lightningStrikeCount += 1; p.lightningStrikeDamage = (p.lightningStrikeDamage || 25) * 1.3; }, maxStack: 3 },
];
