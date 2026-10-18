import { drawRect as r, drawPixel as px, drawGroundShadow } from './palette';
import type { SpriteDirection } from '../types/mob';

/*
 * TIER 3 — ICE PEAKS (mobs 21–30).
 * Fully independent from Tier 1 / Tier 2: own palette, own helpers, own drawers.
 * Contract: transparent 64x64 frame, 4 walk frames, feet (or trail tip) on the
 * ground row y=55 (baseline line y=56), three views: front ↓, side → , back ↑.
 * Menace escalates with the id: cyan eyes → white-hot → violet runes → crimson.
 */

type Ctx = CanvasRenderingContext2D;
type Dir = SpriteDirection;
type Pt = [number, number];

export const T3 = {
  outline: '#050814',
  iceDeep: '#0b1e3a',
  iceDark: '#1e3a6e',
  iceMid: '#3b82c4',
  iceLight: '#93c5fd',
  iceBright: '#dbeafe',
  white: '#f8fafc',
  frost: '#67e8f9',
  frostCore: '#ecfeff',
  snowShade: '#94a3b8',
  snow: '#e2e8f0',
  furDark: '#334155',
  furMid: '#64748b',
  furLight: '#cbd5e1',
  skin: '#1e293b',
  steelDark: '#1f2937',
  steel: '#4b5563',
  steelLight: '#9ca3af',
  bone: '#e7e5e4',
  boneShade: '#a8a29e',
  rune: '#a78bfa',
  runeDeep: '#5b21b6',
  crimson: '#e11d48',
  crimsonDeep: '#881337',
  gold: '#fbbf24',
  maw: '#1a0510',
} as const;

/* ---------------------------------------------------------------- helpers */

function box(c: Ctx, x: number, y: number, w: number, h: number, fill: string, line: string = T3.outline) {
  r(c, x, y, w, h, line);
  if (w > 2 && h > 2) r(c, x + 1, y + 1, w - 2, h - 2, fill);
}

/** Outlined volume: top highlight, right and bottom shade. Reads as 3D at 64px. */
function mass(c: Ctx, x: number, y: number, w: number, h: number, dark: string, mid: string, light: string) {
  box(c, x, y, w, h, mid);
  r(c, x + 1, y + 1, w - 2, 2, light);
  r(c, x + 1, y + h - 3, w - 2, 2, dark);
  if (h > 6) r(c, x + w - 3, y + 3, 2, h - 6, dark);
}

/** Upward triangle spike; widest row at baseY. */
function spike(c: Ctx, x: number, baseY: number, w: number, h: number, color: string, tip?: string) {
  for (let i = 0; i < h; i++) {
    const ww = Math.max(1, Math.round(w * (1 - i / h)));
    r(c, x + Math.floor((w - ww) / 2), baseY - i, ww, 1, color);
  }
  if (tip) px(c, x + Math.floor(w / 2), baseY - h + 1, tip);
}

/** Downward triangle (icicles, fangs, fur tufts); widest row at topY. */
function spikeDown(c: Ctx, x: number, topY: number, w: number, h: number, color: string) {
  for (let i = 0; i < h; i++) {
    const ww = Math.max(1, Math.round(w * (1 - i / h)));
    r(c, x + Math.floor((w - ww) / 2), topY + i, ww, 1, color);
  }
}

/** Horizontal triangle pointing left (-1) or right (+1). */
function spikeSide(c: Ctx, x: number, y: number, len: number, h: number, color: string, dirX: 1 | -1) {
  for (let i = 0; i < len; i++) {
    const hh = Math.max(1, Math.round(h * (1 - i / len)));
    r(c, x + i * dirX, y + Math.floor((h - hh) / 2), 1, hh, color);
  }
}

function fang(c: Ctx, x: number, y: number, h: number) {
  r(c, x, y, 1, h, T3.white);
}

/** 2x2 glowing eye; the halo flickers every other frame. */
function eye(c: Ctx, x: number, y: number, core: string, halo: string, f: number) {
  r(c, x, y, 2, 2, core);
  px(c, x, y, T3.frostCore);
  if (f % 2 === 0) {
    px(c, x - 1, y + 1, halo);
    px(c, x + 2, y, halo);
  }
}

/** Frost motes drifting upward, phase-shifted per point. */
function motes(c: Ctx, f: number, pts: Pt[], color: string) {
  for (const [x, y] of pts) px(c, x + ((f + x) % 2), y - ((f * 3 + x * 5) % 10), color);
}

/** Frost breath puff that grows across the 4 frames. */
function breath(c: Ctx, x: number, y: number, f: number, dx: number, dy: number) {
  const n = f + 1;
  for (let i = 0; i < n; i++) {
    const cx = x + dx * i * 2;
    const cy = y + dy * i * 2;
    px(c, cx, cy, i === n - 1 ? T3.frost : T3.iceBright);
    if (i > 1) px(c, cx, cy + 1, T3.iceLight);
  }
}

function shadow(c: Ctx, rx: number, alpha: number) {
  drawGroundShadow(c, 32, rx, 3, 56, alpha);
}

/* Front/back legs: lifted foot shows sole (back) or raised knee cap (front). */
const LIFT_FB: Pt[] = [[4, 0], [2, 0], [0, 4], [0, 2]];
function legsFB(
  c: Ctx, f: number, cx: number, hip: number, gap: number, w: number,
  leg: string, shade: string, boot: string, back: boolean,
) {
  const [ll, rl] = LIFT_FB[f];
  const feet: Pt[] = [[cx - gap - w, ll], [cx + gap, rl]];
  for (const [x, lift] of feet) {
    const bottom = 55 - lift;
    r(c, x, hip, w, bottom - hip - 2, leg);
    r(c, x + w - 2, hip + 1, 2, Math.max(1, bottom - hip - 3), shade);
    box(c, x - 1, bottom - 3, w + 2, 4, boot);
    if (lift > 0 && back) r(c, x, bottom - 1, w, 1, T3.outline);
    if (lift > 0 && !back) r(c, x, bottom - 2, w, 1, T3.iceBright);
  }
}

/* Side stride (facing right): nearDx, nearLift, farDx, farLift. */
const STRIDE: Array<[number, number, number, number]> = [
  [5, 0, -5, 3],
  [0, 0, 2, 6],
  [-5, 3, 5, 0],
  [2, 6, 0, 0],
];
function legsSide(
  c: Ctx, f: number, hipX: number, hip: number, w: number,
  near: string, far: string, nearBoot: string, farBoot: string,
) {
  const [nd, nl, fd, fl] = STRIDE[f];
  const leg = (dx: number, lift: number, col: string, bootCol: string) => {
    const bottom = 55 - lift;
    const knee = hip + Math.floor((bottom - hip) / 2);
    r(c, hipX + Math.round(dx / 2), hip, w, knee - hip + 1, col);
    r(c, hipX + dx, knee, w, Math.max(1, bottom - knee - 2), col);
    box(c, hipX + dx - 1, bottom - 3, w + 3, 4, bootCol);
  };
  leg(fd, fl, far, farBoot);
  leg(nd, nl, near, nearBoot);
}

