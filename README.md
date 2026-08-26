# Kill Time or Kill Yourself

A gothic, **Vampire Survivors–inspired** survival roguelite. Roam an **endless cursed map**, mow down ever-growing hordes of the damned, collect their souls, and forge an unholy build of up to **4 weapons** and **5 passive relics** before the darkness takes you.

## How to Play

1. **ENTER THE DARKNESS** — pick a difficulty.
2. **CHOOSE YOUR SOUL** — pick one of three heroes (each starts with a unique weapon and bonus).
3. **Survive.** Your weapons fire automatically. Kill enemies → collect soul gems (XP) → level up → choose 1 of 4 upgrades.

There is no winning. The map never ends and neither does the horde. How long can you last?

### Controls

| PC | Mobile |
|---|---|
| WASD / Arrow Keys — Move | Left-side virtual joystick — Move |
| Space — Dash (brief invulnerability) | Bottom-right button — Dash |
| Weapons auto-fire | Weapons auto-fire |
| Esc — Pause | Pause button |

## Heroes

Portraits are generated pixel art (`tools/generate_character_art.py`).

| Hero | Starting Weapon | Bonus |
|---|---|---|
| **The Knight** | 💀 Soul Scythe | +20 HP · takes 10% less damage |
| **The Necromancer** | 🔮 Soul Arrow | +15% damage · +30% pickup range |
| **The Rogue** | 🗡️ Phantom Whip | +15% move speed · 8% faster weapons |

## Weapons (max 4 equipped · 8 levels each)

Weapons only appear as *new* picks while you have free slots; after that they level up.

| Weapon | Behavior |
|---|---|
| 💀 **Soul Scythe** | Auto-cleaves the nearest foe. Levels add cleave targets, extra swings, and reach. |
| 🗡️ **Phantom Whip** | Piercing arc sweeps one side of you (both sides at Lv4). |
| 🪓 **Reaper's Axe** | Hurled skyward with gravity, spinning. Pierces everything it touches. |
| 🔥 **Hellfire Aura** | Burning ring around you. Ticks damage and knocks foes back. |
| 🧨 **Fire Wand** | Lobs explosive bolts at *random* enemies (not the nearest). |
| 🔮 **Soul Arrow** | Volley of bolts at the nearest foe. Levels add arrows and damage. |
| 🌑 **Infernal Orbit** | Up to 6 fireballs circle you, burning on contact. |
| ⚡ **Divine Wrath** | Lightning strikes random enemies. Levels add strikes and damage. |

## Passive Relics (max 5 held · 5 levels each)

| Relic | Effect per level |
|---|---|
| 🗡️ Blood Pact (Might) | +12% damage |
| ⚰️ Dark Aegis (Armor) | −10% damage taken |
| 🩸 Vampiric Rite (Vitality) | +20 max HP (and heals 20) |
| 💚 Necrotic Boon (Recovery) | +1.5 HP/sec regen |
| ⏳ Alacrity | −8% cooldown on ALL weapons |
| 💫 Hellfire Reach (Area) | +12% area of effect |
| 🌪️ Ghostwalk (Swiftness) | +8% move speed |
| 🕯️ Soul Lantern (Magnet) | +25% XP pickup range |

When everything is maxed, level-ups offer a heal instead.

## The Endless World

The map has **no borders**. Terrain scrolls forever and obstacles generate procedurally in 600px chunks, deterministically seeded — walk 10,000px away and back, and everything is exactly where you left it. Enemies that fall too far behind (>1400px) despawn silently so the horde always follows *you*.

## Difficulty Systems

| System | Effect |
|---|---|
| **Waves** | Spawn counts grow every wave. Every 5th wave ends with a **Lich** boss. |
| **Trickle stream** | A background stream spawns enemies continuously — even between waves. Never a safe moment. |
| **Swarm events** | Every 60s a ring of foes closes in from all directions ("THE CIRCLE CLOSES IN…"). |
| **Time ramp** | Every 45s survived adds +1 effective wave to enemy stats — running away forever makes them stronger, not weaker. |
| **Elites** | From wave 3, mid-wave spawns can be golden-ring elites: 7× HP, 1.5× size/damage, 6× XP — guaranteed treasure chest. |

Per-difficulty growth per wave:

| Difficulty | HP/wave | DMG/wave | SPD/wave |
|---|---|---|---|
| Dusk | +8% | +5% | +4% |
| Midnight | +12% | +7% | +5% |
| Void | +17% | +10% | +7% |
| Oblivion | +24% | +15% | +10% |

## Treasure Chests

Dropped by elites (guaranteed) or occasionally by regular kills:

| Wave | Rewards |
|---|---|
| 1–4 | 1 upgrade |
| 5–9 | 3 upgrades (35% chance of 5 at wave 10+) |

Chests apply instantly with a golden fanfare — no picking required.

## Items

Enemies may drop consumables (despawn after 15s). Rates scale slightly with wave number.

| Item | Effect |
|---|---|
| **Health Potion** | Restores 30 HP |
| **Shield** | Absorbs the next hit entirely, then shatters |
| **Haste** | +50% move speed for 5 seconds |
| **Chest** | Treasure! See above |

## Bestiary

