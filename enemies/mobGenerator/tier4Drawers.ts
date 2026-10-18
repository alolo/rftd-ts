import { drawRect as r, drawPixel as px, drawGroundShadow } from './palette';
import type { SpriteDirection } from '../types/mob';

/*
 * TIER 4 — INFERNAL VOID / NETHER ABYSS (mobs 31–40).
 * Standalone module: own palette, own helpers, own drawers. No dependency on
 * tier1BackDrawers / tier2Drawers / tier3Drawers — only the primitive canvas
 * helpers from ./palette.
 *
 * Contract: transparent 64x64 frame, 4 walk frames, three views
 * (front ↓ toward the player, side → to the right, back ↑ away).
 * Lowest opaque row is y=55 so every sprite stands on the ground line y=56.
 *
 * Detail escalation vs Tier 3: layered armor plates with rivets, glowing
 * cracks under the hide, ichor drips, chains, multi-eye clusters, exposed
 * ribcages, orbiting void debris and rune halos. Menace also escalates by
 * light: ember red → hellfire → sickly violet → white-hot void core.
 */

type Ctx = CanvasRenderingContext2D;
type Dir = SpriteDirection;
type Pt = [number, number];

export const T4 = {
  void: '#05040a',
  voidDeep: '#0c0714',
  obsidian: '#171122',
  hide: '#241a30',
  hideLight: '#3a2b48',
  ash: '#4b4257',
  ashLight: '#7a6f8c',
  bone: '#e7e0d4',
  boneShade: '#a99f8c',
  ember: '#7f1d1d',
  crimson: '#e11d48',
  crimsonBright: '#fb7185',
  hell: '#f97316',
  hellCore: '#fde047',
  magma: '#ffedd5',
  maw: '#150308',
  violet: '#6d28d9',
  violetBright: '#c084fc',
  ichor: '#4ade80',
  ichorDeep: '#14532d',
  gold: '#d4a017',
  goldBright: '#fde68a',
  white: '#f8fafc',
} as const;

/* ---------------------------------------------------------------- helpers */

function box(c: Ctx, x: number, y: number, w: number, h: number, fill: string, line: string = T4.void) {
  r(c, x, y, w, h, line);
  if (w > 2 && h > 2) r(c, x + 1, y + 1, w - 2, h - 2, fill);
}

/** Layered volume: outline, base, mid face, top highlight, right/bottom shade. */
function mass(c: Ctx, x: number, y: number, w: number, h: number, dark: string, mid: string, light: string) {
  box(c, x, y, w, h, mid);
  r(c, x + 1, y + 1, w - 2, 2, light);
  r(c, x + 1, y + h - 3, w - 2, 2, dark);
  if (h > 6) r(c, x + w - 3, y + 3, 2, h - 6, dark);
}

/** Riveted armor plate: plate body, inner bevel and four studs. */
function plate(c: Ctx, x: number, y: number, w: number, h: number, dark: string, mid: string, light: string, stud: string) {
  mass(c, x, y, w, h, dark, mid, light);
  px(c, x + 2, y + 2, stud);
  px(c, x + w - 3, y + 2, stud);
  px(c, x + 2, y + h - 3, stud);
  px(c, x + w - 3, y + h - 3, stud);
}

function spike(c: Ctx, x: number, baseY: number, w: number, h: number, color: string, tip?: string) {
  for (let i = 0; i < h; i++) {
    const ww = Math.max(1, Math.round(w * (1 - i / h)));
    r(c, x + Math.floor((w - ww) / 2), baseY - i, ww, 1, color);
  }
  if (tip) px(c, x + Math.floor(w / 2), baseY - h + 1, tip);
}

function spikeDown(c: Ctx, x: number, topY: number, w: number, h: number, color: string, tip?: string) {
  for (let i = 0; i < h; i++) {
    const ww = Math.max(1, Math.round(w * (1 - i / h)));
    r(c, x + Math.floor((w - ww) / 2), topY + i, ww, 1, color);
  }
  if (tip) px(c, x + Math.floor(w / 2), topY + h - 1, tip);
}

function spikeSide(c: Ctx, x: number, y: number, len: number, h: number, color: string, dirX: 1 | -1, tip?: string) {
  for (let i = 0; i < len; i++) {
    const hh = Math.max(1, Math.round(h * (1 - i / len)));
    r(c, x + i * dirX, y + Math.floor((h - hh) / 2), 1, hh, color);
  }
  if (tip) px(c, x + (len - 1) * dirX, y + Math.floor(h / 2), tip);
}

/** Zigzag needle teeth; `up` = fangs pointing down from an upper jaw. */
function teeth(c: Ctx, x: number, y: number, w: number, up: boolean, color: string) {
  for (let i = 0; i < w; i++) {
    const even = i % 2 === 0;
    const h = even ? 2 : 1;
    if (up) r(c, x + i, y, 1, h, color);
    else r(c, x + i, y + 1 - h, 1, h, color);
  }
}

/** Multi-layer glowing eye: socket, iris, pupil, flickering halo. */
function glowEye(c: Ctx, x: number, y: number, w: number, h: number, core: string, halo: string, f: number) {
  r(c, x - 1, y - 1, w + 2, h + 2, T4.void);
  r(c, x, y, w, h, core);
  px(c, x + Math.floor(w / 2), y + Math.floor(h / 2), T4.white);
  if (f % 2 === 0) {
    px(c, x - 2, y + 1, halo);
    px(c, x + w + 1, y + 1, halo);
    px(c, x + 1, y - 2, halo);
  } else {
    px(c, x - 2, y + h - 2, halo);
    px(c, x + w + 1, y + h - 2, halo);
  }
}

/** Symmetric horn pair swept outward from the crown. */
function hornPair(c: Ctx, cx: number, y: number, spread: number, h: number, col: string, tip: string) {
  for (const s of [-1, 1] as const) {
    const hx = cx + s * spread;
    for (let i = 0; i < h; i++) {
      const w = Math.max(1, 4 - Math.floor(i / 2));
      r(c, hx + Math.round((s * i) / 3) - Math.floor(w / 2), y - i, w, 1, i > h - 3 ? tip : col);
    }
  }
}

/** Row of dorsal spines. */
function spineSpikes(c: Ctx, xs: number[], y: number, h: number, col: string, tip: string) {
  xs.forEach((x, i) => spike(c, x, y, 3, h + (i % 2) * 2, col, tip));
}

/** Chain of alternating links between two points. */
function chainRun(c: Ctx, a: Pt, b: Pt, linkCol: string, pinCol: string) {
  const steps = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 3));
  for (let i = 0; i <= steps; i++) {
    const x = Math.round(a[0] + ((b[0] - a[0]) * i) / steps);
    const y = Math.round(a[1] + ((b[1] - a[1]) * i) / steps);
    r(c, x, y, 2, 2, i % 2 ? linkCol : pinCol);
  }
}

/** Glowing cracks that flicker every other frame. */
function cracks(c: Ctx, pts: Pt[], col: string, hot: string, f: number) {
  pts.forEach(([x, y], i) => {
    r(c, x, y, 1, 3, col);
    if ((i + f) % 2 === 0) px(c, x, y + 1, hot);
  });
}

/** Ichor dripping from a wound: drop falls further each frame. */
function drip(c: Ctx, x: number, y: number, f: number, col: string, tip: string) {
  r(c, x, y, 1, 2, col);
  const dy = f * 3;
  px(c, x, Math.min(55, y + 3 + dy), col);
  if (f >= 2) px(c, x, Math.min(55, y + 4 + dy), tip);
}

/** Debris / soul shards orbiting the figure, phase-shifted per frame. */
function debris(c: Ctx, f: number, pts: Pt[], col: string, hot: string) {
  pts.forEach(([x, y], i) => {
    const k = (i + f) % 4;
    const ox = k < 2 ? 1 : -1;
    const oy = k === 0 ? -2 : k === 2 ? 2 : 0;
    r(c, x + ox, y + oy, 2, 2, i % 2 ? col : hot);
    px(c, x + ox + 1, y + oy + 1, T4.void);
  });
}

/** Orbiting rune dashes forming a halo. */
function runeRing(c: Ctx, cx: number, cy: number, rx: number, ry: number, f: number, col: string) {
  for (let i = 0; i < 8; i++) {
    const a = (f * Math.PI) / 4 + (i * Math.PI) / 4;
    const x = Math.round(cx + Math.cos(a) * rx);
    const y = Math.round(cy + Math.sin(a) * ry);
    r(c, x, y, 2, 1, i % 3 === 0 ? T4.white : col);
  }
}

/** Bat-like membrane wing with bone fingers and a ragged trailing edge. */
function wing(c: Ctx, sx: number, sy: number, len: number, dy: number, boneCol: string, membrane: string, dirX: 1 | -1, fingers = 4) {
  for (let i = 0; i <= len; i++) {
    const x = sx + i * dirX;
    const y = sy + Math.round((dy * i) / len);
    const h = Math.max(2, Math.round(11 * Math.sin((Math.PI * i) / len)) + 3);
    r(c, x, y, 1, h, membrane);
    if (i % Math.max(2, Math.floor(len / fingers)) === 0) r(c, x, y, 1, h, boneCol);
    px(c, x, y, boneCol);
    if (i > len * 0.45 && i % 3 === 0) spikeDown(c, x, y + h, 2, 3, membrane);
  }
  px(c, sx + len * dirX, sy + dy - 1, T4.white);
}

/** Tapering void tendrils reaching down to the ground row y=55. */
function tendrils(c: Ctx, cx: number, topY: number, f: number, col: string, tip: string, count = 3) {
  for (let i = 0; i < count; i++) {
    const off = (i - Math.floor(count / 2)) * 5;
    const sway = [-2, 0, 2, 0][(f + i) % 4];
    for (let y = topY; y <= 55; y++) {
      const t = (y - topY) / Math.max(1, 55 - topY);
      const w = Math.max(1, Math.round(4 * (1 - t)));
      r(c, cx + off + Math.round(sway * t) - Math.floor(w / 2), y, w, 1, y % 2 ? col : T4.voidDeep);
    }
    px(c, cx + off + sway, 55, tip);
  }
}

function shadowG(c: Ctx, rx: number, alpha: number) {
  drawGroundShadow(c, 32, rx, 3, 56, alpha);
}

