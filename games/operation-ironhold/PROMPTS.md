# Prompts

The prompts that specify the game, in the order they were given. Wording is unedited, typos
included.

---

## 1. The specification

Everything below arrived in one message.

```text
build a complete realistic FPS shooter game in a single HTML file. everything inline — JS and CSS in the same file. no external dependencies except three.js from CDN (https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js). no build tools, no npm.

**core gameplay:**
- first person shooter, single player vs AI enemies
- WASD movement, mouse look with pointer lock on click
- left click to shoot, R to reload, shift to sprint, ctrl to crouch, space to jump
- sprint adds FOV push effect and lowers weapon slightly
- crouch lowers camera height and reduces movement speed
- jump with landing camera shake

**weapons system (switch with 1, 2, 3):**
- slot 1: assault rifle — full auto, 30 round mag, moderate spread that increases with sustained fire, semi-auto toggle with V key
- slot 2: shotgun — pump action, 8 shells, wide spread, high damage up close, pump animation between shots
- slot 3: pistol — semi auto, 15 rounds, accurate, fast draw speed
- each weapon needs a visible 3D viewmodel at bottom right — build them from three.js geometry (boxes, cylinders). add gloved hands holding the weapon
- weapon sway on mouse movement, bob when walking synced to footsteps
- muzzle flash (point light + sprite) on every shot
- shell casings that eject and bounce on the ground with physics
- reload animation (weapon dips down off screen and comes back)
- draw animation when switching weapons

**enemies (10 total):**
- humanoid models built from three.js geometry (capsule body, sphere head, box limbs)
- each enemy has a floating name tag and health bar above their head
- enemy names: VIPER, GHOST, REAPER, HAVOC, STRIKER, COBRA, TALON, WOLF, DIESEL, SHADOW
- enemies patrol waypoints around the map using simple pathfinding
- when they spot you (line of sight + distance check), they stop, aim, and shoot with human-like reaction delay (300-800ms random)
- enemies strafe left/right during combat
- headshot detection — 2x damage on head hitbox
- hit reaction animation (flinch backward)
- death animation (ragdoll-style fall, weapon drops to ground)
- enemies deal damage to player with visible red screen flash

**map design — abandoned warehouse district:**
- 60x60 unit play area
- concrete floor with grid texture (procedural)
- shipping containers (large colored boxes) placed as cover throughout
- two story building on one side with accessible second floor via ramp — gives sniper advantage
- long corridor between container stacks (close quarters)
- open center area with a destroyed vehicle (boxes arranged as car shape)
- chain link fence sections around the perimeter (thin planes with alpha)
- barrel stacks that block sightlines
- crate clusters for cover
- directional lighting with shadows casting from a sun position
- fog in the distance for atmosphere

**HUD:**
- crosshair center screen (dynamic — expands when moving/shooting, contracts when still)
- health bar bottom left with number (starts at 100)
- armor bar below health (starts at 50, reduces damage by 50%)
- ammo counter bottom right: current mag / total reserve
- weapon name and icon next to ammo
- kill feed top right — shows "YOU killed ENEMY" with headshot icon when applicable
- hit marker (white X flash) when you land a shot
- damage direction indicator (red arc on screen edge showing where damage came from)
- minimap top left showing player position, enemy dots (red when spotted), and map walls
- round timer top center counting down from 3:00
- kill counter: "X / 10 eliminated"

**audio (all procedural Web Audio API, no external files):**
- gunshot sounds per weapon (rifle = sharp crack, shotgun = deep boom, pistol = snap)
- reload sound (metallic click)
- footsteps synced to movement (concrete sound)
- bullet impact sounds (different for wall vs enemy)
- enemy death sound
- hit confirmation beep
- low health heartbeat warning when under 20hp
- ambient industrial hum in background

**post processing:**
- bloom on muzzle flash and bright lights
- vignette darkening at screen edges
- slight color grading (desaturated, slightly blue shadows)
- screen shake on taking damage and on shooting shotgun

**game flow:**
- start screen: "PRESS TO START" with title
- pointer lock activates on click
- kill all 10 enemies to win
- die or run out of time to lose
- end screen shows: kills, headshots, accuracy percentage, time survived
- restart button on end screen

**performance:**
- use merged geometries where possible to reduce draw calls
- shadow maps at 2048
- keep it running 60fps on mid-range hardware
- use instanced mesh for repeated objects like crates and barrels

make it feel like a real game. weight to the movement, punch to the guns, tension in the combat. not a tech demo.
```

---

## 2. Aim down sights, the sniper, and parkour

Added the fourth weapon, the scope, and the ability to climb onto things.

