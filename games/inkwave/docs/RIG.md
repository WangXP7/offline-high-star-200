# Squidkid rig contract

The kid is one SkinnedMesh rig. Bones are defined in `src/game/character-geo.js` → `BODY_BONES` (name, parent, rest
position in metres), with `BONE_NAMES`, `BONE_INDEX`, `BONE_PARENT`, `REST`, `getRestPositions(style)`,
`getBoneInverses(style)`. Hair strands (HAIR_MAX × HAIR_SEGS) and the squid form are driven by character.js.

Original bones: hips → spine → chest → neck → head; clavL/R → uArm → fArm → hand; thighL/R → shin → foot;
face helpers eyeL/R, browL/R, mouth, mouthO (children of head). Added bones: see below.

## Rules
- The modeling code may **add** bones (e.g. fingers, thumb, toes, jaw, eyelids, cheeks, tee hem / shorts / tank
  jiggle bones, hair tips). Never rename or remove existing ones; keep rest positions of existing bones unless a
  proportion change is agreed here.
- Every added bone gets a line below (name · parent · purpose · suggested motion). Unanimated bones must look right at
  rest.
- The animation code animates whatever exists.
- Budgets: ≤ 40k triangles per character (all forms + weapon, visible meshes), ≤ ~14 draw calls in kid form.

## Added bones
All added bones have identity rest orientation (like every bone) and are appended to `BONE_NAMES` **after** the hair
bones, so no existing index moved. Everything below looks right at rest if left unanimated. `ADDED_BONES` (exported)
lists them. Mirror rule for L/R pairs: rotations about local X keep their sign, rotations about Y and Z flip sign.

| bone | parent | rest (kid space) | purpose | suggested motion |
|---|---|---|---|---|
| `tank` | chest | (0, 0.848, −0.176) = tank centre | backpack: caps, collars, rails, bolts, back plate, gauge, valve + the back ends of the shoulder straps are skinned to it; character.js re-parents the glass/fill group to it | spring sway/bounce, small angles (≤ 0.12 rad) |
| `hemF`, `hemB` | hips | (0, 0.712, ±0.082/−0.1) | bottom band of the tee (weight ramps in below y≈0.76, strongest at the hem centre front/back) | rotation.x flap ±0.25 with stride/accel; z sway |
| `jaw` | head | head centre + (0, −0.035, −0.035) (`JAW_PIVOT`, character-face.js) | lower face below the lip line: lower lip + inner lip, lower half of the mouth cavity, lower teeth, tongue, chin (FACE rework). Weights are capped at 0.65 (`JAW_GAIN`): the head is so big that the lower lip sits ~19 cm from the pivot | rotation.x 0 … 0.35 × mouthOpen (as coded) opens the modelled mouth ≈ 3.5 cm at 0.3 rad (a wide booyah D); 0.1 ≈ a talking gap |
| `cheekL/R` | head | on the cheek puff, 2 cm inside | cheek puffs (max weight 0.55) | position.y +0.002…0.004 when smiling, small scale 1.0–1.06 |
| `earL/R` | head | ear root (az ±1.5) | pointed ears (weight ramps 0→1 over the first 20 % of the ear) | droop/perk: rotation.z ∓0.3 … ±0.2 (L: − droops), wiggle on hits/landing |
| `toeL/R` | foot | (±0.084, 0.028, 0.09) = ball of the foot | front 40 % of the sneaker (sole, upper, laces) | rotation.x −0.5 … 0 (toe stays planted while the heel lifts at push-off) |
| `hairTip0…7` | `hair{s}_2` | 86 % along each strand (per style, like the hair bones) | club-shaped tentacle tip (t > 0.84 of the strand) | extra spring stage after `hair{s}_2`; curl ±0.4 |
| `hand{L,R}_{thumb,index,middle,ring,pinky}{1,2}` | hand / previous joint | 1 = knuckle (MCP / thumb CMC), 2 = middle joint (PIP / thumb MCP) | articulated fingers + thumb with nails | see *Fingers* below |

### Fingers (important — different convention from a straight-finger rig)
- **Rest pose = power grip** around a Ø 2.8 cm handle (the weapons' grips are built around it: `HAND.hole` in
  character-geo.js, `GRIP_HOLE_L/R` / `FIST_OFFSET` in character-weapons.js). Unanimated hands therefore hold every
  weapon correctly, and a free hand reads as a loose curl.