/* Front/back gait: heavier stomp than Tier 3, ember puff on contact. */
const LIFT_FB: Pt[] = [[5, 0], [2, 0], [0, 5], [0, 2]];
function legsFB(
  c: Ctx, f: number, cx: number, hip: number, gap: number, w: number,
  leg: string, shade: string, boot: string, back: boolean, puff?: string,
) {
  const [ll, rl] = LIFT_FB[f];
  const feet: Pt[] = [[cx - gap - w, ll], [cx + gap, rl]];
  for (const [x, lift] of feet) {
    const bottom = 55 - lift;
    r(c, x, hip, w, Math.max(1, bottom - hip - 3), leg);
    r(c, x + w - 2, hip + 1, 2, Math.max(1, bottom - hip - 4), shade);
    box(c, x - 1, bottom - 3, w + 2, 4, boot);
    px(c, x - 2, bottom - 2, shade);
    px(c, x + w + 1, bottom - 2, shade);
    if (lift > 0 && back) r(c, x, bottom - 1, w, 1, T4.void);
    if (lift === 0 && puff) {
      px(c, x - 3, 55, puff);
      px(c, x + w + 2, 55, puff);
    }
  }
}

/* Side stride facing right. */
const STRIDE: Array<[number, number, number, number]> = [
  [6, 0, -6, 4],
  [0, 0, 3, 7],
  [-6, 4, 6, 0],
  [3, 7, 0, 0],
];
function legsSide(
  c: Ctx, f: number, hipX: number, hip: number, w: number,
  near: string, far: string, nearBoot: string, farBoot: string, puff?: string,
) {
  const [nd, nl, fd, fl] = STRIDE[f];
  const leg = (dx: number, lift: number, col: string, bootCol: string) => {
    const bottom = 55 - lift;
    const knee = hip + Math.floor((bottom - hip) / 2);
    r(c, hipX + Math.round(dx / 2), hip, w, knee - hip + 1, col);
    r(c, hipX + dx, knee, w, Math.max(1, bottom - knee - 3), col);
    box(c, hipX + dx - 1, bottom - 3, w + 3, 4, bootCol);
    px(c, hipX + dx - 2, bottom - 2, T4.void);
    if (lift === 0 && puff) {
      px(c, hipX + dx - 3, 55, puff);
      px(c, hipX + dx + w + 2, 55, puff);
    }
  };
  leg(fd, fl, far, farBoot);
  leg(nd, nl, near, nearBoot);
}

/* ========================================================= 31 Void Imp */
function voidImp(c: Ctx, f: number, d: Dir) {
  const bob = f % 2 ? -1 : 0;
  const grin = f >= 2 ? 3 : 2;
  shadowG(c, 12, 0.4);
  // Teleport residue: torn void streaks left behind on the running frames.
  if (f === 1 || f === 3) {
    for (let i = 0; i < 3; i++) r(c, 8 - i * 2, 30 + i * 6 + bob, 1, 5, i % 2 ? T4.violet : T4.hideLight);
  }

  if (d === 'side') {
    // Barbed tail curling up behind.
    const tw = [0, -2, -3, -1][f];
    r(c, 17, 41 + bob, 5, 3, T4.hide);
    r(c, 13, 40 + bob + tw, 5, 3, T4.hide);
    r(c, 10, 37 + bob + tw, 4, 3, T4.hideLight);
    r(c, 11, 33 + bob + tw, 3, 4, T4.hideLight);
    spike(c, 10, 33 + bob + tw, 4, 4, T4.ash, T4.crimson);
    legsSide(c, f, 28, 44, 4, T4.hide, T4.obsidian, T4.ash, T4.void, T4.ember);
    mass(c, 20, 30 + bob, 16, 15, T4.obsidian, T4.hide, T4.hideLight);
    cracks(c, [[23, 33 + bob], [28, 37 + bob], [25, 41 + bob]], T4.ember, T4.hell, f);
    // Oversized head, swept horns, needle grin.
    mass(c, 29, 17 + bob, 17, 15, T4.obsidian, T4.hide, T4.hideLight);
    hornPair(c, 33, 18 + bob, 3, 6, T4.ash, T4.bone);
    box(c, 43, 23 + bob, 8, 6, T4.hideLight);
    r(c, 43, 25 + bob, 8, grin, T4.void);
    teeth(c, 43, 25 + bob, 8, true, T4.bone);
    teeth(c, 43, 25 + grin - 1 + bob, 8, false, T4.boneShade);
    glowEye(c, 39, 21 + bob, 3, 3, T4.crimson, T4.crimsonBright, f);
    // Long arm with hooked claws and a stolen void shard.
    r(c, 34, 33 + bob, 3, 9, T4.hide);
    r(c, 36, 41 + bob, 4, 2, T4.ash);
    spikeSide(c, 40, 40 + bob, 4, 3, T4.bone, 1, T4.white);
    spike(c, 42, 44 + bob, 5, 7, T4.violet, T4.violetBright);
    debris(c, f, [[14, 22], [50, 18], [46, 48]], T4.violet, T4.crimson);
    return;
  }

  const back = d === 'back';
  legsFB(c, f, 32, 44, 3, 4, T4.hide, T4.obsidian, T4.ash, back, T4.ember);
  if (!back) {
    const tw = [0, 2, 3, 1][f];
    r(c, 40 + tw, 40 + bob, 4, 3, T4.hide);
    r(c, 44 + tw, 38 + bob, 4, 3, T4.hideLight);
    spike(c, 46 + tw, 38 + bob, 4, 4, T4.ash, T4.crimson);
  }
  mass(c, 22, 29 + bob, 20, 16, T4.obsidian, T4.hide, T4.hideLight);
  cracks(c, [[25, 32 + bob], [30, 36 + bob], [36, 33 + bob], [33, 40 + bob]], T4.ember, T4.hell, f);
  mass(c, 23, 15 + bob, 18, 15, T4.obsidian, T4.hide, T4.hideLight);
  hornPair(c, 32, 16 + bob, 6, 7, T4.ash, T4.bone);
  if (!back) {
    // Two eyes and a grin that splits the whole face.
    glowEye(c, 26, 19 + bob, 3, 3, T4.crimson, T4.crimsonBright, f);
    glowEye(c, 35, 19 + bob, 3, 3, T4.crimson, T4.crimsonBright, f);
    r(c, 25, 25 + bob, 14, grin, T4.void);
    teeth(c, 25, 25 + bob, 14, true, T4.bone);
    teeth(c, 25, 25 + grin - 1 + bob, 14, false, T4.boneShade);
    px(c, 31, 23 + bob, T4.ash);
    // Claws held low, shard glowing between them.
    r(c, 16, 33 + bob, 4, 9, T4.hide);
    r(c, 44, 33 + bob, 4, 9, T4.hide);
    spikeSide(c, 13, 42 + bob, 4, 3, T4.bone, -1, T4.white);
    spikeSide(c, 47, 42 + bob, 4, 3, T4.bone, 1, T4.white);
    spike(c, 46, 46 + bob, 5, 6, T4.violet, T4.violetBright);
  } else {
    // Hunched spine, shoulder blades, tail curling over the back.
    spineSpikes(c, [26, 30, 34, 38], 30 + bob, 4, T4.ash, T4.crimson);
    r(c, 31, 30 + bob, 2, 14, T4.obsidian);
    const tw = [-3, 0, 3, 0][f];
    r(c, 30 + tw, 20 + bob, 4, 12, T4.hide);
    spike(c, 29 + tw, 20 + bob, 5, 5, T4.ash, T4.crimson);
    r(c, 24, 34 + bob, 4, 8, T4.hide);
    r(c, 36, 34 + bob, 4, 8, T4.hide);
  }
  debris(c, f, [[12, 24], [50, 20], [48, 46], [14, 46]], T4.violet, T4.crimson);
}

