# Kill Time or Kill Yourself

A gothic roguelike action game. Survive endless waves of darkness, collect souls, and ascend through unholy power.

## How to Play

**Survive.** Each wave brings more and deadlier foes. Slay them, collect their souls (XP), and level up to choose from 15 dark pacts. Every 5 waves, a Lich awakens.

**Controls**

| PC | Mobile |
|---|---|
| WASD / Arrow Keys — Move | Left-side joystick — Move |
| Space — Dash | Bottom-right button — Dash |
| Auto-attacks nearest enemy | Auto-attacks nearest enemy |

## Bestiary

| Foe | Description |
|---|---|
| **Skeleton** | Bone-white foot soldier. Charges relentlessly. |
| **Cultist** | Purple-robed mage. Attacks from range with dark bolts. |
| **Hound** | Blood-red beast. Fast, fragile, deadly in packs. |
| **Knight** | Dark steel armor. Slow, near-impenetrable, gold-trimmed. |
| **Lich** | Void-born sorcerer lord. Appears every 5 waves. Massive HP, pulsing with neon purple malice. |

## Dark Pacts (Upgrades)

| Pact | Effect | Max |
|---|---|---|
| Blood Pact 🗡️ | +25% damage | 5 |
| Shadow Pact 🌑 | +20% attack speed | 5 |
| Ghostwalk 🌪️ | +15% move speed | 4 |
| Vampiric Rite 🩸 | +40 max HP | 5 |
| Necrotic Boon 💀 | +3 HP/sec | 3 |
| Soul Fissure 🔮 | +1 projectile | 3 |
| Bone Shard 🏹 | +1 pierce | 3 |
| Soul Lantern 🕯️ | +50% XP range | 3 |
| Dark Aegis ⚰️ | -15% damage taken | 4 |
| Crimson Ward 🩸 | 20% reflect damage | 3 |
| Vampiric Aura 🧛 | 8% lifesteal | 3 |
| Demonic Rupture 💫 | 20% AoE explosion | 2 |
| Phantom Rush 👻 | Dash deals 40 damage | 2 |
| Hellfire 🔥 | +30% explosion radius | 3 |
| Infernal Orbit 🔥 | Fireball circles you, burning enemies | 3 |

## Project Structure

```
Kill Time or Kill Yourself/
├── README.md
├── frontend/                  # Presentation layer
│   ├── index.html             # Game entry point
│   ├── css/
│   │   └── style.css          # Gothic-themed styles
│   └── js/
│       ├── sprites.js          # Pre-rendered sprite canvases
│       ├── renderer.js         # Canvas 2D rendering
│       ├── input.js            # Keyboard + touch input
│       ├── camera.js           # Camera follow + screen shake
│       └── particles.js        # Particle effects system
├── backend/                   # Game logic layer
│   ├── config.js              # Constants, enemy stats, upgrades
│   ├── utils.js               # Math helpers
│   ├── player/
│   │   └── player.js          # Player class
│   ├── enemy/
│   │   ├── enemy.js           # Base Enemy class
│   │   ├── skeleton.js        # Skeleton (melee)
│   │   ├── cultist.js         # Cultist (ranged)
│   │   ├── hound.js           # Hound (fast)
│   │   ├── knight.js          # Knight (tank)
│   │   ├── lich.js            # Lich (boss)
│   │   ├── xp-orb.js          # XP orb class
│   │   └── registry.js        # Enemy type -> class map
│   ├── waves.js               # Wave spawner
│   └── game.js                # Game orchestrator + loop
└── audio/                     # Audio layer
    └── audio.js               # Procedural audio (Web Audio API)
```

## How to Run

Open `frontend/index.html` in any modern browser. No server, build step, or dependencies required. Works offline — Google Fonts gracefully fall back to Georgia/serif if disconnected.

## Tech

- Plain JavaScript (ES6 classes, no frameworks)
- Canvas 2D API for rendering
- Web Audio API for procedural sound effects
- No dependencies, no build tools
- Works on desktop (keyboard) and mobile (touch)