/** Bat/drake wing: membrane hangs from a bone line swept by `dy` (flap). */
function wing(c: Ctx, sx: number, sy: number, len: number, dy: number, bone: string, membrane: string, dirX: 1 | -1) {
  for (let i = 0; i <= len; i++) {
    const x = sx + i * dirX;
    const y = sy + Math.round((dy * i) / len);
    const h = Math.max(1, Math.round(9 * Math.sin((Math.PI * i) / len)) + 2);
    r(c, x, y, 1, h, membrane);
    if (i > 0 && i % 4 === 0) r(c, x, y, 1, h, bone);
    px(c, x, y, bone);
  }
  px(c, sx + len * dirX, sy + dy - 1, T3.white);
}

/** Feathered wing: pale membrane with a ragged trailing edge of feathers. */
function featherWing(c: Ctx, sx: number, sy: number, len: number, dy: number, dirX: 1 | -1) {
  wing(c, sx, sy, len, dy, T3.iceLight, T3.snow, dirX);
  for (let i = 2; i <= len; i += 3) {
    const x = sx + i * dirX;
    const y = sy + Math.round((dy * i) / len);
    const h = Math.max(1, Math.round(9 * Math.sin((Math.PI * i) / len)) + 2);
    spikeDown(c, x - 1, y + h, 3, 3, T3.snowShade);
  }
}

/* ============================================================ 21 Frost Wisp */
function frostWisp(c: Ctx, f: number, d: Dir) {
  const bob = [0, -2, -3, -1][f];
  const sway = [-1, 0, 1, 0][f];
  shadow(c, 10, 0.25);
  const cy = 30 + bob;
  // Frost tail tapering down to the ground row y=55 (contact point).
  const top = cy + 10;
  const drift = d === 'side' ? -9 : sway * 2;
  for (let y = top; y <= 55; y++) {
    const t = (y - top) / (55 - top);
    const w = Math.max(1, Math.round(8 * (1 - t)));
    r(c, 32 - Math.floor(w / 2) + Math.round(drift * t), y, w, 1, y % 2 ? T3.iceMid : T3.iceLight);
  }
  px(c, 32 + drift, 55, T3.frostCore);
  // Jagged crystal core.
  spike(c, 21, cy, 23, 14, T3.outline);
  spike(c, 22, cy, 21, 12, T3.iceDark);
  spike(c, 25, cy - 1, 11, 8, T3.iceMid);
  spikeDown(c, 21, cy + 1, 23, 11, T3.outline);
  spikeDown(c, 22, cy + 1, 21, 9, T3.iceDark);
  spikeDown(c, 26, cy + 1, 11, 5, T3.iceMid);
  px(c, 27, cy - 6, T3.iceBright);
  px(c, 28, cy - 8, T3.white);
  // Orbiting shard satellites.
  const orbit: Pt[] = [[-14, -5], [12, -9], [13, 4], [-12, 6]];
  orbit.forEach(([ox, oy], i) => {
    const k = (i + f) % 4;
    spike(c, 31 + ox, cy + oy + (k === 0 ? -1 : 0), 3, 5, k % 2 ? T3.iceLight : T3.frost, T3.white);
  });
  if (d === 'front') {
    box(c, 27, cy - 7, 11, 8, T3.iceDeep);
    r(c, 29, cy - 6, 7, 6, T3.frost);
    r(c, 30, cy - 5, 5, 4, T3.frostCore);
    r(c, 32, cy - 6, 1, 6, T3.outline); // slit pupil
    r(c, 26, cy + 2, 13, 3, T3.maw);
    for (let x = 26; x < 39; x += 2) px(c, x, cy + 2, T3.white);
    for (let x = 27; x < 39; x += 2) px(c, x, cy + 4, T3.white);
  } else if (d === 'back') {
    r(c, 32, cy - 10, 1, 19, T3.iceDeep);
    px(c, 31, cy - 6, T3.iceDeep);
    px(c, 33, cy - 2, T3.iceDeep);
    px(c, 30, cy + 3, T3.iceDeep);
    if (f % 2 === 0) r(c, 32, cy - 7, 1, 12, T3.frost);
  } else {
    box(c, 33, cy - 6, 7, 6, T3.iceDeep);
    r(c, 35, cy - 5, 4, 4, T3.frost);
    r(c, 37, cy - 5, 1, 4, T3.outline);
    r(c, 33, cy + 2, 9, 2, T3.maw);
    px(c, 34, cy + 2, T3.white);
    px(c, 36, cy + 3, T3.white);
    px(c, 38, cy + 2, T3.white);
    px(c, 40, cy + 3, T3.white);
  }
  motes(c, f, [[16, 30], [46, 26], [41, 44], [21, 46], [36, 12]], T3.frost);
}