/* ================================================== 32 Nether Stalker */
function stalker(c: Ctx, f: number, d: Dir) {
  const bob = f % 2 ? -1 : 0;
  const crouch = f === 1 || f === 3 ? 1 : 0;
  shadowG(c, 14, 0.42);
  // Cloak shreds drift on the ground row so the silhouette stays anchored.
  const shred = [-2, 0, 2, 0][f];
  for (let i = 0; i < 5; i++) spikeDown(c, 19 + i * 6 + shred, 44 + bob + crouch, 4, 11 - (i % 2) * 3, i % 2 ? T4.voidDeep : T4.obsidian, T4.violet);

  if (d === 'side') {
    legsSide(c, f, 28, 42 + crouch, 4, T4.obsidian, T4.voidDeep, T4.hide, T4.void, T4.violet);
    mass(c, 20, 24 + bob + crouch, 18, 21, T4.voidDeep, T4.obsidian, T4.hide);
    cracks(c, [[23, 28 + bob], [28, 34 + bob], [24, 39 + bob]], T4.violet, T4.violetBright, f);
    // Hooded skull mask turned toward the right, four eyes in two pairs.
    mass(c, 30, 12 + bob + crouch, 16, 15, T4.voidDeep, T4.obsidian, T4.hide);
    spikeSide(c, 45, 18 + bob + crouch, 6, 5, T4.bone, 1, T4.boneShade);
    box(c, 34, 15 + bob + crouch, 11, 9, T4.bone);
    glowEye(c, 36, 17 + bob + crouch, 2, 2, T4.violetBright, T4.violet, f);
    glowEye(c, 41, 17 + bob + crouch, 2, 2, T4.violetBright, T4.violet, f);
    glowEye(c, 37, 21 + bob + crouch, 2, 2, T4.crimson, T4.crimsonBright, f);
    glowEye(c, 42, 21 + bob + crouch, 2, 2, T4.crimson, T4.crimsonBright, f);
    teeth(c, 35, 23 + bob + crouch, 9, false, T4.boneShade);
    // Twin hooked claws swept back, ready to strike.
    const clawY = f < 2 ? 30 : 34;
    r(c, 36, clawY + bob + crouch, 3, 8, T4.obsidian);
    spikeSide(c, 39, clawY + 6 + bob + crouch, 8, 3, T4.bone, 1, T4.white);
    spikeSide(c, 39, clawY + 9 + bob + crouch, 6, 3, T4.boneShade, 1, T4.white);
    r(c, 21, clawY + 2 + bob + crouch, 3, 7, T4.voidDeep);
    // Invisibility shimmer: bands of the body vanish and return.
    if (f === 1 || f === 3) {
      for (let i = 0; i < 4; i++) r(c, 22 + i * 5, 26 + bob + i * 4, 3, 1, T4.violetBright);
    }
    debris(c, f, [[14, 20], [52, 26], [50, 48]], T4.violet, T4.violetBright);
    return;
  }

  const back = d === 'back';
  legsFB(c, f, 32, 42 + crouch, 3, 4, T4.obsidian, T4.voidDeep, T4.hide, back, T4.violet);
  mass(c, 21, 23 + bob + crouch, 22, 22, T4.voidDeep, T4.obsidian, T4.hide);
  if (!back) {
    box(c, 24, 13 + bob + crouch, 16, 14, T4.bone);
    r(c, 25, 14 + bob + crouch, 14, 3, T4.boneShade);
    glowEye(c, 26, 18 + bob + crouch, 2, 2, T4.violetBright, T4.violet, f);
    glowEye(c, 31, 18 + bob + crouch, 2, 2, T4.violetBright, T4.violet, f);
    glowEye(c, 27, 22 + bob + crouch, 2, 2, T4.crimson, T4.crimsonBright, f);
    glowEye(c, 34, 22 + bob + crouch, 2, 2, T4.crimson, T4.crimsonBright, f);
    r(c, 26, 25 + bob + crouch, 12, 2, T4.void);
    teeth(c, 26, 25 + bob + crouch, 12, true, T4.bone);
    // Crossed dagger blades strapped over the chest.
    chainRun(c, [24, 30 + bob + crouch], [40, 40 + bob + crouch], T4.ash, T4.boneShade);
    spikeSide(c, 40, 32 + bob + crouch, 6, 3, T4.bone, -1, T4.white);
  } else {
    // Hood peak, cloak seam and two sheathed blades on the back.
    spike(c, 28, 15 + bob + crouch, 8, 8, T4.obsidian, T4.hide);
    r(c, 31, 17 + bob + crouch, 2, 26, T4.voidDeep);
    spikeSide(c, 24, 26 + bob + crouch, 7, 3, T4.boneShade, -1, T4.bone);
    spikeSide(c, 40, 30 + bob + crouch, 7, 3, T4.boneShade, 1, T4.bone);
    cracks(c, [[25, 34 + bob], [38, 36 + bob], [31, 41 + bob]], T4.violet, T4.violetBright, f);
  }
  // Clawed hands at both sides.
  const clawY = f < 2 ? 32 : 36;
  r(c, 15, clawY + bob + crouch, 4, 8, T4.obsidian);
  r(c, 45, clawY + bob + crouch, 4, 8, T4.obsidian);
  spikeSide(c, 11, clawY + 7 + bob + crouch, 4, 3, T4.bone, -1, T4.white);
  spikeSide(c, 49, clawY + 7 + bob + crouch, 4, 3, T4.bone, 1, T4.white);
  debris(c, f, [[12, 22], [52, 22], [10, 48], [54, 48]], T4.violet, T4.violetBright);
}

/* ==================================================== 33 Chaos Hound */
function hound(c: Ctx, f: number, d: Dir) {
  const bob = f % 2 ? -1 : 0;
  const snap = f % 2; // jaws snap shut on odd frames
  shadowG(c, 22, 0.45);

  if (d === 'side') {
    // Two heads: the rear one lower and turned back, the lead one snapping.
    const hy = 14 + bob;
    mass(c, 40, hy, 15, 12, T4.voidDeep, T4.obsidian, T4.hide);
    box(c, 53, hy + 4, 9, 6, T4.hideLight);
    r(c, 53, hy + 6, 9, 2 + snap, T4.void);
    teeth(c, 53, hy + 6, 9, true, T4.bone);
    teeth(c, 53, hy + 7 + snap, 9, false, T4.boneShade);
    glowEye(c, 48, hy + 2, 3, 2, T4.hell, T4.hellCore, f);
    spike(c, 41, hy, 3, 5, T4.ash, T4.bone);
    spike(c, 45, hy - 1, 3, 4, T4.ash, T4.bone);
    mass(c, 22, hy + 5, 13, 10, T4.voidDeep, T4.obsidian, T4.hide);
    box(c, 14, hy + 8, 9, 5, T4.hideLight);
    r(c, 14, hy + 10, 9, 2 + (1 - snap), T4.void);
    teeth(c, 14, hy + 10, 9, true, T4.bone);
    glowEye(c, 24, hy + 7, 2, 2, T4.hellCore, T4.hell, f);
    legsSide(c, (f + 2) % 4, 18, 40, 4, T4.hide, T4.obsidian, T4.ash, T4.void, T4.ember);
    legsSide(c, f, 40, 40, 4, T4.hide, T4.obsidian, T4.ash, T4.void, T4.ember);
    // Ribcage burst open through the flank.
    mass(c, 14, 27 + bob, 32, 15, T4.voidDeep, T4.obsidian, T4.hide);
    // Mottled hide: darker patches and ember veins across the flank.
    for (let i = 0; i < 6; i++) {
      r(c, 16 + i * 5, 30 + bob + (i % 3), 3, 2, T4.voidDeep);
      px(c, 17 + i * 5, 34 + bob + (i % 2), i % 2 ? T4.ember : T4.hideLight);
    }
    for (let i = 0; i < 5; i++) {
      r(c, 18 + i * 5, 29 + bob, 2, 9 - (i % 2), T4.bone);
      px(c, 18 + i * 5, 28 + bob, T4.boneShade);
      px(c, 18 + i * 5, 37 + bob - (i % 2), T4.boneShade);
    }
    r(c, 20, 38 + bob, 22, 2, T4.ember);
    r(c, 21, 39 + bob, 20, 1, f % 2 ? T4.hellCore : T4.hell);
    // Haunch muscle plates over both hind and front legs.
    plate(c, 14, 31 + bob, 8, 8, T4.voidDeep, T4.obsidian, T4.hideLight, T4.crimson);
    plate(c, 38, 31 + bob, 8, 8, T4.voidDeep, T4.obsidian, T4.hideLight, T4.crimson);
    // Bone collar where the two necks meet.
    chainRun(c, [24, 26 + bob], [40, 24 + bob], T4.boneShade, T4.bone);
    spineSpikes(c, [16, 21, 26, 31, 36, 41], 27 + bob, 5, T4.ash, T4.crimson);
    const tw = [0, 2, 3, 1][f];
    r(c, 8, 33 + bob + tw, 7, 3, T4.hide);
    spike(c, 4, 33 + bob + tw, 5, 5, T4.ash, T4.crimson);
    // Ichor dripping from the open chest.
    drip(c, 26, 41 + bob, f, T4.ichorDeep, T4.ichor);
    drip(c, 34, 41 + bob, f, T4.ember, T4.hell);
    return;
  }

  const back = d === 'back';
  legsFB(c, (f + 2) % 4, 32, 40, 9, 6, T4.hide, T4.obsidian, T4.ash, back, T4.ember);
  legsFB(c, f, 32, 42, 4, 6, T4.hide, T4.obsidian, T4.ash, back, T4.ember);
  mass(c, 12, 24 + bob, 40, 20, T4.voidDeep, T4.obsidian, T4.hide);
  spineSpikes(c, [15, 21, 27, 33, 39, 45], 24 + bob, 7, T4.ash, T4.crimson);
  // Shoulder haunches and a bone collar across the withers.
  plate(c, 13, 27 + bob, 10, 10, T4.voidDeep, T4.obsidian, T4.hideLight, T4.crimson);
  plate(c, 41, 27 + bob, 10, 10, T4.voidDeep, T4.obsidian, T4.hideLight, T4.crimson);
  chainRun(c, [18, 25 + bob], [46, 25 + bob], T4.boneShade, T4.bone);
  if (!back) {
    // Exposed ribs and a burning heart on the chest.
    for (let i = 0; i < 4; i++) r(c, 20 + i * 6, 28 + bob, 3, 11, T4.bone);
    box(c, 28, 30 + bob, 8, 8, T4.ember);
    r(c, 30, 32 + bob, 4, 4, f % 2 ? T4.hell : T4.hellCore);
    px(c, 31, 33 + bob, T4.magma);
    drip(c, 22, 42 + bob, f, T4.ichorDeep, T4.ichor);
    drip(c, 42, 42 + bob, f, T4.ember, T4.hell);
    // Twin heads side by side, both snapping at the player.
    const hy = 11 + bob;
    mass(c, 15, hy, 15, 14, T4.voidDeep, T4.obsidian, T4.hide);
    mass(c, 33, hy, 15, 14, T4.voidDeep, T4.obsidian, T4.hide);
    box(c, 17, hy + 8, 11, 5, T4.hideLight);
    box(c, 35, hy + 8, 11, 5, T4.hideLight);
    r(c, 17, hy + 9, 11, 2 + snap, T4.void);
    r(c, 35, hy + 9, 11, 2 + snap, T4.void);
    teeth(c, 17, hy + 9, 11, true, T4.bone);
    teeth(c, 35, hy + 9, 11, true, T4.bone);
    teeth(c, 17, hy + 10 + snap, 11, false, T4.boneShade);
    teeth(c, 35, hy + 10 + snap, 11, false, T4.boneShade);
    glowEye(c, 18, hy + 3, 3, 3, T4.hell, T4.hellCore, f);
    glowEye(c, 25, hy + 3, 3, 3, T4.hell, T4.hellCore, f);
    glowEye(c, 36, hy + 3, 3, 3, T4.hellCore, T4.hell, f);
    glowEye(c, 43, hy + 3, 3, 3, T4.hellCore, T4.hell, f);
    spike(c, 16, hy, 3, 5, T4.ash, T4.bone);
    spike(c, 27, hy, 3, 5, T4.ash, T4.bone);
    spike(c, 34, hy, 3, 5, T4.ash, T4.bone);
    spike(c, 45, hy, 3, 5, T4.ash, T4.bone);
  } else {
    // Twin skulls from behind, nuchal crests, tails whipping apart.
    const hy = 12 + bob;
    mass(c, 16, hy, 14, 13, T4.voidDeep, T4.obsidian, T4.hide);
    mass(c, 34, hy, 14, 13, T4.voidDeep, T4.obsidian, T4.hide);
    r(c, 22, hy + 2, 2, 9, T4.ash);
    r(c, 40, hy + 2, 2, 9, T4.ash);
    spike(c, 17, hy, 4, 6, T4.ash, T4.bone);
    spike(c, 44, hy, 4, 6, T4.ash, T4.bone);
    cracks(c, [[20, 30 + bob], [30, 34 + bob], [40, 31 + bob], [26, 39 + bob]], T4.ember, T4.hell, f);
    const tw = [-3, 0, 3, 0][f];
    r(c, 8 + tw, 34 + bob, 7, 3, T4.hide);
    spike(c, 5 + tw, 34 + bob, 5, 5, T4.ash, T4.crimson);
    r(c, 49 - tw, 34 + bob, 7, 3, T4.hide);
    spike(c, 54 - tw, 34 + bob, 5, 5, T4.ash, T4.crimson);
  }
  debris(c, f, [[8, 20], [56, 20], [6, 46], [58, 46]], T4.ember, T4.hell);
}

