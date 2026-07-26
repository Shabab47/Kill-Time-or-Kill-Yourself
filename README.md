# Kill Time or Kill Yourself

A gothic roguelike action game. Survive endless waves of darkness, collect souls, and ascend through unholy power.

## How to Play

**Survive.** Each wave brings more and deadlier foes. Slay them, collect their souls (XP), and level up to choose from 16 dark pacts. Every 5 waves, a Lich awakens.

**Controls**

| PC | Mobile |
|---|---|
| WASD / Arrow Keys — Move | Left-side joystick — Move |
| Space — Dash | Bottom-right button — Dash |
| Auto-attacks nearest enemy | Auto-attacks nearest enemy |

## Items

Enemies have a chance to drop consumable items on death. Items despawn after 15 seconds.

| Item | Effect |
|---|---|
| **Health Potion** | Restores 30 HP |
| **Shield** | Grants a blue energy barrier that absorbs the next hit. Breaks on impact with particles and sound. |
| **Haste** | +50% move speed for 5 seconds |
| **Chest** | Grants a random upgrade |

Drop rates scale slightly with wave number.

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
| Soul Arrow 🔮 | Auto-fire soul arrows at nearest foe | 5 |
| Divine Wrath ⚡ | Lightning strikes a random enemy from the sky | 3 |

## Project Structure

```
Kill Time or Kill Yourself/
├── README.md
├── frontend/                      # Presentation layer
│   ├── index.html                 # Game entry point
│   ├── css/
│   │   └── style.css              # Gothic-themed styles
│   └── assets/                    # Bitmap assets
│       ├── Elements/
│       │   ├── FireBall/          # Fireball animation frames
│       │   ├── Ground/
│       │   │   └── mudgrass.png   # Ground tile texture
│       │   ├── Lighting Strike/
│       │   │   ├── LF1.png        # Lightning frame 1
│       │   │   ├── LF2.png        # Lightning frame 2
│       │   │   └── demo.html      # Standalone lightning animation preview
│       │   └── Shield/
│       │       ├── Shield.png     # Shield item sprite (PNG overlay)
│       │       └── animate.html   # Standalone shield animation preview
│       ├── enemies/               # Enemy sprite sheets
│       └── player/                # Player sprite sheets
├── src/                           # Game logic
│   ├── config.js                  # Constants, enemy stats, upgrades
│   ├── utils.js                   # Math helpers
│   ├── Game.js                    # Game orchestrator + loop
│   ├── Renderer.js                # Master renderer
│   ├── Camera.js                  # Camera follow + screen shake
│   ├── Input.js                   # Keyboard + touch input
│   ├── Particles.js               # Particle effects system
│   ├── sprites/
│   │   └── registry.js            # Global sprite() function + cache
│   ├── player/
│   │   ├── Player.js              # Player class
│   │   └── sprite.js              # Procedural player sprites
│   ├── enemies/
│   │   ├── Enemy.js               # Base enemy class
│   │   ├── Chaser.js              # Skeleton / Hound / Knight
│   │   ├── Cultist.js             # Ranged cultist
│   │   ├── Lich.js                # Boss enemy
│   │   ├── XpOrb.js               # XP orb class
│   │   ├── registry.js            # Enemy type → class map
│   │   └── sprites/               # Enemy procedural + PNG sprite loaders
│   ├── map/
│   │   ├── MapGenerator.js        # Procedural obstacle generation
│   │   ├── sprites.js             # Ground tile + misc sprite definitions
│   │   └── torch.js               # Torch sprite
│   ├── items/
│   │   ├── Item.js                # Dropped item class + drop roll
│   │   └── sprites.js             # Item sprite definitions (procedural + PNG)
│   ├── projectiles/
│   │   └── sprites/               # Projectile sprite canvases
│   ├── effects/
│   │   ├── FireBall.js            # Orbital fireball animation loader
│   │   ├── LightningStrike.js     # Lightning bolt frame loader
│   │   └── SoulArrow.js           # Soul arrow projectile effect
│   ├── systems/
│   │   └── WaveManager.js         # Wave spawning logic
│   ├── audio/
│   │   ├── registry.js            # Audio effect registry
│   │   ├── AudioManager.js        # Web Audio API manager
│   │   └── demon/                 # Procedural audio per enemy type
│   └── render/                    # Render passes (one file per layer)
│       ├── renderClear.js
│       ├── renderTiles.js
│       ├── renderOverlay.js
│       ├── obstacles.js
│       ├── xpOrbs.js
│       ├── items.js               # Item rendering (supports per-axis scaling)
│       ├── enemies.js
│       ├── projectiles.js
│       ├── player.js              # Player rendering + shield ball visual
│       ├── orbitals.js
│       ├── floatingNumbers.js
│       ├── particles.js
│       ├── lightningStrike.js     # Lightning bolt animation renderer
│       └── touchUI.js
```

## How to Run

Open `frontend/index.html` in any modern browser. No server, build step, or dependencies required. Works offline — Google Fonts gracefully fall back to Georgia/serif if disconnected.

## Tech

- Plain JavaScript (ES6 classes, no frameworks)
- Canvas 2D API for rendering
- Web Audio API for procedural sound effects
- No dependencies, no build tools
- Works on desktop (keyboard) and mobile (touch)