```text
aim-down-sights (ADS) for all weapons on right click:

assault rifle: FOV goes from 75 to 55, weapon model moves to center screen, tighter spread while aiming
shotgun: FOV goes from 75 to 60, slight zoom, weapon centers
pistol: FOV goes from 75 to 50, weapon raises to center with iron sight alignment
sniper: FOV goes from 75 to 15, full scope overlay with dark circular vignette and mil-dot crosshair lines, subtle scope sway (slow sine wave on x and y), hold shift while scoped to hold breath (sway settles to near zero for 3 seconds)

smooth transition in and out (0.2 sec lerp) for all weapons
reduce movement speed by 40% while ADS
right click to toggle ADS on/off
disable normal crosshair while using sniper scope

sniper rifle as slot 4: bolt action, 5 round mag, one shot kill to body, headshot instant kill
bolt cycle animation between shots (1.5 sec delay)
loud crack sound, visible bullet tracer line
switch weapons with 1-4 and scroll wheel

parkour/mantle: when player jumps near a container or crate edge and holds space, auto-mantle onto it (camera lifts up smoothly to the top)
player can stand and walk on top of containers, crates, the vehicle, and barrel stacks
double jump: tap space twice quickly for extra height
increase base jump height slightly so player can reach container tops with mantle
add collision on top of all objects so player doesn't fall through
```

---

## 3. The bug list

The longest correction of the project. Collision, enemy AI and weapon reliability were all
rebuilt off the back of it.

```text
the game has major bugs that need fixing before this is shareable. go through everything and fix all of these:

**collision bugs (highest priority):**
- player can walk through some walls. every single wall, container, crate, barrel, and building must have solid collision. the player should never pass through any object. check every single object in the scene has a collider and that the collision detection actually works
- enemies are getting stuck inside containers and walls. add collision checks for enemy pathfinding so they navigate AROUND objects, never through them. if an enemy is stuck, teleport them to the nearest valid position outside any object
- enemies stuck inside containers can still shoot the player but player can't shoot back. fix this — if there's no clear line of sight between player and enemy (raycast hits a wall/container), the enemy cannot deal damage

**enemy AI fixes:**
- enemies should never walk into walls or containers. their pathfinding needs to respect all solid objects
- enemies should never stand still in the open doing nothing. if they're not in combat, they patrol. if they spot the player, they engage immediately
- enemies should take cover behind containers and crates during combat, not just stand in the open
- if an enemy can't reach the player, they should find an alternative path, not freeze

**weapon and shooting fixes:**
- make sure every weapon actually fires when clicking. if there's any delay or missed input, fix it
- muzzle flash needs to be visible and punchy — bright flash + point light for 2 frames
- bullet hit detection needs to be accurate. if crosshair is on the enemy, the bullet should hit. no phantom misses
- shell casings should eject properly from the right side of the weapon
- reload should feel smooth — weapon dips, mag change sound, weapon comes back
- ADS (aim down sights) on right click must work for every weapon. if it's broken, fix it
- sniper scope overlay must appear on right click with the sniper equipped

**general polish:**
- make sure the player cannot leave the map boundaries. add invisible walls at all edges
- fix any z-fighting or flickering textures
- make sure the minimap accurately shows wall positions and enemy dots
- death screen and win screen must work properly with accurate stats
- fix any console errors

test everything after fixing. walk along every wall. try to walk through every container. watch every enemy for 30 seconds to make sure they're not stuck. fire every weapon and confirm it works. this needs to feel like a finished game, not a broken prototype.
```

---

## 4. The crosshair

```text
replace the current crosshair with a valorant-style competitive crosshair:

**inner lines:**
- 4 lines (top, bottom, left, right)
- each line is 4px long, 2px thick
- offset 1px from center (small gap in the middle)
- color: white with thin black outline for visibility on any background
- no center dot

**outer lines:**
- 4 lines (top, bottom, left, right)
- each line is 3px long, 2px thick
- offset 2px from the end of the inner lines (gap between inner and outer)
- same white with black outline

**behavior:**
- crosshair stays static when standing still
- inner lines expand outward when moving or shooting (dynamic spread)
- inner lines return to default position when standing still and not firing (0.15 sec lerp back)
- outer lines don't move
- no firing error on outer lines
- no movement error on outer lines
- crosshair disappears when using sniper scope ADS
- crosshair stays visible for all other weapons during ADS

draw this with canvas overlay, not HTML elements. needs to be pixel-perfect and centered.
```

---

## 5. Enemy aim, the sky, and the M4 optic

Sent with two screenshots: one looking up at the zenith, one down a container lane.

```text
time to fix some bugs, enemeies guns are pointing backwards if you see while shooting and our sky looks pixelated like you can see here and one more thing zooming in in m4 carbine is like trash i mean theres' no use if i can't zoom in more and see enemy
```