/* ============================================================ 22 Snow Wolf */
function snowWolf(c: Ctx, f: number, d: Dir) {
  const bob = f % 2 ? -1 : 0;
  shadow(c, 19, 0.36);
  if (d === 'side') {
    const tw = [0, -2, -1, 1][f];
    r(c, 6, 31 + bob + tw, 12, 4, T3.furMid);
    r(c, 3, 30 + bob + tw, 5, 3, T3.furLight);
    px(c, 2, 30 + bob + tw, T3.iceBright);
    legsSide(c, (f + 2) % 4, 20, 39, 3, T3.furMid, T3.furDark, T3.furLight, T3.furDark);
    legsSide(c, f, 38, 39, 3, T3.furMid, T3.furDark, T3.furLight, T3.furDark);
    mass(c, 14, 28 + bob, 31, 13, T3.furDark, T3.furMid, T3.furLight);
    r(c, 17, 37 + bob, 23, 3, T3.snowShade);
    for (let i = 0; i < 5; i++) spike(c, 17 + i * 5, 28 + bob, 3, 3 + (i % 2) * 2, T3.iceLight, T3.white);
    mass(c, 39, 22 + bob, 10, 13, T3.furDark, T3.furMid, T3.furLight);
    mass(c, 43, 20 + bob, 12, 9, T3.furDark, T3.furMid, T3.furLight);
    box(c, 53, 23 + bob, 8, 5, T3.furLight);
    px(c, 60, 23 + bob, T3.outline);
    const open = f % 2;
    r(c, 53, 28 + bob, 7, 1 + open, T3.maw);
    fang(c, 54, 28 + bob, 2);
    fang(c, 58, 28 + bob, 2);
    spike(c, 44, 20 + bob, 3, 5, T3.furDark);
    spike(c, 47, 20 + bob, 3, 4, T3.furMid);
    eye(c, 50, 22 + bob, T3.frost, T3.frostCore, f);
    r(c, 49, 21 + bob, 4, 1, T3.outline);
    breath(c, 61, 26 + bob, f, 0, -1);
    return;
  }
  const back = d === 'back';
  if (!back) {
    legsFB(c, (f + 2) % 4, 32, 40, 4, 3, T3.furDark, T3.outline, T3.furMid, false);
    mass(c, 19, 28 + bob, 26, 14, T3.furDark, T3.furMid, T3.furLight);
    legsFB(c, f, 32, 42, 7, 4, T3.furMid, T3.furDark, T3.furLight, false);
    for (let i = 0; i < 6; i++) spikeDown(c, 23 + i * 3, 38 + bob, 3, 4, T3.snow);
    mass(c, 22, 16 + bob, 20, 15, T3.furDark, T3.furMid, T3.furLight);
    spike(c, 22, 18 + bob, 5, 8, T3.furDark);
    spike(c, 37, 18 + bob, 5, 8, T3.furDark);
    px(c, 24, 12 + bob, T3.iceLight);
    px(c, 39, 12 + bob, T3.iceLight);
    box(c, 27, 24 + bob, 10, 8, T3.furLight);
    r(c, 30, 24 + bob, 4, 2, T3.outline);
    r(c, 28, 28 + bob, 8, 2 + (f % 2), T3.maw);
    fang(c, 28, 28 + bob, 3);
    fang(c, 35, 28 + bob, 3);
    eye(c, 25, 20 + bob, T3.frost, T3.frostCore, f);
    eye(c, 37, 20 + bob, T3.frost, T3.frostCore, f);
    r(c, 24, 19 + bob, 4, 1, T3.outline);
    r(c, 36, 19 + bob, 4, 1, T3.outline);
    px(c, 26 - f, 34 + bob, T3.iceBright);
    px(c, 38 + f, 34 + bob, T3.iceBright);
  } else {
    legsFB(c, f, 32, 42, 7, 4, T3.furMid, T3.furDark, T3.furLight, true);
    mass(c, 18, 26 + bob, 28, 16, T3.furDark, T3.furMid, T3.furLight);
    mass(c, 25, 16 + bob, 14, 11, T3.furDark, T3.furMid, T3.furLight);
    spike(c, 24, 18 + bob, 5, 8, T3.furDark);
    spike(c, 35, 18 + bob, 5, 8, T3.furDark);
    for (let i = 0; i < 4; i++) spike(c, 30, 30 + bob + i * 3, 4, 3, T3.iceLight, T3.white);
    legsFB(c, (f + 2) % 4, 32, 40, 5, 4, T3.furMid, T3.furDark, T3.furLight, true);
    const tw = [-3, 0, 3, 0][f];
    r(c, 30 + tw, 36 + bob, 4, 10, T3.furMid);
    r(c, 30 + tw, 44 + bob, 4, 3, T3.furLight);
    px(c, 31 + tw, 47 + bob, T3.iceBright);
  }
}

/* ============================================================ 23 Yeti Marauder */
function yeti(c: Ctx, f: number, d: Dir) {
  const bob = f % 2 ? -1 : 0;
  const swing = [2, 0, -2, 0][f];
  const clubY = f < 2 ? 6 : 12;
  shadow(c, 20, 0.42);
  if (d === 'side') {
    legsSide(c, f, 26, 42, 7, T3.furLight, T3.snowShade, T3.furDark, T3.skin);
    mass(c, 14, 22 + bob, 28, 22, T3.furMid, T3.snow, T3.white);
    for (let x = 15; x < 41; x += 3) spikeDown(c, x, 43 + bob, 3, 3, T3.snowShade);
    for (let y = 24; y < 40; y += 4) spikeSide(c, 13, y + bob, 4, 3, T3.snowShade, -1);
    mass(c, 38, 15 + bob, 14, 13, T3.furMid, T3.snow, T3.white);
    box(c, 45, 18 + bob, 8, 8, T3.skin);
    spike(c, 39, 15 + bob, 4, 7, T3.boneShade, T3.bone);
    eye(c, 48, 19 + bob, T3.frost, T3.frostCore, f);
    r(c, 47, 18 + bob, 4, 1, T3.outline);
    r(c, 47, 23 + bob, 6, 2 + (f % 2), T3.maw);
    fang(c, 48, 23 + bob, 3);
    fang(c, 51, 23 + bob, 2);
    // Long near arm + ice-boulder club.
    mass(c, 34, 25 + bob + swing, 8, 20, T3.furMid, T3.snow, T3.white);
    r(c, 44, clubY + 6 + bob, 3, 26, T3.boneShade);
    mass(c, 40, clubY + bob, 12, 10, T3.iceDark, T3.iceMid, T3.iceLight);
    spike(c, 42, clubY + bob, 3, 4, T3.iceLight, T3.white);
    spike(c, 47, clubY + bob, 3, 5, T3.iceLight, T3.white);
    breath(c, 55, 22 + bob, f, 1, 0);
    return;
  }
  const back = d === 'back';
  legsFB(c, f, 32, 42, 3, 7, T3.furLight, T3.snowShade, T3.skin, back);
  mass(c, 10, 24 + bob + swing, 8, 21, T3.furMid, T3.snow, T3.white);
  mass(c, 46, 24 + bob - swing, 8, 21, T3.furMid, T3.snow, T3.white);
  mass(c, 16, 21 + bob, 32, 24, T3.furMid, T3.snow, T3.white);
  for (let x = 17; x < 46; x += 3) spikeDown(c, x, 44 + bob, 3, 3, T3.snowShade);
  for (let i = 0; i < 3; i++) {
    px(c, 11 + i * 2, 45 + bob + swing, T3.iceLight);
    px(c, 47 + i * 2, 45 + bob - swing, T3.iceLight);
  }
  // Curled ram horns (visible from both sides).
  spike(c, 18, 16 + bob, 5, 8, T3.boneShade, T3.bone);
  spike(c, 41, 16 + bob, 5, 8, T3.boneShade, T3.bone);
  mass(c, 23, 10 + bob, 18, 15, T3.furMid, T3.snow, T3.white);
  if (!back) {
    box(c, 25, 14 + bob, 14, 10, T3.skin);
    eye(c, 27, 16 + bob, T3.frost, T3.frostCore, f);
    eye(c, 35, 16 + bob, T3.frost, T3.frostCore, f);
    r(c, 26, 15 + bob, 4, 1, T3.outline);
    r(c, 34, 15 + bob, 4, 1, T3.outline);
    r(c, 28, 20 + bob, 8, 2 + (f % 2), T3.maw);
    fang(c, 28, 20 + bob, 3);
    fang(c, 35, 20 + bob, 3);
    // Trophy necklace of small skulls.
    for (let i = 0; i < 4; i++) {
      box(c, 22 + i * 5, 27 + bob, 4, 4, T3.bone);
      px(c, 23 + i * 5, 28 + bob, T3.outline);
      px(c, 24 + i * 5, 28 + bob, T3.outline);
    }
  } else {
    for (let row = 0; row < 4; row++) {
      for (let x = 19 + (row % 2) * 2; x < 45; x += 4) spikeDown(c, x, 24 + bob + row * 5, 4, 4, T3.snowShade);
    }
    r(c, 31, 12 + bob, 2, 32, T3.furMid); // spine ridge
  }
  r(c, 52, clubY + 6 + bob, 3, 28, T3.boneShade);
  mass(c, 47, clubY + bob, 13, 10, T3.iceDark, T3.iceMid, T3.iceLight);
  spike(c, 49, clubY + bob, 3, 4, T3.iceLight, T3.white);
  spike(c, 54, clubY + bob, 3, 5, T3.iceLight, T3.white);
}