/* ================================================ 34 Infernal Knight */
function knight(c: Ctx, f: number, d: Dir) {
  const bob = f % 2 ? -1 : 0;
  shadowG(c, 18, 0.5);
  // Burning cape / cloak trailing behind, torn at the hem.
  const cape = [-3, -1, 1, 3][f];

  if (d === 'side') {
    wing(c, 24, 26 + bob, 14, cape * 2, T4.ember, T4.obsidian, -1, 3);
    legsSide(c, f, 28, 42, 6, T4.hide, T4.voidDeep, T4.ash, T4.void, T4.hell);
    plate(c, 19, 22 + bob, 20, 22, T4.voidDeep, T4.obsidian, T4.hide, T4.gold);
    r(c, 22, 30 + bob, 14, 1, T4.hell);
    r(c, 24, 35 + bob, 10, 1, T4.ember);
    // Horned helm in profile, visor slit burning.
    plate(c, 34, 9 + bob, 14, 15, T4.voidDeep, T4.obsidian, T4.hide, T4.gold);
    r(c, 40, 15 + bob, 8, 2, T4.void);
    r(c, 41, 15 + bob, 6, 2, f % 2 ? T4.hell : T4.hellCore);
    hornPair(c, 38, 10 + bob, 5, 8, T4.ash, T4.bone);
    // Skull pauldron with eye sockets.
    plate(c, 28, 20 + bob, 12, 10, T4.voidDeep, T4.obsidian, T4.hideLight, T4.gold);
    box(c, 31, 22 + bob, 6, 5, T4.bone);
    px(c, 32, 24 + bob, T4.void);
    px(c, 35, 24 + bob, T4.void);
    // Flaming greatsword swept forward.
    const swY = f < 2 ? 6 : 12;
    r(c, 46, swY + 12 + bob, 3, 22, T4.ash);
    box(c, 43, swY + 32 + bob, 9, 4, T4.gold);
    r(c, 47, swY + 2 + bob, 4, 30, T4.ember);
    r(c, 48, swY + 3 + bob, 2, 28, f % 2 ? T4.hell : T4.hellCore);
    px(c, 48, swY + bob, T4.magma);
    for (let i = 0; i < 5; i++) px(c, 45 + (i % 3), swY + 4 + i * 5 + bob, T4.hellCore);
    debris(c, f, [[52, 20], [56, 34], [44, 46]], T4.hell, T4.hellCore);
    return;
  }

  const back = d === 'back';
  if (!back) wing(c, 22, 25 + bob, 12, cape * 2, T4.ember, T4.obsidian, -1, 3);
  else wing(c, 42, 25 + bob, 12, cape * 2, T4.ember, T4.obsidian, 1, 3);
  legsFB(c, f, 32, 42, 4, 6, T4.hide, T4.voidDeep, T4.ash, back, T4.hell);
  plate(c, 18, 21 + bob, 28, 23, T4.voidDeep, T4.obsidian, T4.hide, T4.gold);
  if (!back) {
    // Cuirass seams glow; a skull is set into the breastplate.
    r(c, 31, 22 + bob, 2, 21, T4.voidDeep);
    r(c, 22, 28 + bob, 20, 1, f % 2 ? T4.hell : T4.ember);
    r(c, 22, 36 + bob, 20, 1, T4.ember);
    box(c, 27, 29 + bob, 10, 9, T4.bone);
    px(c, 29, 32 + bob, T4.void);
    px(c, 33, 32 + bob, T4.void);
    r(c, 30, 35 + bob, 4, 2, T4.boneShade);
    // Tassets over the thighs.
    for (let i = 0; i < 4; i++) plate(c, 19 + i * 7, 43 + bob, 6, 5, T4.voidDeep, T4.obsidian, T4.hideLight, T4.gold);
  } else {
    // Back plate with burning rune column and chains across the shoulders.
    r(c, 31, 22 + bob, 2, 21, T4.voidDeep);
    for (let y = 25; y < 42; y += 5) r(c, 27, y + bob, 10, 2, f % 2 ? T4.hell : T4.ember);
    chainRun(c, [19, 24 + bob], [45, 30 + bob], T4.ash, T4.gold);
    cracks(c, [[23, 33 + bob], [40, 35 + bob], [30, 40 + bob]], T4.ember, T4.hellCore, f);
  }
  // Skull pauldrons on both shoulders.
  for (const sx of [10, 44]) {
    plate(c, sx, 18 + bob, 12, 11, T4.voidDeep, T4.obsidian, T4.hideLight, T4.gold);
    box(c, sx + 3, 21 + bob, 6, 5, T4.bone);
    px(c, sx + 4, 23 + bob, T4.void);
    px(c, sx + 7, 23 + bob, T4.void);
    spike(c, sx + 1, 19 + bob, 3, 5, T4.ash, T4.bone);
    spike(c, sx + 8, 19 + bob, 3, 5, T4.ash, T4.bone);
  }
  // Helm with crown of horns; face only from the front.
  plate(c, 25, 6 + bob, 14, 15, T4.voidDeep, T4.obsidian, T4.hide, T4.gold);
  hornPair(c, 32, 7 + bob, 7, 9, T4.ash, T4.bone);
  spike(c, 30, 8 + bob, 4, 4, T4.gold, T4.goldBright);
  if (!back) {
    r(c, 27, 13 + bob, 10, 2, T4.void);
    r(c, 28, 13 + bob, 8, 2, f % 2 ? T4.hell : T4.hellCore);
    r(c, 31, 15 + bob, 2, 5, T4.void);
    teeth(c, 28, 18 + bob, 8, false, T4.boneShade);
  } else {
    r(c, 31, 9 + bob, 2, 11, T4.ash);
  }
  // Greatsword: held forward on the front view, resting on the back view.
  const swY = f < 2 ? 4 : 9;
  if (!back) {
    r(c, 52, swY + 10 + bob, 3, 26, T4.ash);
    box(c, 48, swY + 34 + bob, 11, 4, T4.gold);
    r(c, 52, swY + bob, 5, 34, T4.ember);
    r(c, 53, swY + 1 + bob, 3, 32, f % 2 ? T4.hell : T4.hellCore);
    px(c, 54, swY + bob, T4.magma);
  } else {
    r(c, 8, swY + 14 + bob, 3, 24, T4.ash);
    r(c, 7, swY + 4 + bob, 5, 30, T4.ember);
    r(c, 8, swY + 5 + bob, 3, 28, f % 2 ? T4.hell : T4.hellCore);
  }
  debris(c, f, [[6, 16], [58, 16], [10, 48], [54, 48]], T4.hell, T4.hellCore);
}

/* ================================================ 35 Beholder of Abyss */
function beholder(c: Ctx, f: number, d: Dir) {
  const bob = [0, -2, -3, -1][f];
  const cy = 28 + bob;
  shadowG(c, 18, 0.4);
  // Eight eyestalks waving out of phase around the main body.
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 + (f * Math.PI) / 8;
    const ex = Math.round(32 + Math.cos(a) * 24);
    const ey = Math.round(cy - 4 + Math.sin(a) * 17);
    const mx = Math.round(32 + Math.cos(a) * 11);
    const my = Math.round(cy - 2 + Math.sin(a) * 8);
    // Stalk drawn as a thick two-pixel cable with a knuckle joint.
    r(c, Math.min(mx, ex), Math.min(my, ey), Math.max(3, Math.abs(ex - mx)), 3, T4.hide);
    r(c, Math.min(mx, ex), Math.min(my, ey) + 1, Math.max(3, Math.abs(ex - mx)), 1, T4.voidDeep);
    r(c, ex - 1, ey - 1, 3, Math.max(3, Math.abs(ey - my)), T4.hideLight);
    box(c, ex - 3, ey - 3, 7, 7, T4.hide);
    r(c, ex - 2, ey - 2, 5, 1, T4.hideLight);
    glowEye(c, ex - 1, ey - 1, 3, 3, i % 2 ? T4.violetBright : T4.crimson, T4.violet, f + i);
  }
  // Main sphere: layered shell, plates and a fanged maw underneath.
  mass(c, 16, cy - 13, 32, 27, T4.voidDeep, T4.obsidian, T4.hide);
  r(c, 18, cy - 11, 28, 2, T4.hideLight);
  r(c, 18, cy + 10, 28, 2, T4.voidDeep);
  // Two belts of riveted plates wrapping the sphere.
  for (let i = 0; i < 4; i++) plate(c, 20 + i * 6, cy - 8, 6, 6, T4.voidDeep, T4.obsidian, T4.hideLight, T4.violet);
  for (let i = 0; i < 4; i++) plate(c, 20 + i * 6, cy + 2, 6, 6, T4.voidDeep, T4.obsidian, T4.hideLight, T4.crimson);
  // Chitinous texture between the belts and a rim of shell notches.
  for (let i = 0; i < 7; i++) px(c, 20 + i * 4, cy - 1, i % 2 ? T4.hideLight : T4.violet);
  for (let i = 0; i < 6; i++) spikeDown(c, 19 + i * 5, cy + 10, 3, 2, T4.ash, T4.violetBright);
  cracks(c, [[21, cy + 4], [27, cy + 8], [36, cy + 7], [42, cy + 3], [24, cy - 3], [39, cy - 4]], T4.violet, T4.violetBright, f);

  if (d === 'front') {
    // Giant central eye with a slit pupil and a lid that blinks on frame 2.
    box(c, 20, cy - 10, 24, 19, T4.void);
    r(c, 22, cy - 8, 20, 15, T4.violet);
    r(c, 24, cy - 6, 16, 11, T4.violetBright);
    r(c, 31, cy - 8, 2, 15, T4.void);
    px(c, 31, cy - 1, T4.white);
    for (let i = 0; i < 5; i++) px(c, 23 + i * 4, cy + 5, T4.violet);
    if (f === 2) r(c, 22, cy - 8, 20, 6, T4.obsidian);
    // Maw below the eye: gums, three rows of fangs, dripping ichor.
    box(c, 22, cy + 9, 20, 10, T4.void);
    r(c, 23, cy + 10, 18, 8, T4.ember);
    teeth(c, 23, cy + 10, 18, true, T4.bone);
    teeth(c, 23, cy + 16, 18, false, T4.bone);
    teeth(c, 25, cy + 13, 14, true, T4.boneShade);
    drip(c, 28, cy + 16, f, T4.ichorDeep, T4.ichor);
    drip(c, 36, cy + 16, f, T4.ichorDeep, T4.ichor);
  } else if (d === 'back') {
    // Blind armored rear: plates, spikes and a sealed rune seam.
    for (let i = 0; i < 6; i++) plate(c, 18 + i * 5, cy - 10, 5, 20, T4.voidDeep, T4.obsidian, T4.hideLight, T4.violet);
    for (let i = 0; i < 6; i++) plate(c, 18 + i * 5, cy + 6, 5, 6, T4.voidDeep, T4.obsidian, T4.hideLight, T4.crimson);
    spineSpikes(c, [20, 26, 32, 38, 44], cy - 12, 6, T4.ash, T4.violetBright);
    r(c, 31, cy - 10, 2, 22, T4.violet);
    px(c, 31, cy - 2, f % 2 ? T4.white : T4.violetBright);
    px(c, 31, cy + 4, f % 2 ? T4.crimsonBright : T4.white);
    runeRing(c, 32, cy - 2, 26, 12, f, T4.violet);
  } else {
    // Profile: eye bulges to the right, maw gapes forward.
    box(c, 30, cy - 9, 14, 14, T4.void);
    r(c, 32, cy - 7, 10, 10, T4.violet);
    r(c, 34, cy - 5, 6, 6, T4.violetBright);
    r(c, 38, cy - 7, 2, 10, T4.void);
    px(c, 38, cy - 2, T4.white);
    box(c, 38, cy + 6, 12, 7, T4.void);
    r(c, 39, cy + 7, 10, 5, T4.ember);
    teeth(c, 39, cy + 7, 10, true, T4.bone);
    teeth(c, 39, cy + 11, 10, false, T4.bone);
    spikeSide(c, 48, cy + 4, 5, 3, T4.bone, 1, T4.white);
  }
  // Tendrils hanging to the ground keep the float anchored at y=55.
  tendrils(c, 32, cy + 16, f, T4.hide, T4.violetBright, 5);
  // Ichor falling from the maw and a rune ring around the shell.
  drip(c, 30, cy + 17, f, T4.ichorDeep, T4.ichor);
  drip(c, 36, cy + 17, f, T4.ichorDeep, T4.ichor);
  runeRing(c, 32, cy, 25, 13, f, T4.violet);
  debris(c, f, [[10, 14], [54, 12], [8, 44], [56, 42], [32, 8]], T4.violet, T4.violetBright);
}