- Palms face the thighs at rest (thumb forward, +Z), so **finger curl is rotation about local Z**, not X. Left hand:
  `+z` opens / extends, `−z` closes; right hand: signs flipped. Values relative to rest:
  - open hand: fingers `…1` z = +0.9, `…2` z = +0.75; thumb `thumb1` x = +0.55 (swings it down beside the index), `thumb2` z = −0.5
  - relaxed (idle, free hand): fingers +0.45 / +0.35; `thumb1` x = +0.35, `thumb2` z = −0.25
  - tight fist (punch, fist-pump): fingers −0.35 / −0.5; `thumb1` (y −0.1, z +0.12), `thumb2` z = +0.3
  - holding any weapon grip / the bomb: 0 (rest)
- Names deliberately do **not** match character.js' generic `/^(finger|thumb|…)[LR]\d$/` curl (rotation.x, straight-finger
  assumption): applying that would bend these fingers sideways. To animate them, map your curl value `g` to
  `rotation.z = side * (rest − g)` with the values above (side = +1 for L, −1 for R).

### Not added (and why)
- `lidL/lidR` (re-evaluated): the lids ARE modelled now, but they are not bones. Each lid closes in the skin
  vertex shader by rotating its vertices about the eyeball's own horizontal axis *in eye space* (the eyeball is an
  ellipsoid = unit sphere under an affine map), with a per-vertex travel that is exactly "this column's lid edge → the
  closed line". A rigid bone rotation can't do that: it keeps one travel for the whole lid (the corners over-close) and
  linear-blend skinning with partial weights shrinks the lid into the ball. Drivers, no bone needed:
  - the eye bones' **Y scale** (character.js blink / wink / squint / gaze-follow, as coded) — the shaders read it from
    the bone texture: close = (1 − scaleY) / 0.93;
  - the per-kid uniform **`uLid`** (upper L, upper R, lower L, lower R, 0…1), combined with the bones by max().
  character.js' optional `xb.lidL/lidR` path therefore stays inert.

### Face helpers after the FACE rework
- `eyeL/eyeR` carry no geometry any more (the eyeballs are skinned to `head` and turned in the eye material by
  `uLook` / `uGaze`); their Y scale is the blink signal above. Rest positions unchanged.
- `mouth` / `mouthO` carry no geometry (the mouth is modelled and shaped by `uMouth` / `uMouth2` + `jaw`). FACE pass 2
  moved the mouth up (`MOUTH.el` −0.45 → −0.41), so these two helpers' rest positions are ~7 mm higher.
- `cheekL/R` weights now fade to 0 inside the eye patch (a cheek raise must not push the lower lid into the ball).
- `earL/R`: the rebuilt ears keep the old frame (root, axis, width profile — `earFrame(sx)` in character-face.js), so the
  punk hoops still pierce the rim.

### Proportion / rest-position notes
- Existing bone rest positions are unchanged. The face helpers (`eyeL/R`, `browL/R`, `mouth`, `mouthO`) are derived
  from the re-sculpted head surface and moved ≤ 3 mm; the brows now sit on the mask's top rim (`BROW.el` 0.49 → 0.455)
  so expressions read under the bangs.
- `FIST_OFFSET` (character-weapons.js) is now the right fist's grip-hole axis (0.0255, −0.0525, 0): twirls pivot on the
  handle. `inHand` / `handR` / `handL` keep their meaning.

### Props
- `getSubDef('bomb')` (character-weapons.js): hand-held splat bomb (`body` → plastic material, `ink` → team ink material),
  held by its knurled cap in the LEFT fist: parent a group to `handL` at `inHandL.pos/quat` (same maths as weapons).

## Added bones (log)
- `tank` · parent chest · at the tank centre (0, 0.848, -0.176) · the whole backpack (glass, caps, rails, plate, back
  ends of the straps) weighted to it · character.js bounces/sways it with springs (and re-parents the ink-fill/glass group to it).
- `hem` (or `hemF` + `hemB`) · parent spine/hips · bottom band of the tee · character.js flaps it with acceleration
  and stride (rotation.x/z springs); rest pose must look right unanimated.
- `jaw` (optional) · parent head · lower face/chin · character.js opens it with the mouth (rotation.x ≈ 0.35 × open).
- ✔ (see *Fingers* — rest = grip, curl axis local Z, names `hand{L,R}_*`) fingers (optional) named like `fingerL1`, `thumbR` · character.js curls rotation.x around grips (1.1 rad), relaxes
  when free; `lidL/lidR` (optional) close with blinks (rotation.x up to 1.2) — lids not added (see *Not added*).
- Already handled if they appear: toeL/toeR, lidL/lidR, jaw, tank, hem/hemF/hemB, finger*/thumb*.