/* ============================================================ 24 Ice Drake */
function drake(c: Ctx, f: number, d: Dir) {
  const bob = f % 2 ? -1 : 0;
  const flap = [-11, -5, 3, -5][f];
  shadow(c, 20, 0.36);
  if (d === 'side') {
    wing(c, 30, 26 + bob, 18, flap - 2, T3.iceDark, T3.iceDeep, -1);
    const tw = [0, 1, 0, -1][f];
    for (let i = 0; i < 6; i++) {
      r(c, 18 - i * 3, 36 + bob + tw * (i > 2 ? 1 : 0) - Math.floor(i / 2), 4, 4 - Math.floor(i / 3), T3.iceDark);
      if (i % 2 === 0) spike(c, 18 - i * 3, 36 + bob - Math.floor(i / 2), 3, 3, T3.iceLight);
    }
    legsSide(c, (f + 2) % 4, 24, 40, 4, T3.iceMid, T3.iceDark, T3.iceLight, T3.iceDeep);
    legsSide(c, f, 38, 40, 3, T3.iceMid, T3.iceDark, T3.iceLight, T3.iceDeep);
    mass(c, 19, 29 + bob, 24, 13, T3.iceDeep, T3.iceDark, T3.iceMid);
    for (let x = 22; x < 40; x += 3) r(c, x, 38 + bob, 2, 2, T3.iceLight);
    mass(c, 38, 20 + bob, 7, 14, T3.iceDeep, T3.iceDark, T3.iceMid);
    mass(c, 41, 14 + bob, 14, 9, T3.iceDeep, T3.iceDark, T3.iceMid);
    box(c, 53, 17 + bob, 7, 5, T3.iceMid);
    spikeSide(c, 42, 11 + bob, 8, 3, T3.iceLight, -1);
    spikeSide(c, 45, 12 + bob, 6, 2, T3.white, -1);
    eye(c, 49, 16 + bob, T3.frostCore, T3.frost, f);
    r(c, 53, 21 + bob, 7, 1 + (f % 2), T3.maw);
    fang(c, 54, 21 + bob, 2);
    fang(c, 57, 21 + bob, 2);
    if (f >= 2) for (let i = 0; i < 4; i++) px(c, 60 + (i % 2), 20 + bob + i - 1, i % 2 ? T3.frost : T3.frostCore);
    wing(c, 29, 27 + bob, 18, flap, T3.iceMid, T3.iceDark, -1);
    return;
  }
  const back = d === 'back';
  wing(c, 23, 25 + bob, 20, flap, back ? T3.iceMid : T3.iceLight, back ? T3.iceDeep : T3.iceDark, -1);
  wing(c, 41, 25 + bob, 20, flap, back ? T3.iceMid : T3.iceLight, back ? T3.iceDeep : T3.iceDark, 1);
  legsFB(c, f, 32, 40, 4, 5, T3.iceMid, T3.iceDark, T3.iceLight, back);
  mass(c, 21, 24 + bob, 22, 19, T3.iceDeep, T3.iceDark, T3.iceMid);
  if (!back) {
    for (let y = 28; y < 41; y += 3) r(c, 27, y + bob, 10, 2, T3.iceLight);
    mass(c, 24, 11 + bob, 16, 13, T3.iceDeep, T3.iceDark, T3.iceMid);
    spike(c, 22, 13 + bob, 4, 7, T3.iceLight, T3.white);
    spike(c, 38, 13 + bob, 4, 7, T3.iceLight, T3.white);
    eye(c, 27, 15 + bob, T3.frostCore, T3.frost, f);
    eye(c, 35, 15 + bob, T3.frostCore, T3.frost, f);
    r(c, 28, 19 + bob, 8, 2 + (f % 2), T3.maw);
    fang(c, 28, 19 + bob, 3);
    fang(c, 35, 19 + bob, 3);
    if (f >= 2) breath(c, 32, 23 + bob, f, 0, 1);
  } else {
    mass(c, 25, 12 + bob, 14, 12, T3.iceDeep, T3.iceDark, T3.iceMid);
    spike(c, 23, 14 + bob, 4, 7, T3.iceLight, T3.white);
    spike(c, 37, 14 + bob, 4, 7, T3.iceLight, T3.white);
    for (let i = 0; i < 6; i++) spike(c, 30, 26 + bob + i * 3, 4, 3, T3.iceLight, T3.white);
    const tw = [-3, 0, 3, 0][f];
    r(c, 30 + tw, 42 + bob, 4, 10, T3.iceDark);
    spikeDown(c, 29 + tw, 52 + bob, 6, 3, T3.iceLight);
  }
}

/* ============================================================ 25 Glacier Golem */
function golem(c: Ctx, f: number, d: Dir) {
  const bob = f % 2 ? -1 : 0;
  const swing = [3, 0, -3, 0][f];
  const pulse = f % 2 === 0 ? T3.frost : T3.frostCore;
  shadow(c, 23, 0.5);
  if (d === 'side') {
    legsSide(c, f, 28, 42, 8, T3.iceMid, T3.iceDark, T3.iceLight, T3.iceDeep);
    mass(c, 14, 15 + bob, 30, 29, T3.iceDeep, T3.iceDark, T3.iceMid);
    spike(c, 16, 16 + bob, 6, 10, T3.iceLight, T3.white);
    spike(c, 23, 16 + bob, 5, 7, T3.iceMid, T3.white);
    spike(c, 31, 16 + bob, 7, 12, T3.iceLight, T3.white);
    // Frozen corpse face half-visible through the flank.
    box(c, 24, 25 + bob, 10, 9, T3.iceMid);
    r(c, 25, 26 + bob, 8, 6, T3.bone);
    r(c, 30, 27 + bob, 2, 2, T3.outline);
    r(c, 26, 30 + bob, 6, 1, T3.boneShade);
    mass(c, 38, 17 + bob, 11, 9, T3.iceDeep, T3.iceDark, T3.iceMid);
    r(c, 43, 20 + bob, 5, 2, pulse);
    mass(c, 38, 28 + bob + swing, 14, 15, T3.iceDeep, T3.iceDark, T3.iceMid);
    spike(c, 41, 28 + bob + swing, 3, 4, T3.iceLight);
    spike(c, 46, 28 + bob + swing, 3, 4, T3.iceLight);
    r(c, 20, 36 + bob, 1, 6, pulse);
    r(c, 21, 40 + bob, 4, 1, pulse);
    return;
  }
  const back = d === 'back';
  legsFB(c, f, 32, 44, 4, 8, T3.iceMid, T3.iceDark, T3.iceLight, back);
  mass(c, 3, 20 + bob + swing, 11, 25, T3.iceDeep, T3.iceDark, T3.iceMid);
  mass(c, 50, 20 + bob - swing, 11, 25, T3.iceDeep, T3.iceDark, T3.iceMid);
  for (let i = 0; i < 3; i++) {
    spike(c, 4 + i * 3, 45 + bob + swing, 3, 3, T3.iceLight);
    spike(c, 51 + i * 3, 45 + bob - swing, 3, 3, T3.iceLight);
  }
  mass(c, 12, 14 + bob, 40, 31, T3.iceDeep, T3.iceDark, T3.iceMid);
  const shoulders: Array<[number, number, number]> = [[11, 5, 11], [17, 4, 7], [42, 4, 8], [47, 5, 12]];
  for (const [x, w, h] of shoulders) spike(c, x, 16 + bob, w, h, T3.iceLight, T3.white);
  mass(c, 26, 7 + bob, 12, 10, T3.iceDeep, T3.iceDark, T3.iceMid);
  if (!back) {
    r(c, 28, 11 + bob, 8, 2, pulse);
    // Translucent chest holding a frozen skull — the golem's grim trophy.
    box(c, 24, 21 + bob, 16, 14, T3.iceMid);
    r(c, 25, 22 + bob, 14, 12, T3.iceLight);
    box(c, 27, 23 + bob, 10, 9, T3.bone);
    r(c, 28, 25 + bob, 3, 3, T3.outline);
    r(c, 33, 25 + bob, 3, 3, T3.outline);
    px(c, 29, 26 + bob, pulse);
    px(c, 34, 26 + bob, pulse);
    for (let x = 28; x < 36; x += 2) px(c, x, 30 + bob, T3.outline);
    r(c, 31, 35 + bob, 2, 8, pulse);
    r(c, 28, 39 + bob, 8, 1, pulse);
  } else {
    for (let i = 0; i < 5; i++) spike(c, 16 + i * 7, 26 + bob + (i % 2) * 4, 5, 8 + (i % 2) * 3, T3.iceLight, T3.white);
    r(c, 31, 20 + bob, 2, 22, pulse);
    r(c, 25, 30 + bob, 14, 1, pulse);
    px(c, 27, 34 + bob, pulse);
    px(c, 37, 25 + bob, pulse);
  }
}