/* ============================================ 36 Abyssal Juggernaut */
function juggernaut(c: Ctx, f: number, d: Dir) {
  const bob = f % 2 ? -1 : 0;
  const stomp = f === 0 || f === 2;
  shadowG(c, 26, 0.56);

  if (d === 'side') {
    legsSide(c, f, 24, 40, 8, T4.hide, T4.obsidian, T4.ash, T4.void, stomp ? T4.hell : undefined);
    // Battering-ram shoulder spikes aimed forward.
    mass(c, 12, 16 + bob, 34, 26, T4.voidDeep, T4.obsidian, T4.hide);
    plate(c, 30, 14 + bob, 16, 14, T4.voidDeep, T4.obsidian, T4.hideLight, T4.crimson);
    spikeSide(c, 45, 17 + bob, 9, 7, T4.ash, 1, T4.bone);
    spikeSide(c, 45, 24 + bob, 7, 5, T4.ash, 1, T4.bone);
    cracks(c, [[16, 22 + bob], [22, 30 + bob], [18, 36 + bob], [28, 24 + bob]], T4.ember, T4.hellCore, f);
    // Small brutal head tucked behind the ram.
    mass(c, 40, 26 + bob, 13, 11, T4.voidDeep, T4.obsidian, T4.hide);
    glowEye(c, 46, 29 + bob, 3, 2, T4.crimson, T4.hell, f);
    r(c, 45, 33 + bob, 8, 2 + (f % 2), T4.void);
    teeth(c, 45, 33 + bob, 8, true, T4.bone);
    spike(c, 41, 26 + bob, 3, 5, T4.ash, T4.bone);
    // Dragging chain and a hooked fist.
    chainRun(c, [20, 40 + bob], [44, 48 + bob], T4.ash, T4.gold);
    mass(c, 44, 34 + bob + (stomp ? -2 : 2), 12, 12, T4.voidDeep, T4.obsidian, T4.hideLight);
    spikeSide(c, 55, 38 + bob + (stomp ? -2 : 2), 5, 4, T4.bone, 1, T4.white);
    if (stomp) r(c, 30, 55, 16, 1, T4.hell);
    debris(c, f, [[6, 18], [58, 22], [8, 46]], T4.ember, T4.hellCore);
    return;
  }

  const back = d === 'back';
  legsFB(c, f, 32, 40, 6, 8, T4.hide, T4.obsidian, T4.ash, back, stomp ? T4.hell : undefined);
  mass(c, 10, 15 + bob, 44, 28, T4.voidDeep, T4.obsidian, T4.hide);
  // Twin ram horns sweeping outward from the shoulders.
  for (const s of [-1, 1] as const) {
    const bx = s < 0 ? 4 : 47;
    plate(c, bx, 13 + bob, 13, 14, T4.voidDeep, T4.obsidian, T4.hideLight, T4.crimson);
    for (let i = 0; i < 4; i++) spikeSide(c, bx + (s < 0 ? 2 : 10), 15 + bob + i * 3, 8 - i, 4, T4.ash, s as 1 | -1, T4.bone);
  }
  if (!back) {
    // Chest furnace: ribs of armor around a molten core.
    plate(c, 22, 20 + bob, 20, 20, T4.voidDeep, T4.obsidian, T4.hideLight, T4.gold);
    box(c, 26, 24 + bob, 12, 12, T4.void);
    r(c, 27, 25 + bob, 10, 10, T4.ember);
    r(c, 29, 27 + bob, 6, 6, f % 2 ? T4.hell : T4.hellCore);
    px(c, 31, 29 + bob, T4.magma);
    for (let i = 0; i < 4; i++) r(c, 24 + i * 5, 21 + bob, 2, 18, T4.ash);
    mass(c, 25, 6 + bob, 14, 12, T4.voidDeep, T4.obsidian, T4.hide);
    glowEye(c, 27, 10 + bob, 3, 2, T4.crimson, T4.hell, f);
    glowEye(c, 34, 10 + bob, 3, 2, T4.crimson, T4.hell, f);
    r(c, 27, 14 + bob, 10, 2 + (f % 2), T4.void);
    teeth(c, 27, 14 + bob, 10, true, T4.bone);
    hornPair(c, 32, 7 + bob, 6, 6, T4.ash, T4.bone);
    chainRun(c, [14, 22 + bob], [50, 34 + bob], T4.ash, T4.gold);
  } else {
    // Spinal furnace vents and a chained slab on the back.
    r(c, 31, 17 + bob, 2, 24, T4.voidDeep);
    for (let y = 20; y < 40; y += 5) {
      box(c, 27, y + bob, 10, 4, T4.ember);
      r(c, 29, y + 1 + bob, 6, 2, f % 2 ? T4.hellCore : T4.hell);
    }
    plate(c, 18, 18 + bob, 28, 20, T4.voidDeep, T4.obsidian, T4.hideLight, T4.crimson);
    chainRun(c, [16, 20 + bob], [48, 26 + bob], T4.ash, T4.gold);
    chainRun(c, [16, 34 + bob], [48, 28 + bob], T4.ash, T4.gold);
    spineSpikes(c, [20, 27, 34, 41], 17 + bob, 6, T4.ash, T4.crimson);
  }
  // Hooked fists on both sides.
  const fy = 32 + bob + (stomp ? -2 : 2);
  mass(c, 2, fy, 11, 12, T4.voidDeep, T4.obsidian, T4.hideLight);
  mass(c, 51, fy, 11, 12, T4.voidDeep, T4.obsidian, T4.hideLight);
  spikeSide(c, 2, fy + 4, 4, 4, T4.bone, -1, T4.white);
  spikeSide(c, 58, fy + 4, 4, 4, T4.bone, 1, T4.white);
  if (stomp) r(c, 12, 55, 40, 1, T4.hell);
  debris(c, f, [[6, 12], [58, 12], [4, 48], [60, 48]], T4.ember, T4.hellCore);
}