| Foe | Description |
|---|---|
| **Skeleton** | Bone-white foot soldier. Charges relentlessly. |
| **Cultist** | Purple-robed mage. Keeps distance, fires dark bolts. |
| **Hound** | Blood-red beast. Fast, fragile, deadly in packs. |
| **Knight** | Dark steel armor. Slow tanky wall of metal. |
| **Lich** *(boss)* | Void-born sorcerer lord. Every 5 waves. 3 phases: chase → summon → teleport + bullet bursts. |
| **Elite** *(variant)* | Golden-ring champion version of any foe. Massive HP, drops a chest. |

## HUD Guide

| Element | Meaning |
|---|---|
| Top-center clock | Survival time (M:SS) |
| Icons under HP bar | Equipped weapons (gold border) and passives (green border) with levels |
| XP bar (bottom) | Fills toward next level-up |
| Gold rings on enemies | Elites — kill them for chests |
| "THE LICH AWAKENS" | Boss incoming |
| "THE CIRCLE CLOSES IN…" | Swarm event — get moving |

## Project Structure

```
Kill Time or Kill Yourself/
├── README.md                        # This file
├── tools/
│   └── generate_character_art.py    # Pixel-art portrait generator (stdlib-only PNG writer)
├── frontend/                        # Presentation layer
│   ├── index.html                   # Entry point + menus/HUD markup
│   ├── css/style.css                # Gothic-themed styles
│   └── assets/
│       ├── characters/              # Generated hero portraits (knight/necromancer/rogue)
│       ├── Elements/                # Fireball frames, ground tile, lightning, shield
│       ├── enemies/                 # Enemy sprite sheets (8-directional)
│       └── player/                  # Player sprite sheets (8-directional)
├── src/
│   ├── config.js                    # Balance data: G constants, WEAPONS, PASSIVES,
│   │                                #   CHARACTERS, DIFFICULTIES, XP curve
│   ├── utils.js                     # Math helpers, FloatingNumber, shared combat
│   │                                #   (detonateExplosion, lifesteal, findNearestEnemy)
│   ├── Game.js                      # Orchestrator: state machine, weapon firing,
│   │                                #   projectiles, pickups, chests, HUD, main loop
│   ├── Renderer.js                  # Layered render pipeline
│   ├── Camera.js                    # Follow camera + screen shake
│   ├── Input.js                     # Keyboard + mouse + touch (virtual joystick)
│   ├── Particles.js                 # Particle effects system
│   ├── player/
│   │   ├── Player.js                # Movement, dash, scythe attack, animation FSM
│   │   └── sprite.js                # Player sprite sheet loader
│   ├── enemies/
│   │   ├── Enemy.js                 # Base class (stats scale by wave & difficulty)
│   │   ├── Chaser.js                # Skeleton / Hound / Knight
│   │   ├── Cultist.js               # Ranged attacker
│   │   ├── Lich.js                  # 3-phase boss
│   │   ├── XpOrb.js                 # Magnetized soul gems
│   │   ├── registry.js              # Enemy type → class map
│   │   └── sprites/                 # Enemy sprite loaders
│   ├── map/
│   │   ├── MapGenerator.js          # Endless world: chunked deterministic obstacles
│   │   ├── sprites.js               # Ground/tile sprites
│   │   └── torch.js                 # Torch sprites
│   ├── items/
│   │   ├── Item.js                  # Dropped items + drop-rate roll
│   │   └── sprites.js               # Item sprites (procedural + PNG)
│   ├── projectiles/sprites/         # Projectile sprite canvases
│   ├── effects/                     # FireBall / LightningStrike / SoulArrow loaders
│   ├── systems/
│   │   └── WaveManager.js           # Waves + trickle stream + swarm events + elites
│   ├── audio/
│   │   ├── AudioManager.js          # Web Audio API manager
│   │   ├── registry.js + demon/     # Procedural sound synthesis per enemy
│   └── render/                      # One render pass per layer
│       ├── renderTiles.js           # Infinite scrolling ground
│       ├── orbitals.js              # Hellfire aura ring + orbital fireballs
│       ├── projectiles.js           # Includes spinning axe rendering
│       ├── enemies.js               # Elite rings, boss auras, HP bars
│       └── ...                      # items, particles, touch UI, overlays
```

## How to Run

Serve the folder with any static file server:

```bash
python -m http.server 8080
# then open http://localhost:8080/frontend/index.html
```

Works on desktop (keyboard) and mobile (touch). No build step, no dependencies.

## Regenerating Character Art

```bash
python tools/generate_character_art.py
```

Pure standard library — hand-rolled PNG encoder over ASCII pixel grids. Edit a grid or palette in the script, re-run, hard-refresh the browser.

## Testing

Game logic is fully decoupled from the DOM, enabling headless simulation in Node: stub canvas/Audio/Image APIs, load all 56 sources in `index.html` order, and simulate real gameplay frame-by-frame (movement, weapon firing, leveling, chests, elites, swarms, death/restart). All balance constants live in `src/config.js`, so tuning never touches logic.

## Tech

- Plain JavaScript (ES6 classes, zero frameworks, zero dependencies)
- Canvas 2D rendering with layered passes and screen shake
- Web Audio API procedural sound effects
- Deterministic chunk-seeded world generation (mulberry32 PRNG)
- Frame-time-clamped game loop (hitch-safe)