/* ============================================================ 26 Frost Valkyrie */
function valkyrie(c: Ctx, f: number, d: Dir) {
  const bob = f % 2 ? -1 : 0;
  const flap = [-8, -3, 2, -3][f];
  shadow(c, 16, 0.38);
  if (d === 'side') {
    featherWing(c, 26, 22 + bob, 17, flap - 3, -1);
    const cape = [0, -2, -3, -1][f];
    r(c, 14 + cape, 26 + bob, 10, 20, T3.iceDark);
    spikeDown(c, 14 + cape, 46 + bob, 4, 3, T3.iceDark);
    spikeDown(c, 19 + cape, 46 + bob, 4, 4, T3.iceDark);
    legsSide(c, f, 28, 42, 4, T3.steelLight, T3.steel, T3.steelLight, T3.steelDark);
    mass(c, 22, 24 + bob, 14, 19, T3.steelDark, T3.steel, T3.steelLight);
    r(c, 24, 30 + bob, 10, 2, T3.frost);
    mass(c, 26, 12 + bob, 12, 12, T3.steelDark, T3.steel, T3.steelLight);
    r(c, 33, 16 + bob, 5, 6, T3.snow);
    eye(c, 35, 17 + bob, T3.frostCore, T3.frost, f);
    spikeSide(c, 25, 11 + bob, 7, 4, T3.white, -1);
    r(c, 20, 20 + bob, 6, 3, T3.snow); // braid
    r(c, 18, 22 + bob, 3, 8, T3.snow);
    const spearY = f < 2 ? 26 : 28;
    r(c, 30, spearY + bob, 30, 2, T3.steelLight);
    spikeSide(c, 55, spearY - 2 + bob, 8, 6, T3.frost, 1);
    px(c, 62, spearY + bob, T3.frostCore);
    featherWing(c, 25, 23 + bob, 17, flap, -1);
    return;
  }
  const back = d === 'back';
  featherWing(c, 24, 21 + bob, 21, flap, -1);
  featherWing(c, 40, 21 + bob, 21, flap, 1);
  legsFB(c, f, 32, 42, 2, 5, T3.steelLight, T3.steel, T3.steelDark, back);
  mass(c, 22, 22 + bob, 20, 21, T3.steelDark, T3.steel, T3.steelLight);
  if (!back) {
    r(c, 26, 27 + bob, 12, 2, T3.frost);
    r(c, 31, 24 + bob, 2, 16, T3.iceLight);
    for (let x = 23; x < 41; x += 3) spikeDown(c, x, 42 + bob, 3, 4, T3.steel);
    // Round shield with a frost rune.
    box(c, 11, 28 + bob, 11, 12, T3.iceDark);
    r(c, 15, 30 + bob, 3, 8, T3.frost);
    r(c, 13, 33 + bob, 7, 2, T3.frost);
  } else {
    box(c, 23, 23 + bob, 18, 24, T3.iceDark);
    for (let x = 23; x < 41; x += 4) spikeDown(c, x, 47 + bob, 4, 4, T3.iceDark);
    for (let y = 27; y < 44; y += 5) r(c, 26, y + bob, 12, 1, T3.iceMid);
    r(c, 31, 20 + bob, 2, 18, T3.snow); // braid down the back
  }
  mass(c, 25, 9 + bob, 14, 14, T3.steelDark, T3.steel, T3.steelLight);
  spikeSide(c, 24, 9 + bob, 8, 5, T3.white, -1);
  spikeSide(c, 39, 9 + bob, 8, 5, T3.white, 1);
  if (!back) {
    r(c, 27, 13 + bob, 10, 8, T3.snow);
    r(c, 27, 13 + bob, 10, 2, T3.steelDark); // helm brow
    eye(c, 28, 16 + bob, T3.frostCore, T3.frost, f);
    eye(c, 34, 16 + bob, T3.frostCore, T3.frost, f);
    r(c, 30, 20 + bob, 4, 1, T3.snowShade);
  }
  const spearY = f < 2 ? 2 : 4;
  r(c, 50, spearY + 6 + bob, 2, 46, T3.steelLight);
  spike(c, 48, spearY + 7 + bob, 6, 8, T3.frost, T3.frostCore);
}