/* ============================================== 37 Soul Devourer */
function devourer(c: Ctx, f: number, d: Dir) {
  const bob = f % 2 ? -1 : 0;
  const suck = [0, 1, 2, 1][f]; // chest maw opens through the cycle
  shadowG(c, 16, 0.42);

  if (d === 'side') {
    legsSide(c, f, 28, 42, 5, T4.hide, T4.obsidian, T4.ash, T4.void, T4.ichor);
    mass(c, 18, 20 + bob, 22, 24, T4.voidDeep, T4.obsidian, T4.hide);
    // Chest maw facing right, swallowing soul wisps.
    box(c, 33, 24 + bob, 12, 14, T4.void);
    r(c, 34, 25 + bob, 10, 12, T4.ember);
    r(c, 35, 26 + bob + suck, 8, 10 - suck * 2, T4.maw);
    teeth(c, 35, 25 + bob, 9, true, T4.bone);
    teeth(c, 35, 36 + bob, 9, false, T4.bone);
    // Hunched skull with stitched jaw.
    mass(c, 28, 8 + bob, 14, 13, T4.voidDeep, T4.obsidian, T4.hide);
    box(c, 33, 11 + bob, 9, 8, T4.bone);
    glowEye(c, 35, 13 + bob, 2, 2, T4.ichor, T4.ichorDeep, f);
    glowEye(c, 39, 13 + bob, 2, 2, T4.ichor, T4.ichorDeep, f);
    r(c, 34, 17 + bob, 8, 1, T4.void);
    for (let x = 34; x < 42; x += 2) px(c, x, 18 + bob, T4.boneShade);
    // Long clawed arms reaching forward.
    r(c, 34, 32 + bob, 3, 10, T4.hide);
    spikeSide(c, 37, 41 + bob, 6, 3, T4.bone, 1, T4.white);
    // Souls being pulled into the maw.
    for (let i = 0; i < 3; i++) {
      const sx = 56 - i * 5 - suck * 2;
      px(c, sx, 22 + bob + i * 3, T4.ichor);
      px(c, sx + 1, 23 + bob + i * 3, T4.white);
    }
    drip(c, 24, 43 + bob, f, T4.ichorDeep, T4.ichor);
    debris(c, f, [[12, 18], [52, 44]], T4.ichor, T4.violetBright);
    return;
  }

  const back = d === 'back';
  legsFB(c, f, 32, 42, 3, 6, T4.hide, T4.obsidian, T4.ash, back, T4.ichor);
  mass(c, 16, 18 + bob, 32, 26, T4.voidDeep, T4.obsidian, T4.hide);
  // Hunched shoulders and a tattered loin wrap.
  plate(c, 15, 20 + bob, 10, 9, T4.voidDeep, T4.obsidian, T4.hideLight, T4.ichor);
  plate(c, 39, 20 + bob, 10, 9, T4.voidDeep, T4.obsidian, T4.hideLight, T4.ichor);
  for (let x = 20; x < 44; x += 3) spikeDown(c, x, 43 + bob, 3, 5 + ((x + f) % 3), T4.hide, T4.obsidian);
  if (!back) {
    // Wide chest maw: gums, three rows of teeth, souls spiralling in.
    box(c, 23, 23 + bob, 18, 16, T4.void);
    r(c, 24, 24 + bob, 16, 14, T4.ember);
    r(c, 26, 26 + bob, 12, 10 - suck * 2, T4.voidDeep);
    teeth(c, 24, 24 + bob, 16, true, T4.bone);
    teeth(c, 24, 38 + bob, 16, false, T4.bone);
    teeth(c, 26, 31 + bob, 12, true, T4.boneShade);
    for (let i = 0; i < 3; i++) {
      const sx = 32 + Math.round(Math.cos((f + i) * 2) * (7 - i * 2));
      const sy = 30 + bob + Math.round(Math.sin((f + i) * 2) * (5 - i));
      px(c, sx, sy, T4.ichor);
      px(c, sx + 1, sy, T4.white);
    }
    // Skull face above the maw, jaw stitched shut.
    mass(c, 24, 6 + bob, 16, 14, T4.voidDeep, T4.obsidian, T4.hide);
    box(c, 26, 9 + bob, 12, 10, T4.bone);
    glowEye(c, 28, 12 + bob, 3, 3, T4.ichor, T4.ichorDeep, f);
    glowEye(c, 34, 12 + bob, 3, 3, T4.ichor, T4.ichorDeep, f);
    r(c, 28, 17 + bob, 9, 1, T4.void);
    for (let x = 28; x < 37; x += 2) px(c, x, 18 + bob, T4.boneShade);
    spike(c, 25, 8 + bob, 3, 5, T4.ash, T4.bone);
    spike(c, 36, 8 + bob, 3, 5, T4.ash, T4.bone);
  } else {
    // Spine of vertebrae, shoulder blades, souls leaking out of the back.
    r(c, 31, 20 + bob, 3, 22, T4.bone);
    for (let y = 21; y < 42; y += 3) {
      r(c, 29, y + bob, 7, 2, T4.boneShade);
      px(c, 32, y + bob, T4.void);
    }
    plate(c, 20, 21 + bob, 9, 9, T4.voidDeep, T4.obsidian, T4.hideLight, T4.ichor);
    plate(c, 35, 21 + bob, 9, 9, T4.voidDeep, T4.obsidian, T4.hideLight, T4.ichor);
    mass(c, 25, 6 + bob, 14, 13, T4.voidDeep, T4.obsidian, T4.hide);
    r(c, 31, 8 + bob, 2, 9, T4.bone);
    for (let i = 0; i < 3; i++) {
      px(c, 24 + i * 6, 40 + bob - ((f + i) % 3) * 3, T4.ichor);
      px(c, 25 + i * 6, 39 + bob - ((f + i) % 3) * 3, T4.white);
    }
  }
  // Clawed arms hanging past the hips, wrapped in sinew and bone rings.
  const ay = 30 + bob;
  for (const ax of [12, 47]) {
    r(c, ax, ay, 5, 12, T4.hide);
    r(c, ax + 3, ay + 1, 2, 10, T4.obsidian);
    for (let i = 0; i < 3; i++) r(c, ax, ay + 2 + i * 4, 5, 1, T4.boneShade);
  }
  spikeSide(c, 8, ay + 11, 5, 3, T4.bone, -1, T4.white);
  spikeSide(c, 51, ay + 11, 5, 3, T4.bone, 1, T4.white);
  spikeSide(c, 8, ay + 8, 4, 2, T4.boneShade, -1, T4.bone);
  spikeSide(c, 52, ay + 8, 4, 2, T4.boneShade, 1, T4.bone);
  drip(c, 15, ay + 12, f, T4.ichorDeep, T4.ichor);
  drip(c, 49, ay + 12, f, T4.ichorDeep, T4.ichor);
  // Stitched seams and rot patches across the hide.
  for (let i = 0; i < 5; i++) {
    px(c, 21 + i * 5, 21 + bob + (i % 2), T4.boneShade);
    r(c, 22 + i * 5, 40 + bob, 2, 1, T4.ichorDeep);
  }
  chainRun(c, [20, 20 + bob], [44, 24 + bob], T4.ash, T4.boneShade);
  debris(c, f, [[10, 16], [54, 16], [8, 48], [56, 48]], T4.ichor, T4.violetBright);
}

/* ============================================== 38 Chaos Sorcerer */
function sorcerer(c: Ctx, f: number, d: Dir) {
  const bob = f % 2 ? -1 : 0;
  const cast = [0, 1, 2, 1][f];
  shadowG(c, 16, 0.42);
  runeRing(c, 32, 30 + bob, 26, 12, f, T4.violetBright);

  if (d === 'side') {
    legsSide(c, f, 28, 44, 3, T4.bone, T4.boneShade, T4.boneShade, T4.void, T4.violet);
    // Torn robe with void cracks showing through.
    mass(c, 17, 22 + bob, 22, 24, T4.voidDeep, T4.violet, T4.violetBright);
    for (let x = 17; x < 39; x += 3) spikeDown(c, x, 45 + bob, 3, 6 + ((x + f) % 3), T4.voidDeep, T4.violet);
    cracks(c, [[21, 28 + bob], [27, 34 + bob], [23, 40 + bob]], T4.violet, T4.violetBright, f);
    // Skull crown and burning sockets.
    mass(c, 28, 9 + bob, 15, 14, T4.voidDeep, T4.violet, T4.violetBright);
    box(c, 32, 12 + bob, 11, 9, T4.bone);
    glowEye(c, 34, 14 + bob, 3, 3, T4.violetBright, T4.violet, f);
    glowEye(c, 39, 14 + bob, 3, 3, T4.violetBright, T4.violet, f);
    r(c, 35, 19 + bob, 6, 1, T4.void);
    teeth(c, 35, 19 + bob, 6, false, T4.boneShade);
    for (let i = 0; i < 4; i++) spike(c, 30 + i * 4, 10 + bob, 2, 5 + (i % 2) * 3, T4.bone, T4.boneShade);
    // Four arms: two weaving a meteor, two holding a staff of bone.
    r(c, 38, 26 + bob - cast, 3, 9, T4.bone);
    r(c, 41, 22 + bob - cast, 3, 8, T4.bone);
    spike(c, 42, 20 + bob - cast, 9, 9, T4.violet, T4.violetBright);
    px(c, 46, 16 + bob - cast, T4.white);
    r(c, 36, 32 + bob + cast, 3, 8, T4.boneShade);
    r(c, 47, 6 + bob, 2, 46, T4.boneShade);
    box(c, 44, 2 + bob, 8, 7, T4.bone);
    px(c, 46, 4 + bob, T4.crimson);
    px(c, 49, 4 + bob, T4.crimson);
    debris(c, f, [[12, 20], [56, 28], [14, 46]], T4.violet, T4.crimson);
    return;
  }

  const back = d === 'back';
  legsFB(c, f, 32, 44, 3, 4, T4.bone, T4.boneShade, T4.boneShade, back, T4.violet);
  mass(c, 15, 20 + bob, 34, 26, T4.voidDeep, T4.violet, T4.violetBright);
  for (let x = 15; x < 49; x += 3) spikeDown(c, x, 45 + bob, 3, 7 + ((x + f) % 3), T4.voidDeep, T4.violet);
  // Second robe layer with gold trim and hanging vertebrae charms.
  r(c, 17, 22 + bob, 30, 2, T4.gold);
  for (let i = 0; i < 4; i++) {
    r(c, 20 + i * 7, 34 + bob, 1, 5 + ((i + f) % 2), T4.boneShade);
    box(c, 19 + i * 7, 39 + bob + ((i + f) % 2), 3, 3, T4.bone);
  }
  if (!back) {
    // Open robe: ribcage and a violet heart of chaos.
    box(c, 25, 25 + bob, 14, 15, T4.void);
    for (let y = 27; y < 39; y += 3) r(c, 26, y + bob, 12, 1, T4.bone);
    r(c, 31, 26 + bob, 2, 13, T4.bone);
    box(c, 29, 30 + bob, 6, 6, T4.violet);
    r(c, 30, 31 + bob, 4, 4, f % 2 ? T4.violetBright : T4.white);
  } else {
    // Sigil of the abyss burned into the robe.
    r(c, 31, 24 + bob, 2, 18, T4.violetBright);
    r(c, 24, 30 + bob, 16, 2, T4.violetBright);
    box(c, 28, 27 + bob, 8, 8, T4.voidDeep);
    px(c, 31, 30 + bob, f % 2 ? T4.white : T4.crimson);
    px(c, 26, 36 + bob, T4.crimson);
    px(c, 37, 36 + bob, T4.crimson);
  }
  // Skull crown visible from both sides.
  mass(c, 24, 7 + bob, 16, 15, T4.voidDeep, T4.violet, T4.violetBright);
  for (let i = 0; i < 5; i++) spike(c, 24 + i * 3, 8 + bob, 2, 6 + (i % 2) * 3, T4.bone, T4.boneShade);
  if (!back) {
    box(c, 26, 10 + bob, 12, 10, T4.bone);
    glowEye(c, 28, 13 + bob, 3, 3, T4.violetBright, T4.violet, f);
    glowEye(c, 34, 13 + bob, 3, 3, T4.violetBright, T4.violet, f);
    r(c, 29, 18 + bob, 7, 1, T4.void);
    teeth(c, 29, 18 + bob, 7, false, T4.boneShade);
  } else {
    r(c, 31, 9 + bob, 2, 11, T4.boneShade);
  }
  // Four arms: two raised casting meteors, two low holding the bone staff.
  const ay = 24 + bob;
  r(c, 10, ay - cast, 4, 10, T4.bone);
  r(c, 50, ay - cast, 4, 10, T4.bone);
  // Layered meteors: outer shell, molten middle, white-hot core, trailing sparks.
  spike(c, 5, ay - 6 - cast, 9, 9, T4.violet, T4.violetBright);
  spike(c, 7, ay - 7 - cast, 5, 6, T4.crimson, T4.hellCore);
  spike(c, 50, ay - 6 - cast, 9, 9, T4.crimson, T4.hellCore);
  spike(c, 52, ay - 7 - cast, 5, 6, T4.hell, T4.magma);
  px(c, 9, ay - 9 - cast, T4.white);
  px(c, 54, ay - 9 - cast, T4.magma);
  for (let i = 0; i < 3; i++) {
    px(c, 4 + i * 2, ay + 2 + cast - i, i % 2 ? T4.violetBright : T4.crimsonBright);
    px(c, 58 - i * 2, ay + 2 + cast - i, i % 2 ? T4.hellCore : T4.hell);
  }
  r(c, 14, ay + 8 + cast, 4, 9, T4.boneShade);
  r(c, 46, ay + 8 + cast, 4, 9, T4.boneShade);
  // Finger bones on the lower pair and rings on the upper pair.
  for (let i = 0; i < 3; i++) {
    spikeSide(c, 10, ay + 16 + cast + i, 4, 2, T4.bone, -1, T4.boneShade);
    spikeSide(c, 50, ay + 16 + cast + i, 4, 2, T4.bone, 1, T4.boneShade);
  }
  for (let i = 0; i < 3; i++) {
    r(c, 10, ay - cast + 1 + i * 3, 4, 1, T4.gold);
    r(c, 50, ay - cast + 1 + i * 3, 4, 1, T4.gold);
  }
  // Belt of vertebrae and a floating skull orbiting the robe.
  for (let i = 0; i < 5; i++) box(c, 21 + i * 5, 41 + bob, 4, 3, T4.bone);
  const sk = (f * 4) % 16;
  box(c, 8 + sk, 12 + bob, 6, 5, T4.bone);
  px(c, 9 + sk, 14 + bob, T4.violetBright);
  px(c, 12 + sk, 14 + bob, T4.violetBright);
  r(c, 56, 4 + bob, 2, 48, T4.boneShade);
  box(c, 53, 0 + bob, 8, 7, T4.bone);
  px(c, 55, 2 + bob, T4.crimson);
  px(c, 58, 2 + bob, T4.crimson);
  debris(c, f, [[8, 14], [56, 14], [6, 46], [58, 46]], T4.violet, T4.crimson);
}