/* ============================================================ 27 Blizzard Shaman */
function shaman(c: Ctx, f: number, d: Dir) {
  const bob = f % 2 ? -1 : 0;
  shadow(c, 16, 0.36);
  const orbX = d === 'side' ? 52 : 50;
  const orbY = 12 + bob;
  // Blizzard swirl orbiting the whole figure.
  for (let i = 0; i < 10; i++) {
    const a = (f * Math.PI) / 4 + (i * Math.PI) / 5;
    px(c, Math.round(32 + Math.cos(a) * 24), Math.round(30 + Math.sin(a) * 18), i % 3 ? T3.snow : T3.rune);
  }
  if (d === 'side') {
    legsSide(c, f, 26, 46, 3, T3.bone, T3.boneShade, T3.boneShade, T3.skin);
    mass(c, 16, 24 + bob, 22, 24, T3.furDark, T3.furMid, T3.furLight);
    for (let x = 17; x < 37; x += 3) spikeDown(c, x, 47 + bob, 3, 4, T3.furDark);
    for (let i = 0; i < 3; i++) {
      r(c, 18 + i * 5, 36 + bob, 1, 4 + (i + f) % 2, T3.boneShade);
      box(c, 17 + i * 5, 40 + bob + ((i + f) % 2), 3, 3, T3.bone);
    }
    mass(c, 30, 16 + bob, 12, 11, T3.furDark, T3.furMid, T3.furLight);
    box(c, 36, 18 + bob, 9, 7, T3.bone);
    r(c, 39, 20 + bob, 2, 2, T3.outline);
    px(c, 39, 20 + bob, f % 2 ? T3.rune : T3.runeDeep);
    r(c, 42, 23 + bob, 3, 1, T3.outline);
    spike(c, 31, 16 + bob, 3, 8, T3.boneShade, T3.bone);
    spike(c, 35, 16 + bob, 3, 6, T3.boneShade, T3.bone);
    r(c, 37, 26 + bob, 3, 9, T3.bone);
    r(c, orbX, orbY + 5, 2, 56 - (orbY + 5), T3.boneShade);
  } else {
    const back = d === 'back';
    legsFB(c, f, 32, 46, 3, 3, T3.bone, T3.boneShade, T3.skin, back);
    mass(c, 18, 22 + bob, 28, 26, T3.furDark, T3.furMid, T3.furLight);
    for (let x = 19; x < 45; x += 3) spikeDown(c, x, 47 + bob, 3, 4, T3.furDark);
    for (let i = 0; i < 4; i++) {
      const hang = (i + f) % 2;
      r(c, 21 + i * 6, 34 + bob, 1, 4 + hang, T3.boneShade);
      box(c, 20 + i * 6, 38 + bob + hang, 3, 3, T3.bone);
    }
    mass(c, 24, 11 + bob, 16, 14, T3.furDark, T3.furMid, T3.furLight);
    // Branching antlers.
    for (const s of [-1, 1] as const) {
      const bx = s < 0 ? 20 : 41;
      r(c, bx, 4 + bob, 3, 10, T3.boneShade);
      r(c, bx + s * 3, 6 + bob, 4, 2, T3.boneShade);
      r(c, bx + s * 5, 2 + bob, 2, 5, T3.bone);
      px(c, bx + 1, 3 + bob, T3.bone);
    }
    if (!back) {
      box(c, 25, 14 + bob, 14, 11, T3.bone);
      r(c, 27, 17 + bob, 3, 3, T3.outline);
      r(c, 34, 17 + bob, 3, 3, T3.outline);
      px(c, 28, 18 + bob, f % 2 ? T3.rune : T3.runeDeep);
      px(c, 35, 18 + bob, f % 2 ? T3.rune : T3.runeDeep);
      r(c, 30, 21 + bob, 4, 2, T3.boneShade);
      for (let x = 28; x < 37; x += 2) px(c, x, 24 + bob, T3.white);
      r(c, 15, 30 + bob, 4, 8, T3.bone);
    } else {
      r(c, 31, 12 + bob, 2, 34, T3.furMid);
      for (let y = 26; y < 44; y += 6) {
        box(c, 30, y + bob, 4, 4, T3.bone);
        px(c, 31, y + 1 + bob, T3.rune);
      }
    }
    r(c, orbX, orbY + 5, 2, 56 - (orbY + 5), T3.boneShade);
  }
  // Staff orb: violet storm core with frost ring.
  box(c, orbX - 3, orbY - 3, 8, 8, T3.runeDeep);
  r(c, orbX - 1, orbY - 1, 4, 4, f % 2 ? T3.rune : T3.frost);
  px(c, orbX, orbY, T3.white);
  const ring: Pt[] = [[-5, 0], [0, -5], [5, 0], [0, 5]];
  ring.forEach(([dx, dy], i) => {
    if ((i + f) % 2 === 0) px(c, orbX + dx, orbY + dy, T3.frost);
  });
}

/* ============================================================ 28 Crystal Behemoth */
function behemoth(c: Ctx, f: number, d: Dir) {
  const bob = f % 2 ? -1 : 0;
  shadow(c, 25, 0.52);
  const glint = f % 2 ? T3.white : T3.frost;
  if (d === 'side') {
    legsSide(c, (f + 2) % 4, 14, 40, 6, T3.furMid, T3.furDark, T3.skin, T3.outline);
    legsSide(c, f, 38, 40, 6, T3.furMid, T3.furDark, T3.skin, T3.outline);
    mass(c, 7, 20 + bob, 40, 22, T3.furDark, T3.furMid, T3.furLight);
    for (let x = 8; x < 46; x += 3) spikeDown(c, x, 41 + bob, 3, 4, T3.furDark);
    const crystals: Array<[number, number, number]> = [[10, 5, 9], [16, 6, 14], [23, 5, 10], [29, 7, 16], [37, 5, 9]];
    for (const [x, w, h] of crystals) {
      spike(c, x, 21 + bob, w, h, T3.iceMid, T3.white);
      r(c, x + 1, 19 + bob, 1, 2, glint);
    }
    mass(c, 44, 22 + bob, 14, 15, T3.furDark, T3.furMid, T3.furLight);
    spikeSide(c, 56, 24 + bob, 8, 7, T3.iceLight, 1); // nose crystal horn
    px(c, 62, 27 + bob, T3.white);
    r(c, 47, 34 + bob, 12, 3, T3.bone); // tusk
    spike(c, 57, 34 + bob, 3, 4, T3.bone);
    eye(c, 50, 26 + bob, T3.crimson, T3.crimsonDeep, f);
    r(c, 49, 25 + bob, 4, 1, T3.outline);
    breath(c, 58, 31 + bob, f, 1, 1);
    return;
  }
  const back = d === 'back';
  if (!back) {
    legsFB(c, (f + 2) % 4, 32, 40, 8, 5, T3.furDark, T3.outline, T3.skin, false);
    mass(c, 8, 18 + bob, 48, 24, T3.furDark, T3.furMid, T3.furLight);
    for (let i = 0; i < 6; i++) spike(c, 9 + i * 8, 19 + bob, 5, 9 + (i % 2) * 5, T3.iceMid, T3.white);
    legsFB(c, f, 32, 42, 11, 7, T3.furMid, T3.furDark, T3.skin, false);
    mass(c, 20, 20 + bob, 24, 20, T3.furDark, T3.furMid, T3.furLight);
    spike(c, 27, 22 + bob, 10, 16, T3.iceLight, T3.white); // central horn
    r(c, 31, 10 + bob, 2, 4, glint);
    // Curved tusks.
    r(c, 16, 34 + bob, 8, 3, T3.bone);
    spike(c, 14, 34 + bob, 3, 6, T3.bone);
    r(c, 40, 34 + bob, 8, 3, T3.bone);
    spike(c, 47, 34 + bob, 3, 6, T3.bone);
    eye(c, 24, 27 + bob, T3.crimson, T3.crimsonDeep, f);
    eye(c, 38, 27 + bob, T3.crimson, T3.crimsonDeep, f);
    r(c, 23, 26 + bob, 4, 1, T3.outline);
    r(c, 37, 26 + bob, 4, 1, T3.outline);
    r(c, 28, 34 + bob, 8, 2, T3.maw);
    px(c, 26 - f, 39 + bob, T3.iceBright);
    px(c, 38 + f, 39 + bob, T3.iceBright);
  } else {
    legsFB(c, f, 32, 42, 11, 7, T3.furMid, T3.furDark, T3.skin, true);
    mass(c, 8, 16 + bob, 48, 27, T3.furDark, T3.furMid, T3.furLight);
    for (let x = 9; x < 55; x += 3) spikeDown(c, x, 42 + bob, 3, 4, T3.furDark);
    const ridge: Array<[number, number, number]> = [[12, 6, 11], [20, 7, 16], [28, 8, 20], [37, 7, 15], [45, 6, 10]];
    for (const [x, w, h] of ridge) {
      spike(c, x, 18 + bob, w, h, T3.iceMid, T3.white);
      r(c, x + Math.floor(w / 2), 18 + bob - Math.floor(h / 2), 1, 3, glint);
    }
    legsFB(c, (f + 2) % 4, 32, 40, 7, 6, T3.furMid, T3.furDark, T3.skin, true);
    const tw = [-2, 0, 2, 0][f];
    r(c, 31 + tw, 30 + bob, 3, 10, T3.furDark);
    spikeDown(c, 30 + tw, 40 + bob, 5, 3, T3.furLight);
  }
}