/* ========================================== 39 Avatar of Oblivion */
function avatar(c: Ctx, f: number, d: Dir) {
  const bob = [0, -2, -3, -1][f];
  const cy = 26 + bob;
  shadowG(c, 17, 0.38);
  // Gravity rings warping around the body.
  runeRing(c, 32, cy + 6, 27, 8, f, T4.crimsonBright);
  runeRing(c, 32, cy - 8, 22, 6, (f + 2) % 4, T4.violetBright);

  if (d === 'side') {
    tendrils(c, 32, cy + 18, f, T4.obsidian, T4.crimsonBright, 2);
    mass(c, 21, cy - 6, 20, 26, T4.voidDeep, T4.obsidian, T4.hide);
    cracks(c, [[24, cy], [29, cy + 8], [25, cy + 14]], T4.crimson, T4.crimsonBright, f);
    // Cracked porcelain mask in profile, one half missing.
    box(c, 30, cy - 20, 15, 15, T4.bone);
    r(c, 31, cy - 19, 13, 13, T4.white);
    r(c, 38, cy - 19, 2, 13, T4.void);
    r(c, 34, cy - 14, 6, 1, T4.void);
    glowEye(c, 34, cy - 16, 3, 2, T4.crimson, T4.crimsonBright, f);
    spikeSide(c, 44, cy - 12, 5, 4, T4.boneShade, 1, T4.bone);
    // Detached hands floating and casting.
    const hy = cy - 2 + (f % 2 ? -2 : 2);
    box(c, 48, hy, 8, 7, T4.bone);
    for (let i = 0; i < 3; i++) spikeSide(c, 55, hy + 1 + i * 2, 4, 2, T4.boneShade, 1, T4.white);
    px(c, 51, hy + 3, T4.crimson);
    box(c, 10, hy + 6, 7, 6, T4.bone);
    spikeSide(c, 6, hy + 8, 4, 2, T4.boneShade, -1, T4.white);
    // Void core where the heart should be.
    box(c, 27, cy + 2, 8, 8, T4.void);
    r(c, 29, cy + 4, 4, 4, f % 2 ? T4.crimsonBright : T4.violetBright);
    debris(c, f, [[14, cy - 22], [54, cy - 20], [8, cy + 16]], T4.crimson, T4.violetBright);
    return;
  }

  const back = d === 'back';
  tendrils(c, 32, cy + 18, f, T4.obsidian, T4.crimsonBright, back ? 5 : 4);
  mass(c, 18, cy - 7, 28, 27, T4.voidDeep, T4.obsidian, T4.hide);
  // Shoulder plates and a collar of vertebrae.
  plate(c, 16, cy - 5, 9, 10, T4.voidDeep, T4.obsidian, T4.hideLight, T4.crimson);
  plate(c, 39, cy - 5, 9, 10, T4.voidDeep, T4.obsidian, T4.hideLight, T4.crimson);
  chainRun(c, [22, cy - 6], [42, cy - 6], T4.boneShade, T4.bone);
  if (!back) {
    // Ribcage opened around a collapsing void core.
    box(c, 25, cy - 2, 14, 16, T4.void);
    for (let i = 0; i < 4; i++) {
      r(c, 25, cy + i * 4, 4, 2, T4.bone);
      r(c, 35, cy + i * 4, 4, 2, T4.bone);
    }
    box(c, 28, cy + 1, 8, 9, T4.void);
    r(c, 29, cy + 2, 6, 7, f % 2 ? T4.crimson : T4.violet);
    r(c, 30, cy + 4, 4, 3, f % 2 ? T4.crimsonBright : T4.white);
    px(c, 31, cy + 5, T4.white);
  } else {
    // Spine of floating vertebrae and a torn cloak of void.
    for (let i = 0; i < 6; i++) {
      const vy = cy - 2 + i * 4;
      box(c, 30, vy, 5, 3, T4.bone);
      px(c, 32, vy + 1, T4.crimson);
    }
    for (let x = 20; x < 44; x += 4) spikeDown(c, x, cy + 18, 4, 8 + ((x + f) % 3) * 2, T4.voidDeep, T4.crimson);
  }
  // Cracked porcelain mask, front or back of the head.
  box(c, 24, cy - 22, 16, 16, T4.bone);
  r(c, 25, cy - 21, 14, 14, T4.white);
  r(c, 31, cy - 21, 2, 14, T4.void);
  r(c, 26, cy - 14, 5, 1, T4.void);
  r(c, 34, cy - 16, 4, 1, T4.void);
  if (!back) {
    glowEye(c, 27, cy - 17, 3, 3, T4.crimson, T4.crimsonBright, f);
    glowEye(c, 34, cy - 17, 3, 3, T4.violetBright, T4.violet, f);
    r(c, 29, cy - 10, 6, 2, T4.void);
    teeth(c, 29, cy - 10, 6, true, T4.boneShade);
  }
  // Halo of shards above the mask, plus a second ring of void glass below it.
  for (let i = 0; i < 5; i++) spike(c, 24 + i * 3, cy - 22, 2, 5 + ((i + f) % 3) * 2, T4.crimsonBright, T4.white);
  for (let i = 0; i < 4; i++) spikeDown(c, 25 + i * 4, cy - 24, 2, 3 + ((i + f) % 2) * 2, T4.violetBright, T4.white);
  // Cracks spreading over the porcelain mask and the collar of the robe.
  r(c, 27, cy - 19, 1, 5, T4.void);
  r(c, 28, cy - 15, 1, 4, T4.void);
  r(c, 36, cy - 20, 1, 6, T4.void);
  r(c, 37, cy - 15, 1, 3, T4.void);
  for (let i = 0; i < 6; i++) px(c, 21 + i * 4, cy - 7, i % 2 ? T4.gold : T4.goldBright);
  cracks(c, [[22, cy + 4], [26, cy + 12], [38, cy + 10], [42, cy + 2]], T4.crimson, T4.crimsonBright, f);
  // Detached floating hands on both sides.
  const hy = cy + 2 + (f % 2 ? -3 : 3);
  for (const hx of [4, 50]) {
    const dirX = hx < 32 ? -1 : 1;
    box(c, hx, hy, 10, 8, T4.bone);
    for (let i = 0; i < 3; i++) spikeSide(c, hx + (dirX < 0 ? 0 : 9), hy + 1 + i * 2, 5, 2, T4.boneShade, dirX as 1 | -1, T4.white);
    px(c, hx + 4, hy + 3, f % 2 ? T4.crimson : T4.violetBright);
  }
  debris(c, f, [[10, cy - 24], [54, cy - 24], [6, cy + 12], [58, cy + 12]], T4.crimson, T4.violetBright);
}