/* ============================================================ 29 Lich of Frost */
function lich(c: Ctx, f: number, d: Dir) {
  const bob = f % 2 ? -1 : 0;
  shadow(c, 17, 0.4);
  const flame = f % 2 ? T3.rune : T3.frostCore;
  // Orbiting ice shards around the lich.
  for (let i = 0; i < 4; i++) {
    const a = (f * Math.PI) / 2 + (i * Math.PI) / 2;
    spike(c, Math.round(31 + Math.cos(a) * 21), Math.round(30 + Math.sin(a) * 9), 3, 5, T3.iceLight, T3.white);
  }
  if (d === 'side') {
    legsSide(c, f, 27, 46, 2, T3.bone, T3.boneShade, T3.bone, T3.boneShade);
    const tat = [0, -1, -2, -1][f];
    mass(c, 18, 22 + bob, 20, 26, T3.iceDeep, T3.runeDeep, T3.rune);
    for (let x = 18 + tat; x < 38; x += 3) spikeDown(c, x, 47 + bob, 3, 4, T3.runeDeep);
    r(c, 22, 30 + bob, 12, 1, T3.frost);
    box(c, 28, 11 + bob, 12, 12, T3.bone);
    r(c, 29, 12 + bob, 10, 3, T3.snow);
    r(c, 34, 15 + bob, 3, 3, T3.outline);
    px(c, 35, 16 + bob, flame);
    px(c, 36, 13 + bob, flame);
    r(c, 34, 20 + bob, 6, 2, T3.boneShade);
    for (let x = 34; x < 40; x += 2) px(c, x, 20 + bob, T3.outline);
    for (let i = 0; i < 4; i++) spike(c, 28 + i * 3, 12 + bob, 2, 4 + (i % 2) * 3, T3.iceLight, T3.white);
    r(c, 38, 26 + bob, 8, 2, T3.bone);
    r(c, 46, 8 + bob, 2, 47 - bob, T3.boneShade);
    box(c, 43, 3 + bob, 8, 7, T3.bone);
    px(c, 45, 5 + bob, flame);
    px(c, 48, 5 + bob, flame);
    return;
  }
  const back = d === 'back';
  legsFB(c, f, 32, 46, 3, 2, T3.bone, T3.boneShade, T3.bone, back);
  mass(c, 17, 21 + bob, 30, 27, T3.iceDeep, T3.runeDeep, T3.rune);
  for (let x = 17 + (f % 2); x < 47; x += 3) spikeDown(c, x, 47 + bob, 3, 4, T3.runeDeep);
  if (!back) {
    // Robe torn open: ribcage and a pulsing phylactery heart.
    box(c, 25, 24 + bob, 14, 14, T3.outline);
    for (let y = 26; y < 37; y += 3) r(c, 26, y + bob, 12, 1, T3.bone);
    r(c, 31, 25 + bob, 2, 13, T3.bone);
    box(c, 29, 29 + bob, 6, 6, T3.runeDeep);
    r(c, 30, 30 + bob, 4, 4, flame);
    r(c, 13, 28 + bob, 5, 2, T3.bone);
    r(c, 12, 30 + bob, 2, 3, T3.bone);
  } else {
    for (let y = 26; y < 45; y += 6) r(c, 20, y + bob, 24, 1, T3.frost);
    r(c, 31, 22 + bob, 2, 24, T3.rune);
    box(c, 28, 30 + bob, 8, 8, T3.runeDeep);
    px(c, 31, 33 + bob, flame);
  }
  box(c, 24, 8 + bob, 16, 14, T3.bone);
  for (let i = 0; i < 5; i++) spike(c, 24 + i * 3, 9 + bob, 3, 5 + (i % 2) * 4, T3.iceLight, T3.white);
  if (!back) {
    r(c, 25, 10 + bob, 14, 3, T3.snow);
    r(c, 27, 13 + bob, 3, 4, T3.outline);
    r(c, 34, 13 + bob, 3, 4, T3.outline);
    px(c, 28, 14 + bob, flame);
    px(c, 35, 14 + bob, flame);
    px(c, 28, 11 + bob - (f % 2), flame);
    px(c, 35, 11 + bob - (f % 2), flame);
    r(c, 31, 17 + bob, 2, 2, T3.outline);
    r(c, 27, 19 + bob, 10, 2 + (f % 2), T3.outline);
    for (let x = 27; x < 37; x += 2) px(c, x, 19 + bob, T3.bone);
  } else {
    r(c, 31, 10 + bob, 2, 10, T3.boneShade);
  }
  r(c, 50, 8 + bob, 2, 47 - bob, T3.boneShade);
  box(c, 47, 2 + bob, 8, 7, T3.bone);
  px(c, 49, 4 + bob, flame);
  px(c, 52, 4 + bob, flame);
}

/* ============================================================ 30 BOSS Frost Dragon */
function dragon(c: Ctx, f: number, d: Dir) {
  const bob = f % 2 ? -1 : 0;
  const flap = [-12, -5, 4, -5][f];
  shadow(c, 27, 0.58);
  const eyeC = T3.crimson;
  if (d === 'side') {
    wing(c, 30, 20 + bob, 26, flap - 3, T3.iceDark, T3.iceDeep, -1);
    // Spiked tail along the ground to the left.
    for (let i = 0; i < 8; i++) {
      const tx = 16 - i * 2;
      const ty = 42 + Math.floor(i / 2) + ([0, 1, 0, -1][f] * (i > 4 ? 1 : 0));
      r(c, tx, ty + bob, 3, 5 - Math.floor(i / 3), T3.iceDark);
      if (i % 2 === 0) spike(c, tx, ty + bob, 3, 3, T3.iceLight, T3.white);
    }
    legsSide(c, (f + 2) % 4, 22, 40, 6, T3.iceMid, T3.iceDark, T3.iceLight, T3.iceDeep);
    legsSide(c, f, 36, 40, 6, T3.iceMid, T3.iceDark, T3.iceLight, T3.iceDeep);
    mass(c, 15, 24 + bob, 30, 20, T3.iceDeep, T3.iceDark, T3.iceMid);
    for (let x = 18; x < 42; x += 3) r(c, x, 39 + bob, 2, 3, T3.iceLight);
    for (let i = 0; i < 6; i++) spike(c, 17 + i * 5, 24 + bob, 4, 4 + (i % 2) * 3, T3.iceLight, T3.white);
    // Long neck rising to the right and a crowned, open maw.
    mass(c, 40, 13 + bob, 8, 20, T3.iceDeep, T3.iceDark, T3.iceMid);
    mass(c, 43, 5 + bob, 16, 11, T3.iceDeep, T3.iceDark, T3.iceMid);
    spikeSide(c, 44, 2 + bob, 10, 4, T3.iceLight, -1);
    spikeSide(c, 47, 4 + bob, 8, 3, T3.white, -1);
    eye(c, 52, 7 + bob, eyeC, T3.crimsonDeep, f);
    r(c, 51, 6 + bob, 4, 1, T3.outline);
    const open = f >= 2 ? 3 : 1;
    r(c, 52, 13 + bob, 8, open, T3.maw);
    fang(c, 53, 12 + bob, 3);
    fang(c, 56, 12 + bob, 3);
    fang(c, 59, 12 + bob, 2);
    if (f >= 2) {
      for (let i = 0; i < 6; i++) px(c, 60 + (i % 3), 12 + bob + Math.floor(i / 2), i % 2 ? T3.frost : T3.frostCore);
    }
    wing(c, 29, 22 + bob, 26, flap, T3.iceMid, T3.iceDark, -1);
    motes(c, f, [[12, 20], [34, 12], [58, 30], [6, 36]], T3.frost);
    return;
  }
  const back = d === 'back';
  wing(c, 22, 18 + bob, 22, flap, back ? T3.iceMid : T3.iceLight, back ? T3.iceDeep : T3.iceDark, -1);
  wing(c, 42, 18 + bob, 22, flap, back ? T3.iceMid : T3.iceLight, back ? T3.iceDeep : T3.iceDark, 1);
  if (!back) {
    const tw = [-4, 0, 4, 0][f];
    r(c, 40 + tw, 48, 12, 4, T3.iceDark); // tail tip behind the legs
    spike(c, 49 + tw, 48, 4, 4, T3.iceLight, T3.white);
  }
  legsFB(c, f, 32, 40, 5, 8, T3.iceMid, T3.iceDark, T3.iceLight, back);
  mass(c, 17, 22 + bob, 30, 22, T3.iceDeep, T3.iceDark, T3.iceMid);
  if (!back) {
    for (let y = 26; y < 42; y += 3) r(c, 25, y + bob, 14, 2, T3.iceLight);
    r(c, 31, 26 + bob, 2, 15, f % 2 ? T3.frost : T3.frostCore); // frost heart seam
    mass(c, 24, 7 + bob, 16, 15, T3.iceDeep, T3.iceDark, T3.iceMid);
    // Ice crown of horns.
    const horns: Array<[number, number, number]> = [[19, 4, 9], [23, 3, 7], [37, 3, 7], [41, 4, 9], [30, 4, 6]];
    for (const [x, w, h] of horns) spike(c, x, 9 + bob, w, h, T3.iceLight, T3.white);
    eye(c, 27, 12 + bob, eyeC, T3.crimsonDeep, f);
    eye(c, 35, 12 + bob, eyeC, T3.crimsonDeep, f);
    r(c, 26, 11 + bob, 4, 1, T3.outline);
    r(c, 34, 11 + bob, 4, 1, T3.outline);
    const open = f >= 2 ? 4 : 2;
    r(c, 27, 17 + bob, 10, open, T3.maw);
    for (let x = 27; x < 37; x += 2) fang(c, x, 17 + bob, 2);
    if (f >= 2) {
      // Frost breath cascading down toward the path.
      for (let i = 0; i < 8; i++) {
        px(c, 29 + (i % 4) * 2 - (i > 3 ? 1 : 0), 22 + bob + Math.floor(i / 2) + f, i % 2 ? T3.frost : T3.frostCore);
      }
    }
  } else {
    for (let i = 0; i < 7; i++) spike(c, 29, 24 + bob + i * 3, 6, 4, T3.iceLight, T3.white);
    mass(c, 25, 8 + bob, 14, 14, T3.iceDeep, T3.iceDark, T3.iceMid);
    const horns: Array<[number, number, number]> = [[20, 4, 9], [24, 3, 7], [37, 3, 7], [40, 4, 9]];
    for (const [x, w, h] of horns) spike(c, x, 10 + bob, w, h, T3.iceLight, T3.white);
    // Tail sweeping toward the viewer across the ground row.
    const tw = [-5, 0, 5, 0][f];
    r(c, 29 + Math.round(tw / 2), 42, 6, 6, T3.iceDark);
    r(c, 28 + tw, 48, 8, 5, T3.iceDark);
    spikeDown(c, 28 + tw, 53, 8, 3, T3.iceLight);
  }
  motes(c, f, [[8, 40], [56, 38], [14, 8], [50, 6]], T3.frost);
}

/* ============================================================ dispatcher */

export function drawTier3(c: Ctx, id: number, frame: number, direction: Dir) {
  const f = ((frame % 4) + 4) % 4;
  switch (id) {
    case 21: return frostWisp(c, f, direction);
    case 22: return snowWolf(c, f, direction);
    case 23: return yeti(c, f, direction);
    case 24: return drake(c, f, direction);
    case 25: return golem(c, f, direction);
    case 26: return valkyrie(c, f, direction);
    case 27: return shaman(c, f, direction);
    case 28: return behemoth(c, f, direction);
    case 29: return lich(c, f, direction);
    case 30: return dragon(c, f, direction);
  }
}

export const TIER3_DIRECTION_GUIDE: Record<Dir, string> = {
  front: 'Фронт ↓: моб идёт на игрока. Кадры 0 и 2 — поочерёдно поднятая левая и правая нога; опорная стопа стоит на y=56. Глаза мерцают, пасть открывается, на кадрах 2–3 появляется ледяное дыхание.',
  side: 'Бок →: моб идёт вправо. Цикл шага: опора ближней ноги → перенос → опора дальней ноги → перенос. Крылья, хвост, плащ и оружие движутся в противофазе к ногам.',
  back: 'Спина ↑: моб уходит вверх. На поднятой ноге видна тёмная подошва; хвост раскачивается, спинные кристаллы и руны пульсируют.',
};