/* ================================== 40 BOSS Supreme Void Overlord */
function overlord(c: Ctx, f: number, d: Dir) {
  const bob = f % 2 ? -1 : 0;
  const pulse = f % 2;
  const breathe = [0, 1, 2, 1][f];
  shadowG(c, 28, 0.6);

  if (d === 'side') {
    // Void wings spanning the frame behind the body.
    wing(c, 26, 18 + bob, 24, -14 - breathe * 2, T4.ash, T4.voidDeep, -1, 5);
    wing(c, 26, 22 + bob, 22, 6 + breathe * 2, T4.ash, T4.obsidian, -1, 4);
    legsSide(c, f, 26, 40, 8, T4.hide, T4.obsidian, T4.ash, T4.void, T4.crimson);
    // Colossal torso with a black-hole core pulling in light.
    mass(c, 14, 14 + bob, 32, 28, T4.voidDeep, T4.obsidian, T4.hide);
    plate(c, 18, 16 + bob, 12, 12, T4.voidDeep, T4.obsidian, T4.hideLight, T4.gold);
    box(c, 28, 22 + bob, 14, 14, T4.void);
    for (let i = 0; i < 5; i++) r(c, 29 + i, 23 + bob + i * 2, 12 - i * 2, 1, i % 2 ? T4.crimson : T4.violet);
    r(c, 33, 27 + bob, 4, 4, pulse ? T4.white : T4.crimsonBright);
    cracks(c, [[17, 30 + bob], [22, 36 + bob], [40, 30 + bob], [36, 38 + bob]], T4.crimson, T4.hellCore, f);
    // Horned crown skull in profile with a burning maw.
    mass(c, 38, 2 + bob, 18, 16, T4.voidDeep, T4.obsidian, T4.hide);
    box(c, 52, 8 + bob, 10, 7, T4.hideLight);
    r(c, 52, 10 + bob, 10, 3 + breathe, T4.void);
    teeth(c, 52, 10 + bob, 10, true, T4.bone);
    teeth(c, 52, 12 + breathe + bob, 10, false, T4.boneShade);
    glowEye(c, 46, 5 + bob, 4, 3, T4.crimson, T4.hellCore, f);
    hornPair(c, 44, 3 + bob, 6, 9, T4.ash, T4.bone);
    spikeSide(c, 54, 2 + bob, 7, 4, T4.ash, 1, T4.bone);
    // Four arms: two wielding a void scythe, two clawing forward.
    r(c, 40, 20 + bob, 5, 14, T4.hide);
    mass(c, 42, 32 + bob, 12, 10, T4.voidDeep, T4.obsidian, T4.hideLight);
    spikeSide(c, 53, 35 + bob, 6, 4, T4.bone, 1, T4.white);
    r(c, 34, 24 + bob, 4, 12, T4.hideLight);
    // Scythe of collapsing space.
    r(c, 56, 8 + bob, 3, 44, T4.ash);
    spikeSide(c, 56, 8 + bob, 6, 10, T4.violet, -1, T4.white);
    r(c, 50, 6 + bob, 8, 3, pulse ? T4.crimsonBright : T4.violetBright);
    debris(c, f, [[8, 10], [20, 4], [60, 26], [10, 46]], T4.crimson, T4.violetBright);
    return;
  }

  const back = d === 'back';
  // Wings: two membranes each side, sweeping with the breath cycle.
  wing(c, 24, 16 + bob, 22, -13 - breathe * 2, T4.ash, T4.voidDeep, -1, 5);
  wing(c, 40, 16 + bob, 22, -13 - breathe * 2, T4.ash, T4.voidDeep, 1, 5);
  wing(c, 24, 22 + bob, 18, 8 + breathe * 2, T4.ash, T4.obsidian, -1, 4);
  wing(c, 40, 22 + bob, 18, 8 + breathe * 2, T4.ash, T4.obsidian, 1, 4);
  legsFB(c, f, 32, 40, 6, 9, T4.hide, T4.obsidian, T4.ash, back, T4.crimson);
  mass(c, 12, 13 + bob, 40, 30, T4.voidDeep, T4.obsidian, T4.hide);
  // Shoulder citadels with skulls.
  for (const sx of [4, 46]) {
    plate(c, sx, 11 + bob, 14, 14, T4.voidDeep, T4.obsidian, T4.hideLight, T4.gold);
    box(c, sx + 4, 14 + bob, 6, 6, T4.bone);
    px(c, sx + 5, 16 + bob, T4.void);
    px(c, sx + 8, 16 + bob, T4.void);
    spike(c, sx + 1, 12 + bob, 3, 6, T4.ash, T4.bone);
    spike(c, sx + 10, 12 + bob, 3, 6, T4.ash, T4.bone);
  }
  if (!back) {
    // Chest: black hole with an accretion ring, ribs of armor around it.
    box(c, 22, 18 + bob, 20, 20, T4.void);
    for (let i = 0; i < 6; i++) {
      const rr = 9 - i;
      r(c, 32 - rr, 28 + bob - Math.floor(rr / 2), rr * 2, 1, i % 2 ? T4.crimson : T4.violet);
    }
    r(c, 28, 24 + bob, 8, 8, T4.voidDeep);
    r(c, 30, 26 + bob, 4, 4, pulse ? T4.crimsonBright : T4.violetBright);
    px(c, 31, 27 + bob, T4.white);
    for (let i = 0; i < 5; i++) r(c, 21 + i * 5, 17 + bob, 2, 22, T4.ash);
    // Souls spiralling into the core.
    for (let i = 0; i < 4; i++) {
      const a = (f * Math.PI) / 2 + (i * Math.PI) / 2;
      px(c, Math.round(32 + Math.cos(a) * (13 - i)), Math.round(28 + bob + Math.sin(a) * (10 - i)), i % 2 ? T4.crimsonBright : T4.white);
    }
    // Crowned skull facing the player: horns, diadem, burning eye sockets.
    mass(c, 22, 0 + bob, 20, 16, T4.voidDeep, T4.obsidian, T4.hide);
    hornPair(c, 32, 2 + bob, 9, 11, T4.ash, T4.bone);
    spike(c, 23, 3 + bob, 4, 7, T4.ash, T4.bone);
    spike(c, 37, 3 + bob, 4, 7, T4.ash, T4.bone);
    r(c, 24, 4 + bob, 16, 3, T4.gold);
    px(c, 31, 3 + bob, T4.goldBright);
    px(c, 27, 5 + bob, T4.crimson);
    px(c, 36, 5 + bob, T4.crimson);
    glowEye(c, 26, 8 + bob, 4, 4, T4.crimson, T4.hellCore, f);
    glowEye(c, 34, 8 + bob, 4, 4, T4.crimson, T4.hellCore, f);
    r(c, 31, 9 + bob, 2, 4, T4.void);
    r(c, 26, 14 + bob, 12, 2 + breathe, T4.void);
    teeth(c, 26, 14 + bob, 12, true, T4.bone);
    teeth(c, 26, 15 + breathe + bob, 12, false, T4.boneShade);
    chainRun(c, [12, 20 + bob], [52, 30 + bob], T4.ash, T4.gold);
  } else {
    // Rear: spinal column of the abyss, chains, and a torn void mantle.
    r(c, 30, 15 + bob, 4, 26, T4.voidDeep);
    for (let y = 17; y < 40; y += 4) {
      box(c, 28, y + bob, 8, 3, T4.bone);
      px(c, 31, y + 1 + bob, pulse ? T4.crimsonBright : T4.violetBright);
    }
    plate(c, 18, 16 + bob, 28, 22, T4.voidDeep, T4.obsidian, T4.hideLight, T4.crimson);
    chainRun(c, [14, 18 + bob], [50, 26 + bob], T4.ash, T4.gold);
    chainRun(c, [14, 32 + bob], [50, 24 + bob], T4.ash, T4.gold);
    spineSpikes(c, [20, 27, 34, 41], 15 + bob, 8, T4.ash, T4.crimsonBright);
    for (let x = 14; x < 50; x += 4) spikeDown(c, x, 42 + bob, 4, 9 + ((x + f) % 3) * 2, T4.voidDeep, T4.crimson);
    mass(c, 23, 1 + bob, 18, 14, T4.voidDeep, T4.obsidian, T4.hide);
    hornPair(c, 32, 2 + bob, 9, 11, T4.ash, T4.bone);
    r(c, 31, 3 + bob, 2, 10, T4.ash);
  }
  // Four arms: outer pair with claws, inner pair holding the void scythe.
  const ay = 26 + bob;
  mass(c, 2, ay, 11, 14, T4.voidDeep, T4.obsidian, T4.hideLight);
  mass(c, 51, ay, 11, 14, T4.voidDeep, T4.obsidian, T4.hideLight);
  spikeSide(c, 2, ay + 5, 5, 4, T4.bone, -1, T4.white);
  spikeSide(c, 57, ay + 5, 5, 4, T4.bone, 1, T4.white);
  if (!back) {
    r(c, 56, 6 + bob, 3, 46, T4.ash);
    spikeSide(c, 56, 6 + bob, 6, 10, T4.violet, -1, T4.white);
    r(c, 50, 4 + bob, 8, 3, pulse ? T4.crimsonBright : T4.violetBright);
  } else {
    r(c, 5, 6 + bob, 3, 46, T4.ash);
    spikeSide(c, 8, 6 + bob, 6, 10, T4.violet, 1, T4.white);
    r(c, 6, 4 + bob, 8, 3, pulse ? T4.crimsonBright : T4.violetBright);
  }
  debris(c, f, [[8, 8], [56, 8], [4, 48], [60, 48], [32, 4]], T4.crimson, T4.violetBright);
}

/* ============================================================ dispatcher */

export function drawTier4(c: Ctx, id: number, frame: number, direction: Dir) {
  const f = ((frame % 4) + 4) % 4;
  switch (id) {
    case 31: return voidImp(c, f, direction);
    case 32: return stalker(c, f, direction);
    case 33: return hound(c, f, direction);
    case 34: return knight(c, f, direction);
    case 35: return beholder(c, f, direction);
    case 36: return juggernaut(c, f, direction);
    case 37: return devourer(c, f, direction);
    case 38: return sorcerer(c, f, direction);
    case 39: return avatar(c, f, direction);
    case 40: return overlord(c, f, direction);
  }
}

export const TIER4_DIRECTION_GUIDE: Record<Dir, string> = {
  front: 'Фронт ↓: идёт на игрока. Кадры 0 и 2 — опорная нога на y=56, кадры 1 и 3 — перенос с поднятой подошвой. Пасть раскрывается шире, глаза и ядро вспыхивают через кадр.',
  side: 'Бок →: идёт вправо. Цикл: опора ближней ноги → перенос → опора дальней → перенос. Крылья, хвост, плащ, оружие и щупальца движутся в противофазе к шагу.',
  back: 'Спина ↑: уходит вверх. На поднятой ноге видна тёмная подошва, хвост и щупальца раскачиваются, руны и трещины на спине пульсируют.',
};
