import {
  PALETTE,
  drawRect,
  drawPixel,
  drawOutlineRect,
  drawGroundShadow,
} from "./palette";
import {
  drawTier1Front,
  drawTier1Back,
  drawSlimeBack,
  drawGoblinBack,
  drawSkeletonBack,
  drawSpiderBack,
  drawOrcBack,
  drawWraithBack,
  drawKnightBack,
  drawMagmaBruteBack,
  drawNecromancerBack,
  drawBoneColossusBack,
} from "./tier1BackDrawers";
import { drawTier2Direction } from "./tier2Drawers";
import { drawTier3 } from "./tier3Drawers";
import { drawTier4 } from "./tier4Drawers";
import type { SpriteDirection } from "../types/mob.ts";

export type { SpriteDirection };
export const BASELINE_Y = 56;

let currentTier1Direction: SpriteDirection = "back";

export function setTier1Direction(dir: SpriteDirection) {
  currentTier1Direction = dir;
}

export function getTier1Direction(): SpriteDirection {
  return currentTier1Direction;
}

/**
 * 1. GREEN SLIME (Зеленый Слизень)
 * Small, gelatinous, bouncing with squish & stretch on baseline y=56.
 */
export function drawSlime(ctx: CanvasRenderingContext2D, frame: number) {
  // frame 0: contact squish (wide, short)
  // frame 1: upward stretch launching
  // frame 2: hop peak (slightly lifted off baseline with shadow)
  // frame 3: descent landing

  const cx = 32;
  const p = PALETTE;

  if (frame === 0) {
    // Squish
    drawGroundShadow(ctx, cx, 16, 4, BASELINE_Y, 0.4);
    // Outer slime body
    drawOutlineRect(ctx, 16, 40, 32, 16, p.slimeBase, p.slimeDark);
    drawRect(ctx, 18, 38, 28, 2, p.slimeDark);
    drawRect(ctx, 19, 39, 26, 2, p.slimeLight);
    // Highlights & interior
    drawRect(ctx, 20, 42, 24, 10, p.slimeLight);
    drawRect(ctx, 22, 44, 10, 3, p.slimeBright);
    drawPixel(ctx, 21, 43, p.white);
    drawPixel(ctx, 22, 43, p.white);
    // Core nucleus
    drawRect(ctx, 30, 46, 6, 6, p.slimeCore);
    drawPixel(ctx, 31, 47, p.slimeBright);
    // Eyes
    drawRect(ctx, 24, 45, 3, 4, p.slimeEye);
    drawPixel(ctx, 24, 45, p.white);
    drawRect(ctx, 36, 45, 3, 4, p.slimeEye);
    drawPixel(ctx, 36, 45, p.white);
    // Little bubbles
    drawPixel(ctx, 42, 43, p.slimeBright);
    drawPixel(ctx, 19, 50, p.slimeBright);
  } else if (frame === 1) {
    // Upward stretch
    drawGroundShadow(ctx, cx, 12, 3, BASELINE_Y, 0.35);
    drawOutlineRect(ctx, 20, 32, 24, 24, p.slimeBase, p.slimeDark);
    drawRect(ctx, 23, 30, 18, 3, p.slimeDark);
    drawRect(ctx, 24, 31, 16, 2, p.slimeLight);
    // Body interior
    drawRect(ctx, 22, 34, 20, 19, p.slimeLight);
    drawRect(ctx, 24, 34, 8, 4, p.slimeBright);
    drawPixel(ctx, 23, 33, p.white);
    // Core
    drawRect(ctx, 30, 42, 6, 8, p.slimeCore);
    drawPixel(ctx, 31, 43, p.slimeBright);
    // Eyes looking up
    drawRect(ctx, 26, 38, 3, 5, p.slimeEye);
    drawPixel(ctx, 26, 38, p.white);
    drawRect(ctx, 35, 38, 3, 5, p.slimeEye);
    drawPixel(ctx, 35, 38, p.white);
    // Drip
    drawPixel(ctx, 21, 55, p.slimeDark);
  } else if (frame === 2) {
    // Hop peak (body 4px off baseline, ground shadow stays at y=56)
    drawGroundShadow(ctx, cx, 9, 2.5, BASELINE_Y, 0.25);
    const yOff = -6;
    drawOutlineRect(ctx, 19, 34 + yOff, 26, 22, p.slimeBase, p.slimeDark);
    drawRect(ctx, 22, 32 + yOff, 20, 3, p.slimeDark);
    drawRect(ctx, 23, 33 + yOff, 18, 2, p.slimeLight);
    drawRect(ctx, 21, 36 + yOff, 22, 17, p.slimeLight);
    drawRect(ctx, 23, 36 + yOff, 8, 3, p.slimeBright);
    drawPixel(ctx, 22, 35 + yOff, p.white);
    // Core
    drawRect(ctx, 30, 44 + yOff, 6, 6, p.slimeCore);
    // Eyes
    drawRect(ctx, 25, 41 + yOff, 3, 4, p.slimeEye);
    drawPixel(ctx, 25, 41 + yOff, p.white);
    drawRect(ctx, 36, 41 + yOff, 3, 4, p.slimeEye);
    drawPixel(ctx, 36, 41 + yOff, p.white);
    // Little airborne droplet
    drawRect(ctx, 31, 53, 2, 2, p.slimeLight);
  } else {
    // Frame 3: Landing compression
    drawGroundShadow(ctx, cx, 15, 3.5, BASELINE_Y, 0.4);
    drawOutlineRect(ctx, 17, 37, 30, 19, p.slimeBase, p.slimeDark);
    drawRect(ctx, 19, 35, 26, 3, p.slimeDark);
    drawRect(ctx, 20, 36, 24, 2, p.slimeLight);
    drawRect(ctx, 19, 39, 26, 14, p.slimeLight);
    drawRect(ctx, 21, 40, 10, 3, p.slimeBright);
    drawPixel(ctx, 20, 39, p.white);
    // Core
    drawRect(ctx, 29, 45, 7, 6, p.slimeCore);
    drawPixel(ctx, 30, 46, p.slimeBright);
    // Eyes
    drawRect(ctx, 25, 43, 3, 4, p.slimeEye);
    drawPixel(ctx, 25, 43, p.white);
    drawRect(ctx, 36, 43, 3, 4, p.slimeEye);
    drawPixel(ctx, 36, 43, p.white);
  }
}

/**
 * 2. GOBLIN SCOUT (Гоблин-разведчик)
 * Quick hunched runner with long pointed ears and chipped dagger.
 */
export function drawGoblin(ctx: CanvasRenderingContext2D, frame: number) {
  const p = PALETTE;
  const cx = 32;
  const bob = frame === 1 || frame === 3 ? -1 : 0;

  drawGroundShadow(ctx, cx, 14, 3, BASELINE_Y, 0.35);

  // Legs based on 4 walk frames:
  // frame 0: L-foot forward on y=56, R-foot back lifted
  // frame 1: passing stride
  // frame 2: R-foot forward on y=56, L-foot back lifted
  // frame 3: passing stride
  if (frame === 0) {
    // Left leg forward
    drawRect(ctx, 26, 46, 5, 10, p.goblinDark);
    drawRect(ctx, 24, 54, 7, 2, p.goblinSkin);
    // Right leg back
    drawRect(ctx, 35, 46, 5, 8, p.goblinDark);
    drawRect(ctx, 37, 52, 5, 3, p.goblinSkin);
  } else if (frame === 1) {
    // Passing
    drawRect(ctx, 28, 45, 5, 11, p.goblinDark);
    drawRect(ctx, 27, 54, 6, 2, p.goblinSkin);
    drawRect(ctx, 33, 45, 5, 9, p.goblinDark);
    drawRect(ctx, 34, 52, 5, 3, p.goblinSkin);
  } else if (frame === 2) {
    // Right leg forward
    drawRect(ctx, 34, 46, 5, 10, p.goblinDark);
    drawRect(ctx, 35, 54, 7, 2, p.goblinSkin);
    // Left leg back
    drawRect(ctx, 25, 46, 5, 8, p.goblinDark);
    drawRect(ctx, 23, 52, 5, 3, p.goblinSkin);
  } else {
    // Passing
    drawRect(ctx, 32, 45, 5, 11, p.goblinDark);
    drawRect(ctx, 32, 54, 6, 2, p.goblinSkin);
    drawRect(ctx, 27, 45, 5, 9, p.goblinDark);
    drawRect(ctx, 26, 52, 5, 3, p.goblinSkin);
  }

  // Loincloth / leather pants
  drawRect(ctx, 27, 43 + bob, 12, 6, p.goblinLeather);
  drawRect(ctx, 29, 45 + bob, 7, 4, p.goblinLeatherLight);

  // Torso / vest
  drawOutlineRect(ctx, 26, 32 + bob, 14, 13, p.goblinSkin, p.goblinDark);
  // Vest
  drawRect(ctx, 27, 33 + bob, 3, 10, p.goblinLeather);
  drawRect(ctx, 36, 33 + bob, 3, 10, p.goblinLeather);
  drawPixel(ctx, 29, 36 + bob, p.goblinLeatherLight);
  drawPixel(ctx, 34, 36 + bob, p.goblinLeatherLight);

  // Head
  const hy = 20 + bob;
  // Ears
  // Left ear
  drawPixel(ctx, 18, hy + 5, p.goblinSkin);
  drawRect(ctx, 19, hy + 4, 3, 4, p.goblinSkin);
  drawRect(ctx, 22, hy + 3, 3, 6, p.goblinSkin);
  // Right ear
  drawRect(ctx, 41, hy + 3, 3, 6, p.goblinSkin);
  drawRect(ctx, 44, hy + 4, 3, 4, p.goblinSkin);
  drawPixel(ctx, 47, hy + 5, p.goblinSkin);
  // Head block
  drawOutlineRect(ctx, 24, hy, 18, 14, p.goblinSkin, p.goblinDark);
  drawRect(ctx, 26, hy + 2, 14, 8, p.goblinLight);
  // Big crooked nose
  drawRect(ctx, 30, hy + 6, 7, 4, p.goblinNose);
  drawRect(ctx, 31, hy + 8, 5, 3, p.goblinDark);
  // Yellow goblin eyes
  drawRect(ctx, 27, hy + 4, 3, 3, "#facc15");
  drawPixel(ctx, 28, hy + 5, "#000000");
  drawRect(ctx, 36, hy + 4, 3, 3, "#facc15");
  drawPixel(ctx, 37, hy + 5, "#000000");
  // Mouth with tiny fang
  drawRect(ctx, 30, hy + 11, 6, 2, "#450a0a");
  drawPixel(ctx, 32, hy + 11, p.white);

  // Arms & Dagger
  if (frame === 0 || frame === 1) {
    // Dagger forward on right hand
    drawRect(ctx, 39, 34 + bob, 4, 5, p.goblinSkin);
    // Dagger handle
    drawRect(ctx, 42, 35 + bob, 2, 4, p.woodMid);
    // Guard
    drawRect(ctx, 41, 33 + bob, 4, 2, p.ironMid);
    // Blade
    drawRect(ctx, 42, 27 + bob, 2, 6, p.ironLight);
    drawPixel(ctx, 43, 26 + bob, p.white);
    // Left arm back
    drawRect(ctx, 23, 35 + bob, 4, 6, p.goblinDark);
  } else {
    // Dagger slightly back, arms alternate
    drawRect(ctx, 40, 36 + bob, 4, 5, p.goblinSkin);
    drawRect(ctx, 43, 38 + bob, 2, 4, p.woodMid);
    drawRect(ctx, 42, 37 + bob, 4, 2, p.ironMid);
    drawRect(ctx, 43, 31 + bob, 2, 6, p.ironLight);
    drawPixel(ctx, 44, 30 + bob, p.white);
    // Left arm forward
    drawRect(ctx, 22, 33 + bob, 4, 6, p.goblinSkin);
  }
}

/**
 * 3. SKELETON INFANTRY (Скелет-пехотинец)
 * Bleached bone warrior with glowing cyan eyes, cracked shield & sword.
 */
export function drawSkeleton(ctx: CanvasRenderingContext2D, frame: number) {
  const p = PALETTE;
  const cx = 32;
  const bob = frame % 2 === 1 ? -1 : 0;

  drawGroundShadow(ctx, cx, 14, 3, BASELINE_Y, 0.35);

  // Bony legs
  if (frame === 0) {
    // Left leg forward
    drawRect(ctx, 27, 44, 3, 10, p.boneMid);
    drawRect(ctx, 25, 54, 6, 2, p.boneLight);
    // Right leg back
    drawRect(ctx, 36, 44, 3, 8, p.boneDark);
    drawRect(ctx, 38, 52, 4, 2, p.boneMid);
  } else if (frame === 1) {
    drawRect(ctx, 28, 43, 3, 11, p.boneMid);
    drawRect(ctx, 27, 54, 5, 2, p.boneLight);
    drawRect(ctx, 34, 43, 3, 10, p.boneDark);
    drawRect(ctx, 35, 53, 4, 2, p.boneMid);
  } else if (frame === 2) {
    // Right leg forward
    drawRect(ctx, 35, 44, 3, 10, p.boneMid);
    drawRect(ctx, 35, 54, 6, 2, p.boneLight);
    // Left leg back
    drawRect(ctx, 26, 44, 3, 8, p.boneDark);
    drawRect(ctx, 24, 52, 4, 2, p.boneMid);
  } else {
    drawRect(ctx, 33, 43, 3, 11, p.boneMid);
    drawRect(ctx, 33, 54, 5, 2, p.boneLight);
    drawRect(ctx, 28, 43, 3, 10, p.boneDark);
    drawRect(ctx, 27, 53, 4, 2, p.boneMid);
  }

  // Pelvis bone
  drawRect(ctx, 28, 40 + bob, 10, 4, p.boneMid);
  drawPixel(ctx, 32, 42 + bob, p.boneDark);

  // Spine & Ribcage
  const ry = 28 + bob;
  drawRect(ctx, 31, ry, 3, 12, p.boneMid); // Spine
  // Rib arches
  drawRect(ctx, 26, ry + 2, 13, 2, p.boneLight);
  drawRect(ctx, 25, ry + 5, 15, 2, p.boneLight);
  drawRect(ctx, 27, ry + 8, 11, 2, p.boneMid);
  // Shadow between ribs
  drawPixel(ctx, 29, ry + 4, "#0f172a");
  drawPixel(ctx, 35, ry + 4, "#0f172a");
  drawPixel(ctx, 29, ry + 7, "#0f172a");
  drawPixel(ctx, 35, ry + 7, "#0f172a");

  // Skull
  const sy = 14 + bob;
  drawOutlineRect(ctx, 25, sy, 15, 14, p.boneMid, p.boneDark);
  drawRect(ctx, 26, sy + 1, 13, 8, p.boneLight);
  // Brow ridge
  drawRect(ctx, 25, sy + 5, 15, 2, p.boneMid);
  // Cyan glowing eye sockets
  drawRect(ctx, 27, sy + 7, 3, 3, p.boneEye);
  drawPixel(ctx, 28, sy + 8, p.boneEyeGlow);
  drawRect(ctx, 35, sy + 7, 3, 3, p.boneEye);
  drawPixel(ctx, 36, sy + 8, p.boneEyeGlow);
  // Nasal cavity
  drawPixel(ctx, 32, sy + 10, p.boneDark);
  // Teeth jaw
  drawRect(ctx, 28, sy + 11, 9, 3, p.boneMid);
  drawPixel(ctx, 29, sy + 11, p.boneLight);
  drawPixel(ctx, 31, sy + 11, p.boneLight);
  drawPixel(ctx, 33, sy + 11, p.boneLight);
  drawPixel(ctx, 35, sy + 11, p.boneLight);

  // Shield on Left Arm
  const shY = 28 + bob;
  drawOutlineRect(ctx, 16, shY, 9, 14, p.woodMid, p.ironDark);
  drawRect(ctx, 18, shY + 2, 5, 10, p.woodBrown);
  // Iron boss center
  drawRect(ctx, 19, shY + 5, 3, 4, p.ironLight);

  // Sword on Right Hand
  const swBob = frame === 0 || frame === 1 ? -2 : 2;
  const swX = 42;
  const swY = 22 + bob + swBob;
  // Blade
  drawRect(ctx, swX + 2, swY - 8, 3, 14, p.ironLight);
  drawPixel(ctx, swX + 3, swY - 9, p.white);
  // Guard
  drawRect(ctx, swX, swY + 6, 7, 2, p.ironMid);
  // Hilt
  drawRect(ctx, swX + 2, swY + 8, 3, 4, p.woodBrown);
  // Pommel
  drawRect(ctx, swX + 2, swY + 12, 3, 2, p.ironLight);
}

/**
 * 4. TOXIC SPIDER (Ядовитый Паук)
 * 8-legged scuttling spider with glowing neon abdomen markings and venom drips.
 */
export function drawSpider(ctx: CanvasRenderingContext2D, frame: number) {
  const p = PALETTE;
  const cx = 32;
  const bob = frame % 2 === 1 ? 1 : 0;

  drawGroundShadow(ctx, cx, 20, 4, BASELINE_Y, 0.4);

  // 8 articulated legs touching baseline y=56
  // Legs alternate groups (1,3 vs 2,4)
  if (frame === 0 || frame === 1) {
    // Left group A planted at y=56
    // Leg 1 (far front)
    drawRect(ctx, 15, 42 + bob, 3, 7, p.spiderCarapaceDark);
    drawRect(ctx, 11, 48, 4, 8, p.spiderCarapaceLight);
    drawRect(ctx, 8, 55, 4, 2, p.spiderCarapaceLight); // foot on 56
    // Leg 2 (lifted)
    drawRect(ctx, 20, 41 + bob, 3, 6, p.spiderCarapaceDark);
    drawRect(ctx, 17, 46, 3, 6, p.spiderCarapaceLight);
    // Leg 3 (planted)
    drawRect(ctx, 23, 44 + bob, 3, 6, p.spiderCarapaceDark);
    drawRect(ctx, 20, 49, 3, 7, p.spiderCarapaceLight);
    drawRect(ctx, 18, 55, 3, 2, p.spiderCarapaceLight);
    // Right group A planted
    drawRect(ctx, 42, 42 + bob, 3, 7, p.spiderCarapaceDark);
    drawRect(ctx, 45, 48, 4, 8, p.spiderCarapaceLight);
    drawRect(ctx, 48, 55, 4, 2, p.spiderCarapaceLight); // foot on 56
    // Right leg lifted
    drawRect(ctx, 38, 41 + bob, 3, 6, p.spiderCarapaceDark);
    drawRect(ctx, 41, 46, 3, 6, p.spiderCarapaceLight);
    // Right leg planted
    drawRect(ctx, 45, 44 + bob, 3, 6, p.spiderCarapaceDark);
    drawRect(ctx, 48, 49, 3, 7, p.spiderCarapaceLight);
    drawRect(ctx, 51, 55, 3, 2, p.spiderCarapaceLight);
  } else {
    // Alternated leg cycle
    // Leg 2 planted
    drawRect(ctx, 18, 41 + bob, 3, 7, p.spiderCarapaceDark);
    drawRect(ctx, 14, 47, 4, 9, p.spiderCarapaceLight);
    drawRect(ctx, 12, 55, 4, 2, p.spiderCarapaceLight);
    // Leg 1 lifted
    drawRect(ctx, 16, 42 + bob, 3, 6, p.spiderCarapaceDark);
    drawRect(ctx, 13, 46, 3, 6, p.spiderCarapaceLight);
    // Leg 4 planted
    drawRect(ctx, 22, 43 + bob, 3, 7, p.spiderCarapaceDark);
    drawRect(ctx, 18, 49, 4, 7, p.spiderCarapaceLight);
    drawRect(ctx, 16, 55, 3, 2, p.spiderCarapaceLight);
    // Right leg 2 planted
    drawRect(ctx, 40, 41 + bob, 3, 7, p.spiderCarapaceDark);
    drawRect(ctx, 43, 47, 4, 9, p.spiderCarapaceLight);
    drawRect(ctx, 46, 55, 4, 2, p.spiderCarapaceLight);
    // Right leg 1 lifted
    drawRect(ctx, 43, 42 + bob, 3, 6, p.spiderCarapaceDark);
    drawRect(ctx, 46, 46, 3, 6, p.spiderCarapaceLight);
    // Right leg 4 planted
    drawRect(ctx, 48, 43 + bob, 3, 7, p.spiderCarapaceDark);
    drawRect(ctx, 51, 49, 4, 7, p.spiderCarapaceLight);
    drawRect(ctx, 53, 55, 3, 2, p.spiderCarapaceLight);
  }

  // Large bulbous abdomen (rear)
  const by = 26 + bob;
  drawOutlineRect(ctx, 22, by, 20, 16, p.spiderBelly, p.spiderCarapaceDark);
  drawRect(ctx, 24, by + 2, 16, 12, p.spiderCarapace);
  // Toxic glowing hourglass mark
  drawRect(ctx, 30, by + 4, 4, 2, p.toxicGreen);
  drawRect(ctx, 31, by + 6, 2, 2, "#86efac");
  drawRect(ctx, 30, by + 8, 4, 3, p.toxicGreen);

  // Cephalothorax (head & thorax, front)
  const cy = 34 + bob;
  drawOutlineRect(ctx, 25, cy, 14, 11, p.spiderCarapace, p.spiderCarapaceDark);
  drawRect(ctx, 27, cy + 2, 10, 7, p.spiderCarapaceLight);

  // Multiple glowing crimson eyes
  drawRect(ctx, 28, cy + 3, 2, 2, p.spiderEye);
  drawPixel(ctx, 28, cy + 3, p.spiderEyeGlow);
  drawRect(ctx, 31, cy + 2, 2, 2, p.spiderEye);
  drawPixel(ctx, 31, cy + 2, p.spiderEyeGlow);
  drawRect(ctx, 34, cy + 3, 2, 2, p.spiderEye);
  drawPixel(ctx, 34, cy + 3, p.spiderEyeGlow);

  // Chelicerae / venom fangs
  drawRect(ctx, 29, cy + 9, 2, 4, "#e2e8f0");
  drawRect(ctx, 33, cy + 9, 2, 4, "#e2e8f0");
  // Venom droplet
  if (frame === 1 || frame === 3) {
    drawPixel(ctx, 30, cy + 13, p.toxicGreen);
  }
}

/**
 * 5. ORC BERSERKER (Орк-берсерк)
 * Heavy muscular brute with spiked pauldron, twin tusks and morningstar.
 */
export function drawOrc(ctx: CanvasRenderingContext2D, frame: number) {
  const p = PALETTE;
  const cx = 32;
  const bob = frame % 2 === 1 ? -1 : 0;

  drawGroundShadow(ctx, cx, 16, 4, BASELINE_Y, 0.45);

  // Heavy legs & boots
  if (frame === 0) {
    // Left boot stomps y=56
    drawRect(ctx, 24, 44, 7, 10, p.orcArmor);
    drawRect(ctx, 22, 53, 9, 3, p.ironMid);
    // Right boot trailing
    drawRect(ctx, 35, 44, 6, 8, p.orcArmor);
    drawRect(ctx, 37, 51, 6, 3, p.ironDark);
  } else if (frame === 1) {
    drawRect(ctx, 26, 43, 6, 11, p.orcArmor);
    drawRect(ctx, 25, 53, 8, 3, p.ironMid);
    drawRect(ctx, 34, 43, 6, 9, p.orcArmor);
    drawRect(ctx, 35, 51, 6, 3, p.ironDark);
  } else if (frame === 2) {
    // Right boot stomps y=56
    drawRect(ctx, 33, 44, 7, 10, p.orcArmor);
    drawRect(ctx, 33, 53, 9, 3, p.ironMid);
    // Left boot trailing
    drawRect(ctx, 23, 44, 6, 8, p.orcArmor);
    drawRect(ctx, 21, 51, 6, 3, p.ironDark);
  } else {
    drawRect(ctx, 32, 43, 6, 11, p.orcArmor);
    drawRect(ctx, 32, 53, 8, 3, p.ironMid);
    drawRect(ctx, 25, 43, 6, 9, p.orcArmor);
    drawRect(ctx, 24, 51, 6, 3, p.ironDark);
  }

  // Heavy studded belt
  drawRect(ctx, 23, 40 + bob, 18, 5, p.orcArmor);
  drawRect(ctx, 28, 41 + bob, 8, 3, "#ca8a04"); // gold skull buckle
  drawPixel(ctx, 31, 42 + bob, "#000000");

  // Muscular Torso with war harness
  const ty = 25 + bob;
  drawOutlineRect(ctx, 22, ty, 20, 16, p.orcSkin, p.orcSkinDark);
  drawRect(ctx, 25, ty + 2, 14, 12, p.orcSkinLight);
  // Red war-paint sash across chest
  drawRect(ctx, 24, ty + 3, 4, 3, p.orcBloodStripe);
  drawRect(ctx, 28, ty + 6, 5, 3, p.orcBloodStripe);
  drawRect(ctx, 33, ty + 9, 4, 3, p.orcBloodStripe);
  // Pectoral shadows
  drawRect(ctx, 25, ty + 8, 5, 2, p.orcSkinDark);
  drawRect(ctx, 32, ty + 8, 5, 2, p.orcSkinDark);

  // Spiked Iron Shoulder Pauldron (Left)
  drawRect(ctx, 17, ty - 1, 7, 8, p.ironDark);
  drawRect(ctx, 18, ty, 5, 5, p.ironMid);
  drawPixel(ctx, 16, ty - 2, p.orcSpike); // spike 1
  drawPixel(ctx, 20, ty - 3, p.orcSpike); // spike 2

  // Head & Mohawk
  const hy = 13 + bob;
  // Red Mohawk hair
  drawRect(ctx, 29, hy - 4, 6, 6, p.orcHair);
  drawRect(ctx, 30, hy - 6, 4, 3, "#ef4444");
  // Head base
  drawOutlineRect(ctx, 24, hy, 16, 13, p.orcSkin, p.orcSkinDark);
  drawRect(ctx, 26, hy + 2, 12, 7, p.orcSkinLight);
  // Angry red eyes
  drawRect(ctx, 27, hy + 5, 3, 2, "#dc2626");
  drawPixel(ctx, 28, hy + 5, "#fef08a");
  drawRect(ctx, 34, hy + 5, 3, 2, "#dc2626");
  drawPixel(ctx, 35, hy + 5, "#fef08a");
  // Twin Tusks
  drawRect(ctx, 27, hy + 8, 3, 5, p.orcTusk);
  drawPixel(ctx, 27, hy + 7, p.white);
  drawRect(ctx, 34, hy + 8, 3, 5, p.orcTusk);
  drawPixel(ctx, 34, hy + 7, p.white);

  // Spiked Club / Morningstar in Right Hand
  const wy = frame === 0 || frame === 1 ? 16 + bob : 20 + bob;
  // Orc right arm
  drawRect(ctx, 39, ty + 2, 6, 7, p.orcSkin);
  // Weapon shaft
  drawRect(ctx, 44, wy, 3, 18, p.woodMid);
  // Spiked head
  drawRect(ctx, 41, wy - 6, 9, 8, p.ironDark);
  drawRect(ctx, 42, wy - 5, 7, 6, p.ironMid);
  // Spikes
  drawPixel(ctx, 45, wy - 8, p.orcSpike);
  drawPixel(ctx, 39, wy - 3, p.orcSpike);
  drawPixel(ctx, 51, wy - 3, p.orcSpike);
}

/**
 * 6. CRYPT WRAITH (Призрак теней)
 * Floating hooded phantom with glowing cyan eyes, ethereal robes, and swinging soul lantern.
 */
export function drawWraith(ctx: CanvasRenderingContext2D, frame: number) {
  const p = PALETTE;
  const cx = 32;
  // Floating levitation offset
  const floatY = Math.sin((frame / 4) * Math.PI * 2) * 3;

  // Shadow on ground plane baseline y=56
  drawGroundShadow(ctx, cx, 15, 3.5, BASELINE_Y, 0.25);

  // Ghostly wispy lower tail touches baseline y=56
  const tailSway = frame === 0 ? -2 : frame === 2 ? 2 : 0;
  drawRect(ctx, 29 + tailSway, 46 + floatY, 7, 7, p.wraithDark);
  drawRect(ctx, 31 + tailSway, 51 + floatY, 4, 4, p.wraithMid);
  drawPixel(ctx, 32 + tailSway, 55, p.wraithLight); // wisp reaches y=56

  // Shroud body
  const by = 26 + floatY;
  drawOutlineRect(ctx, 22, by, 20, 22, p.wraithDark, p.wraithDeep);
  drawRect(ctx, 24, by + 2, 16, 18, p.wraithMid);
  // Spectral aura creases
  drawRect(ctx, 25, by + 6, 2, 12, p.wraithLight);
  drawRect(ctx, 37, by + 8, 2, 10, p.wraithLight);

  // Large Hood
  const hy = 12 + floatY;
  drawOutlineRect(ctx, 23, hy, 18, 16, p.wraithDark, p.wraithDeep);
  drawRect(ctx, 25, hy + 2, 14, 12, p.wraithMid);
  // Deep dark hollow face interior
  drawRect(ctx, 26, hy + 5, 12, 8, p.wraithDeep);
  // Glowing cyan eyes
  drawRect(ctx, 28, hy + 7, 3, 2, p.wraithLight);
  drawPixel(ctx, 29, hy + 7, p.wraithEye);
  drawRect(ctx, 33, hy + 7, 3, 2, p.wraithLight);
  drawPixel(ctx, 34, hy + 7, p.wraithEye);

  // Chained Soul Lantern on Right Side (swings back & forth)
  const lanternSwing = frame === 0 ? 3 : frame === 2 ? -2 : 0;
  const lx = 44 + lanternSwing;
  const ly = 24 + floatY;
  // Chain
  drawPixel(ctx, lx, ly - 4, p.ironMid);
  drawPixel(ctx, lx, ly - 2, p.ironLight);
  drawPixel(ctx, lx, ly, p.ironMid);
  // Lantern frame
  drawRect(ctx, lx - 3, ly + 2, 7, 2, p.lanternGold);
  drawRect(ctx, lx - 4, ly + 4, 9, 8, "#0f172a");
  // Soul flame interior
  drawRect(ctx, lx - 2, ly + 5, 5, 6, p.soulFire);
  drawPixel(ctx, lx, ly + 7, p.soulFireLight);
  // Lantern bottom
  drawRect(ctx, lx - 3, ly + 12, 7, 2, p.lanternGold);

  // Skeletal hand holding chain
  drawRect(ctx, 38, ly - 3, 4, 3, p.boneLight);
  // Left skeletal hand
  drawRect(ctx, 20, by + 8, 3, 3, p.boneLight);
}

/**
 * 7. IRONCLAD KNIGHT (Бронированный рыцарь)
 * Heavy tank in polished steel armor, crested greathelm, tower shield, and mace.
 */
export function drawKnight(ctx: CanvasRenderingContext2D, frame: number) {
  const p = PALETTE;
  const cx = 32;
  const bob = frame % 2 === 1 ? -1 : 0;

  drawGroundShadow(ctx, cx, 16, 4, BASELINE_Y, 0.45);

  // Heavy steel greaves & sabatons
  if (frame === 0) {
    // Left foot firmly planted on y=56
    drawRect(ctx, 25, 45, 6, 9, p.knightPlatesDark);
    drawRect(ctx, 26, 46, 4, 7, p.knightPlatesMid);
    drawRect(ctx, 23, 53, 9, 3, p.knightPlatesLight);
    // Right foot back
    drawRect(ctx, 35, 45, 6, 7, p.knightPlatesDark);
    drawRect(ctx, 37, 51, 6, 3, p.knightPlatesMid);
  } else if (frame === 1) {
    drawRect(ctx, 27, 44, 6, 10, p.knightPlatesMid);
    drawRect(ctx, 26, 53, 8, 3, p.knightPlatesLight);
    drawRect(ctx, 34, 44, 6, 8, p.knightPlatesDark);
    drawRect(ctx, 35, 51, 6, 3, p.knightPlatesMid);
  } else if (frame === 2) {
    // Right foot planted on y=56
    drawRect(ctx, 33, 45, 6, 9, p.knightPlatesDark);
    drawRect(ctx, 34, 46, 4, 7, p.knightPlatesMid);
    drawRect(ctx, 32, 53, 9, 3, p.knightPlatesLight);
    // Left foot back
    drawRect(ctx, 23, 45, 6, 7, p.knightPlatesDark);
    drawRect(ctx, 21, 51, 6, 3, p.knightPlatesMid);
  } else {
    drawRect(ctx, 32, 44, 6, 10, p.knightPlatesMid);
    drawRect(ctx, 31, 53, 8, 3, p.knightPlatesLight);
    drawRect(ctx, 26, 44, 6, 8, p.knightPlatesDark);
    drawRect(ctx, 25, 51, 6, 3, p.knightPlatesMid);
  }

  // Steel Cuirass & Tassets
  const cy = 25 + bob;
  drawOutlineRect(ctx, 24, cy, 17, 18, p.knightPlatesMid, p.knightPlatesDark);
  drawRect(ctx, 26, cy + 2, 13, 14, p.knightPlatesLight);
  // Chest plate shine
  drawRect(ctx, 27, cy + 3, 3, 8, p.knightPlatesShine);
  drawRect(ctx, 28, cy + 12, 9, 3, p.knightGold); // gold belt trim

  // Greathelm
  const hy = 11 + bob;
  // Golden crest plume on top
  drawRect(ctx, 30, hy - 4, 5, 5, p.knightGold);
  drawRect(ctx, 31, hy - 6, 3, 3, p.knightGoldBright);
  // Greathelm box
  drawOutlineRect(ctx, 25, hy, 15, 15, p.knightPlatesMid, p.knightPlatesDark);
  drawRect(ctx, 27, hy + 2, 11, 11, p.knightPlatesLight);
  drawRect(ctx, 28, hy + 2, 3, 6, p.knightPlatesShine);
  // T-shaped glowing visor slit
  drawRect(ctx, 27, hy + 7, 11, 2, "#090a0f");
  drawRect(ctx, 31, hy + 7, 3, 5, "#090a0f");
  drawPixel(ctx, 29, hy + 7, p.visorGlow);
  drawPixel(ctx, 34, hy + 7, p.visorGlow);

  // Tower Kite Shield on Left Side
  const shY = 22 + bob;
  drawOutlineRect(ctx, 13, shY, 11, 22, p.shieldRed, p.knightPlatesDark);
  drawRect(ctx, 15, shY + 2, 7, 18, p.shieldRedDark);
  // Golden heraldic cross on shield
  drawRect(ctx, 17, shY + 4, 3, 14, p.knightGold);
  drawRect(ctx, 14, shY + 9, 9, 3, p.knightGold);

  // Steel Flanged Mace on Right Hand
  const my = frame === 0 || frame === 1 ? 18 + bob : 22 + bob;
  drawRect(ctx, 42, my, 3, 16, p.knightPlatesMid); // shaft
  // Mace head
  drawRect(ctx, 40, my - 6, 7, 7, p.knightPlatesDark);
  drawRect(ctx, 41, my - 5, 5, 5, p.knightPlatesLight);
  drawPixel(ctx, 43, my - 7, p.knightPlatesShine);
  drawPixel(ctx, 39, my - 3, p.knightPlatesShine);
  drawPixel(ctx, 47, my - 3, p.knightPlatesShine);
}

/**
 * 8. MAGMA BRUTE (Магматический Голем)
 * Obsidian rock body with incandescent glowing lava cracks and rising ember sparks.
 */
export function drawMagmaBrute(ctx: CanvasRenderingContext2D, frame: number) {
  const p = PALETTE;
  const cx = 32;
  const bob = frame % 2 === 1 ? -1 : 0;

  drawGroundShadow(ctx, cx, 18, 4.5, BASELINE_Y, 0.5);

  // Molten basalt legs
  if (frame === 0) {
    // Left foot stomps baseline y=56 with lava splash
    drawRect(ctx, 23, 44, 8, 10, p.obsidianDark);
    drawRect(ctx, 24, 46, 3, 4, p.lavaMid);
    drawRect(ctx, 21, 52, 11, 4, p.obsidianMid);
    // Molten crack on ground
    drawRect(ctx, 20, 56, 12, 1, p.lavaHot);
    // Right foot back
    drawRect(ctx, 35, 44, 7, 8, p.obsidianDark);
    drawRect(ctx, 37, 51, 6, 3, p.obsidianMid);
  } else if (frame === 1) {
    drawRect(ctx, 25, 43, 7, 11, p.obsidianMid);
    drawRect(ctx, 24, 53, 9, 3, p.obsidianLight);
    drawRect(ctx, 34, 43, 7, 9, p.obsidianDark);
    drawRect(ctx, 35, 51, 6, 3, p.obsidianMid);
  } else if (frame === 2) {
    // Right foot stomps baseline y=56
    drawRect(ctx, 33, 44, 8, 10, p.obsidianDark);
    drawRect(ctx, 36, 46, 3, 4, p.lavaMid);
    drawRect(ctx, 32, 52, 11, 4, p.obsidianMid);
    drawRect(ctx, 32, 56, 12, 1, p.lavaHot);
    // Left foot back
    drawRect(ctx, 22, 44, 7, 8, p.obsidianDark);
    drawRect(ctx, 21, 51, 6, 3, p.obsidianMid);
  } else {
    drawRect(ctx, 32, 43, 7, 11, p.obsidianMid);
    drawRect(ctx, 31, 53, 9, 3, p.obsidianLight);
    drawRect(ctx, 26, 43, 7, 9, p.obsidianDark);
    drawRect(ctx, 25, 51, 6, 3, p.obsidianMid);
  }

  // Broad Volcanic Torso
  const ty = 23 + bob;
  drawOutlineRect(ctx, 20, ty, 24, 19, p.obsidianMid, p.obsidianDark);
  drawRect(ctx, 22, ty + 2, 20, 15, p.obsidianDark);

  // Blazing lava fissures in chest
  drawRect(ctx, 26, ty + 4, 3, 9, p.lavaDeep);
  drawRect(ctx, 27, ty + 5, 2, 7, p.lavaBright);
  drawPixel(ctx, 27, ty + 7, p.lavaHot);

  drawRect(ctx, 34, ty + 6, 4, 8, p.lavaDeep);
  drawRect(ctx, 35, ty + 7, 2, 6, p.lavaMid);
  drawPixel(ctx, 35, ty + 8, p.lavaHot);

  // Molten core heart
  drawRect(ctx, 30, ty + 7, 4, 5, p.lavaHot);
  drawPixel(ctx, 31, ty + 8, p.lavaWhite);

  // Heavy Rock Head with Flaming Horns
  const hy = 11 + bob;
  // Lava horns
  drawRect(ctx, 22, hy - 4, 3, 5, p.lavaDeep);
  drawPixel(ctx, 21, hy - 5, p.lavaBright);
  drawRect(ctx, 39, hy - 4, 3, 5, p.lavaDeep);
  drawPixel(ctx, 42, hy - 5, p.lavaBright);
  // Head stone
  drawOutlineRect(ctx, 25, hy, 14, 13, p.obsidianMid, p.obsidianDark);
  drawRect(ctx, 27, hy + 2, 10, 9, p.obsidianDark);
  // Blazing molten eye slit
  drawRect(ctx, 28, hy + 5, 8, 3, p.lavaHot);
  drawPixel(ctx, 29, hy + 6, p.lavaWhite);
  drawPixel(ctx, 34, hy + 6, p.lavaWhite);

  // Heavy Basalt Fists
  // Left fist
  drawRect(ctx, 15, ty + 6, 7, 8, p.obsidianMid);
  drawRect(ctx, 16, ty + 8, 3, 3, p.lavaBright);
  // Right fist
  drawRect(ctx, 42, ty + 6, 7, 8, p.obsidianMid);
  drawRect(ctx, 45, ty + 8, 3, 3, p.lavaBright);

  // Floating ember sparks (animated)
  const sparkY = (frame * 3) % 12;
  drawPixel(ctx, 23, ty - sparkY, p.lavaBright);
  drawPixel(ctx, 41, ty - sparkY - 2, p.lavaHot);
}

/**
 * 9. VOID NECROMANCER (Чумной Некромант)
 * Hooded occult sorcerer with raven skull mask, rune robes, and orb staff.
 */
export function drawNecromancer(ctx: CanvasRenderingContext2D, frame: number) {
  const p = PALETTE;
  const cx = 32;
  const bob = frame % 2 === 1 ? -1 : 0;

  drawGroundShadow(ctx, cx, 15, 3.5, BASELINE_Y, 0.4);

  // Robe hem strides across baseline y=56
  if (frame === 0) {
    // Left foot peeks out from robe
    drawRect(ctx, 25, 52, 6, 4, p.necroRobeDark);
    drawRect(ctx, 24, 55, 6, 1, p.skullMask);
  } else if (frame === 2) {
    // Right foot peeks out
    drawRect(ctx, 33, 52, 6, 4, p.necroRobeDark);
    drawRect(ctx, 34, 55, 6, 1, p.skullMask);
  }

  // Flowing Occult Robes
  const ry = 25 + bob;
  drawOutlineRect(ctx, 22, ry, 19, 29, p.necroRobeDark, "#090a0f");
  drawRect(ctx, 24, ry + 2, 15, 25, p.necroRobeMid);
  // Center gold embroidered occult rune sash
  drawRect(ctx, 29, ry + 2, 4, 25, p.necroGold);
  drawPixel(ctx, 30, ry + 6, p.necroGoldLight);
  drawPixel(ctx, 31, ry + 12, p.necroGoldLight);
  drawPixel(ctx, 30, ry + 18, p.necroGoldLight);
  drawPixel(ctx, 31, ry + 24, p.necroGoldLight);

  // Raven Skull Mask & Hood
  const hy = 11 + bob;
  // Large Pointed Hood
  drawOutlineRect(ctx, 24, hy, 16, 15, p.necroRobeDark, "#090a0f");
  drawRect(ctx, 26, hy + 2, 12, 11, p.necroRobeMid);
  // Horned headdress trim
  drawRect(ctx, 23, hy, 2, 6, p.necroGold);
  drawRect(ctx, 39, hy, 2, 6, p.necroGold);
  // Raven Skull Mask
  drawRect(ctx, 27, hy + 5, 10, 7, p.skullMask);
  // Beak extending down
  drawRect(ctx, 30, hy + 10, 4, 4, p.skullMask);
  drawPixel(ctx, 31, hy + 13, "#94a3b8");
  // Glowing void purple eyes
  drawRect(ctx, 28, hy + 7, 2, 2, p.voidGlow);
  drawPixel(ctx, 28, hy + 7, p.voidCore);
  drawRect(ctx, 34, hy + 7, 2, 2, p.voidGlow);
  drawPixel(ctx, 34, hy + 7, p.voidCore);

  // Bone Staff with Hovering Void Orb (Right side)
  const staffBob = frame === 0 || frame === 1 ? -1 : 1;
  const sx = 44;
  const sy = 16 + bob + staffBob;
  // Staff pole
  drawRect(ctx, sx + 2, sy + 6, 2, 34, p.woodBrown);
  // Staff head crown
  drawRect(ctx, sx, sy + 4, 6, 3, p.skullMask);
  // Hovering Void Orb
  const orbY = sy - 4 + (frame % 2 === 0 ? -1 : 1);
  drawOutlineRect(ctx, sx - 2, orbY, 9, 9, p.voidDark, p.voidGlow);
  drawRect(ctx, sx - 1, orbY + 1, 7, 7, p.voidGlow);
  drawRect(ctx, sx, orbY + 2, 5, 5, p.voidCore);
  drawPixel(ctx, sx + 2, orbY + 3, p.white);
  // Orbiting rune wisps
  const orbitX = Math.round(Math.cos(frame * 1.57) * 7);
  drawPixel(ctx, sx + 2 + orbitX, orbY + 4, p.necroGoldLight);
}

/**
 * 10. BOSS: BONE COLOSSUS / ARCH-LICH OVERLORD (БОСС: Костяной Колосс)
 * Massive, imposing 64x64 frame-filling boss!
 * Crowned horned skull, spiked bone pauldrons, glowing green soul heart, colossal runeblade, and flowing tattered cape.
 */
export function drawBoneColossus(ctx: CanvasRenderingContext2D, frame: number) {
  const p = PALETTE;
  const cx = 32;
  const bob = frame % 2 === 1 ? -1 : 0;

  // Boss Ground Shadow (Wide, menacing)
  drawGroundShadow(ctx, cx, 24, 6, BASELINE_Y, 0.55);

  // Colossal Armored Bone Legs touching baseline y=56
  if (frame === 0) {
    // Heavy left foot crushes ground at y=56
    drawRect(ctx, 20, 42, 10, 12, p.bossBoneDark);
    drawRect(ctx, 22, 44, 6, 8, p.bossBoneMid);
    drawRect(ctx, 17, 52, 14, 4, p.bossBoneLight);
    // Shockwave crack on baseline
    drawRect(ctx, 14, 56, 18, 1, p.bossNecroFlameBright);

    // Right leg back
    drawRect(ctx, 36, 42, 9, 10, p.bossBoneDark);
    drawRect(ctx, 38, 50, 9, 4, p.bossBoneMid);
  } else if (frame === 1) {
    drawRect(ctx, 22, 41, 9, 13, p.bossBoneMid);
    drawRect(ctx, 20, 52, 12, 4, p.bossBoneLight);
    drawRect(ctx, 35, 41, 9, 11, p.bossBoneDark);
    drawRect(ctx, 36, 50, 9, 4, p.bossBoneMid);
  } else if (frame === 2) {
    // Heavy right foot crushes ground at y=56
    drawRect(ctx, 34, 42, 10, 12, p.bossBoneDark);
    drawRect(ctx, 36, 44, 6, 8, p.bossBoneMid);
    drawRect(ctx, 33, 52, 14, 4, p.bossBoneLight);
    drawRect(ctx, 32, 56, 18, 1, p.bossNecroFlameBright);

    // Left leg back
    drawRect(ctx, 19, 42, 9, 10, p.bossBoneDark);
    drawRect(ctx, 17, 50, 9, 4, p.bossBoneMid);
  } else {
    drawRect(ctx, 33, 41, 9, 13, p.bossBoneMid);
    drawRect(ctx, 32, 52, 12, 4, p.bossBoneLight);
    drawRect(ctx, 20, 41, 9, 11, p.bossBoneDark);
    drawRect(ctx, 19, 50, 9, 4, p.bossBoneMid);
  }

  // Tattered Crimson Cape (Flows behind body)
  const capeWave = frame === 0 ? 2 : frame === 2 ? -2 : 0;
  drawRect(ctx, 12 + capeWave, 22 + bob, 8, 30, p.bossCapeDark);
  drawRect(ctx, 14 + capeWave, 24 + bob, 5, 26, p.bossCapeRed);
  drawRect(ctx, 13 + capeWave, 48 + bob, 7, 5, p.bossCapeLight);

  // Massive Spiked Pauldrons (Shoulders)
  const sy = 16 + bob;
  // Left pauldron with 3 giant horn spikes
  drawOutlineRect(ctx, 12, sy, 11, 11, p.bossBoneMid, p.bossBoneDark);
  drawPixel(ctx, 11, sy - 3, p.bossBoneLight); // spike 1
  drawPixel(ctx, 15, sy - 5, p.bossBoneLight); // spike 2
  drawPixel(ctx, 19, sy - 4, p.bossBoneLight); // spike 3
  // Right pauldron
  drawOutlineRect(ctx, 41, sy, 11, 11, p.bossBoneMid, p.bossBoneDark);
  drawPixel(ctx, 44, sy - 4, p.bossBoneLight);
  drawPixel(ctx, 48, sy - 5, p.bossBoneLight);
  drawPixel(ctx, 52, sy - 3, p.bossBoneLight);

  // Massive Armored Ribcage & Core
  const by = 22 + bob;
  drawOutlineRect(ctx, 21, by, 22, 20, p.bossBoneMid, p.bossBoneDark);
  drawRect(ctx, 23, by + 2, 18, 16, p.bossBladeDark);
  // Rib arches
  drawRect(ctx, 22, by + 3, 20, 2, p.bossBoneLight);
  drawRect(ctx, 22, by + 7, 20, 2, p.bossBoneLight);
  drawRect(ctx, 23, by + 11, 18, 2, p.bossBoneMid);
  drawRect(ctx, 24, by + 15, 16, 2, p.bossBoneDark);

  // Glowing Necrotic Soul Gem Heart (Pulsing green energy)
  const heartGlow = frame % 2 === 0 ? p.bossNecroFlameBright : p.bossSoulGlow;
  drawRect(ctx, 29, by + 5, 6, 7, p.bossNecroFlameDark);
  drawRect(ctx, 30, by + 6, 4, 5, p.bossNecroFlameMid);
  drawPixel(ctx, 31, by + 7, heartGlow);
  drawPixel(ctx, 32, by + 7, p.white);

  // Giant Horned Skull
  const hy = 6 + bob;
  // Demonic Horns curving outward
  drawRect(ctx, 18, hy, 4, 7, p.bossBoneMid);
  drawRect(ctx, 15, hy - 4, 5, 5, p.bossBoneLight);
  drawPixel(ctx, 14, hy - 5, p.bossBoneLight);
  drawRect(ctx, 42, hy, 4, 7, p.bossBoneMid);
  drawRect(ctx, 44, hy - 4, 5, 5, p.bossBoneLight);
  drawPixel(ctx, 49, hy - 5, p.bossBoneLight);

  // Royal Golden Boss Crown
  drawRect(ctx, 24, hy - 2, 16, 4, p.bossCrownGold);
  drawPixel(ctx, 24, hy - 4, p.bossCrownGlow);
  drawPixel(ctx, 28, hy - 5, p.bossCrownGlow);
  drawPixel(ctx, 32, hy - 6, p.bossCrownGlow); // tall center peak
  drawPixel(ctx, 36, hy - 5, p.bossCrownGlow);
  drawPixel(ctx, 40, hy - 4, p.bossCrownGlow);
  // Red ruby jewel in crown center
  drawPixel(ctx, 32, hy - 2, p.bossRuby);

  // Skull Structure
  drawOutlineRect(ctx, 24, hy + 2, 16, 14, p.bossBoneMid, p.bossBoneDark);
  drawRect(ctx, 26, hy + 4, 12, 10, p.bossBoneLight);
  // Piercing Necrotic Green Eyes
  drawRect(ctx, 27, hy + 7, 3, 3, p.bossNecroFlameBright);
  drawPixel(ctx, 28, hy + 8, p.bossSoulGlow);
  drawRect(ctx, 34, hy + 7, 3, 3, p.bossNecroFlameBright);
  drawPixel(ctx, 35, hy + 8, p.bossSoulGlow);
  // Menacing Teeth
  drawRect(ctx, 28, hy + 12, 8, 3, p.bossBoneDark);
  drawPixel(ctx, 29, hy + 12, p.bossBoneLight);
  drawPixel(ctx, 31, hy + 12, p.bossBoneLight);
  drawPixel(ctx, 33, hy + 12, p.bossBoneLight);
  drawPixel(ctx, 35, hy + 12, p.bossBoneLight);

  // Colossal Runeblade of Damnation (Right hand)
  const wy = frame === 0 || frame === 1 ? 14 + bob : 18 + bob;
  const wx = 50;
  // Blade steel
  drawRect(ctx, wx, wy - 8, 4, 34, p.bossBladeDark);
  drawRect(ctx, wx + 1, wy - 6, 2, 30, p.bossBladeSteel);
  // Necrotic flaming runes along blade edge
  drawPixel(ctx, wx - 1, wy - 2, p.bossNecroFlameBright);
  drawPixel(ctx, wx - 1, wy + 4, p.bossNecroFlameBright);
  drawPixel(ctx, wx - 1, wy + 10, p.bossNecroFlameBright);
  drawPixel(ctx, wx - 1, wy + 16, p.bossNecroFlameBright);
  // Blade tip
  drawPixel(ctx, wx + 1, wy - 9, p.bossSoulGlow);
  // Skull crossguard
  drawRect(ctx, wx - 3, wy + 26, 10, 4, p.bossCrownGold);
  drawPixel(ctx, wx + 1, wy + 27, p.bossRuby);
  // Hilt
  drawRect(ctx, wx + 1, wy + 30, 2, 8, p.bossBoneLight);
  // Boss bone hand gripping hilt
  drawRect(ctx, wx - 1, wy + 28, 6, 4, p.bossBoneLight);
}

/**
 * Directional profile helpers. Every walker is drawn as a right-facing
 * side view so its forward direction stays unambiguous in a TD lane.
 */
function drawProfileLegs(
  ctx: CanvasRenderingContext2D,
  frame: number,
  backX: number,
  frontX: number,
  legColor: string,
  footColor: string,
  width: number = 5,
) {
  const stride = [-2, 0, 2, 0][frame];
  const inverseStride = -stride;
  const backY = stride > 0 ? 45 : 47;
  const frontY = inverseStride > 0 ? 45 : 47;

  drawRect(ctx, backX, backY, width, BASELINE_Y - backY, legColor);
  drawRect(ctx, backX + stride - 1, BASELINE_Y - 2, width + 3, 2, footColor);
  drawRect(ctx, frontX, frontY, width, BASELINE_Y - frontY, legColor);
  drawRect(
    ctx,
    frontX + inverseStride,
    BASELINE_Y - 2,
    width + 3,
    2,
    footColor,
  );
}

function drawRightSlime(ctx: CanvasRenderingContext2D, frame: number) {
  const p = PALETTE;
  const hop = frame === 2 ? -5 : frame === 1 ? -2 : 0;
  const squish = frame === 0 ? 3 : 0;
  drawGroundShadow(
    ctx,
    31,
    16 - squish,
    3,
    BASELINE_Y,
    frame === 2 ? 0.2 : 0.38,
  );
  drawOutlineRect(
    ctx,
    15 - squish,
    35 + hop + squish,
    32 + squish * 2,
    21 - squish,
    p.slimeBase,
    p.slimeDark,
  );
  drawRect(
    ctx,
    18 - squish,
    37 + hop + squish,
    28 + squish * 2,
    16 - squish,
    p.slimeLight,
  );
  drawRect(ctx, 19 - squish, 37 + hop + squish, 12, 4, p.slimeBright);
  drawPixel(ctx, 20 - squish, 38 + hop + squish, p.white);
  // One eye and mouth placed on the forward (right) side.
  drawRect(ctx, 38 + squish, 43 + hop + squish, 4, 5, p.slimeEye);
  drawPixel(ctx, 39 + squish, 43 + hop + squish, p.white);
  drawRect(ctx, 39 + squish, 50 + hop + squish, 5, 2, p.slimeEye);
  drawRect(ctx, 30, 45 + hop, 5, 5, p.slimeCore);
  drawPixel(ctx, 31, 46 + hop, p.slimeBright);
  // Trailing droplets make the route direction clear.
  drawPixel(ctx, 12, 50 + hop, p.slimeLight);
  if (frame === 1 || frame === 2) drawPixel(ctx, 10, 53, p.slimeBright);
}

function drawRightGoblin(ctx: CanvasRenderingContext2D, frame: number) {
  const p = PALETTE;
  const bob = frame % 2 ? -1 : 0;
  drawGroundShadow(ctx, 31, 15, 3, BASELINE_Y, 0.35);
  drawProfileLegs(ctx, frame, 25, 34, p.goblinDark, p.goblinSkin, 5);
  drawRect(ctx, 24, 40 + bob, 15, 7, p.goblinLeather);
  drawOutlineRect(ctx, 25, 28 + bob, 15, 14, p.goblinSkin, p.goblinDark);
  drawRect(ctx, 27, 30 + bob, 10, 10, p.goblinLight);
  // Side profile head, nose and one yellow eye point right.
  drawOutlineRect(ctx, 30, 16 + bob, 15, 14, p.goblinSkin, p.goblinDark);
  drawRect(ctx, 32, 18 + bob, 10, 10, p.goblinLight);
  drawRect(ctx, 43, 23 + bob, 5, 4, p.goblinNose);
  drawPixel(ctx, 48, 24 + bob, p.goblinNose);
  drawRect(ctx, 39, 21 + bob, 3, 3, "#facc15");
  drawPixel(ctx, 40, 22 + bob, "#000000");
  // Long ear trails behind the head.
  drawRect(ctx, 25, 19 + bob, 6, 4, p.goblinSkin);
  drawPixel(ctx, 23, 20 + bob, p.goblinLight);
  drawRect(ctx, 36, 28 + bob, 5, 6, p.goblinSkin);
  // Dagger always leads the run to the right.
  const daggerY = frame < 2 ? 31 + bob : 34 + bob;
  drawRect(ctx, 41, daggerY + 3, 5, 2, p.woodMid);
  drawRect(ctx, 45, daggerY + 2, 2, 4, p.ironMid);
  drawRect(ctx, 47, daggerY, 8, 3, p.ironLight);
  drawPixel(ctx, 55, daggerY + 1, p.white);
}

function drawRightSkeleton(ctx: CanvasRenderingContext2D, frame: number) {
  const p = PALETTE;
  const bob = frame % 2 ? -1 : 0;
  drawGroundShadow(ctx, 31, 15, 3, BASELINE_Y, 0.33);
  drawProfileLegs(ctx, frame, 26, 35, p.boneDark, p.boneLight, 3);
  drawRect(ctx, 28, 40 + bob, 10, 3, p.boneMid);
  drawRect(ctx, 31, 27 + bob, 3, 14, p.boneMid);
  drawRect(ctx, 25, 30 + bob, 11, 2, p.boneLight);
  drawRect(ctx, 27, 34 + bob, 11, 2, p.boneLight);
  drawRect(ctx, 28, 38 + bob, 9, 2, p.boneMid);
  // Skull is a profile with a single eye socket looking right.
  drawOutlineRect(ctx, 30, 14 + bob, 15, 14, p.boneMid, p.boneDark);
  drawRect(ctx, 32, 16 + bob, 10, 9, p.boneLight);
  drawRect(ctx, 40, 20 + bob, 4, 3, p.boneDark);
  drawRect(ctx, 38, 19 + bob, 3, 3, p.boneEye);
  drawPixel(ctx, 39, 19 + bob, p.boneEyeGlow);
  drawRect(ctx, 38, 25 + bob, 6, 2, p.boneMid);
  // Shield trails behind, sword leads toward the target.
  drawOutlineRect(ctx, 16, 28 + bob, 9, 14, p.woodMid, p.ironDark);
  drawRect(ctx, 18, 30 + bob, 5, 10, p.woodBrown);
  const swordY = frame < 2 ? 19 : 22;
  drawRect(ctx, 43, swordY, 2, 18, p.ironLight);
  drawPixel(ctx, 44, swordY - 1, p.white);
  drawRect(ctx, 40, swordY + 16, 7, 2, p.ironMid);
}

function drawRightSpider(ctx: CanvasRenderingContext2D, frame: number) {
  const p = PALETTE;
  const alternate = frame < 2 ? 1 : -1;
  drawGroundShadow(ctx, 31, 21, 4, BASELINE_Y, 0.4);
  // Three clearly separated leg pairs alternate along the x-axis.
  for (let i = 0; i < 3; i++) {
    const offset = i * 5;
    const lift = (i % 2 === 0 ? alternate : -alternate) * 2;
    drawRect(ctx, 20 + offset, 41, 3, 7, p.spiderCarapaceDark);
    drawRect(ctx, 15 + offset + lift, 47, 3, 7, p.spiderCarapaceLight);
    drawRect(ctx, 13 + offset + lift, 54, 6, 2, p.spiderCarapaceLight);
    drawRect(ctx, 39 - offset, 41, 3, 7, p.spiderCarapaceDark);
    drawRect(ctx, 44 - offset - lift, 47, 3, 7, p.spiderCarapaceLight);
    drawRect(ctx, 43 - offset - lift, 54, 6, 2, p.spiderCarapaceLight);
  }
  drawOutlineRect(ctx, 18, 27, 21, 17, p.spiderCarapace, p.spiderCarapaceDark);
  drawRect(ctx, 20, 29, 16, 13, p.spiderBelly);
  drawRect(ctx, 27, 31, 4, 8, p.toxicGreen);
  drawPixel(ctx, 28, 33, "#86efac");
  // Head and clustered eyes are at the right front.
  drawOutlineRect(
    ctx,
    37,
    34,
    12,
    10,
    p.spiderCarapaceLight,
    p.spiderCarapaceDark,
  );
  drawRect(ctx, 43, 36, 2, 2, p.spiderEye);
  drawPixel(ctx, 43, 36, p.spiderEyeGlow);
  drawRect(ctx, 46, 38, 2, 2, p.spiderEye);
  drawPixel(ctx, 46, 38, p.spiderEyeGlow);
  drawRect(ctx, 47, 43, 2, 5, p.boneLight);
  drawPixel(ctx, 47, 49, p.toxicGreen);
}

function drawRightOrc(ctx: CanvasRenderingContext2D, frame: number) {
  const p = PALETTE;
  const bob = frame % 2 ? -1 : 0;
  drawGroundShadow(ctx, 31, 18, 4, BASELINE_Y, 0.42);
  drawProfileLegs(ctx, frame, 23, 34, p.orcArmor, p.ironMid, 7);
  drawRect(ctx, 22, 40 + bob, 20, 5, p.orcArmor);
  drawOutlineRect(ctx, 22, 25 + bob, 21, 17, p.orcSkin, p.orcSkinDark);
  drawRect(ctx, 25, 27 + bob, 15, 12, p.orcSkinLight);
  drawRect(ctx, 27, 31 + bob, 5, 3, p.orcBloodStripe);
  // Mohawk and profile face point right.
  drawRect(ctx, 28, 10 + bob, 7, 7, p.orcHair);
  drawOutlineRect(ctx, 30, 14 + bob, 16, 14, p.orcSkin, p.orcSkinDark);
  drawRect(ctx, 33, 16 + bob, 10, 10, p.orcSkinLight);
  drawRect(ctx, 43, 21 + bob, 5, 3, p.orcSkin);
  drawRect(ctx, 39, 19 + bob, 3, 2, "#dc2626");
  drawRect(ctx, 43, 24 + bob, 3, 5, p.orcTusk);
  // Spiked shoulder stays at the trailing side.
  drawRect(ctx, 17, 25 + bob, 8, 8, p.ironDark);
  drawPixel(ctx, 18, 22 + bob, p.orcSpike);
  // Morningstar leads forward to the right.
  const clubY = frame < 2 ? 20 : 23;
  drawRect(ctx, 43, clubY + 4, 3, 18, p.woodMid);
  drawRect(ctx, 40, clubY - 3, 9, 8, p.ironMid);
  drawPixel(ctx, 39, clubY, p.orcSpike);
  drawPixel(ctx, 49, clubY, p.orcSpike);
  drawPixel(ctx, 44, clubY - 5, p.orcSpike);
}

function drawRightWraith(ctx: CanvasRenderingContext2D, frame: number) {
  const p = PALETTE;
  const floatY = frame === 1 ? -3 : frame === 2 ? -4 : frame === 3 ? -2 : 0;
  drawGroundShadow(ctx, 31, 15, 3, BASELINE_Y, 0.22);
  drawRect(ctx, 25, 48 + floatY, 12, 5, p.wraithDark);
  drawRect(ctx, 28 + (frame === 0 ? -2 : 2), 52 + floatY, 5, 4, p.wraithMid);
  drawPixel(ctx, 30, BASELINE_Y - 1, p.wraithLight);
  drawOutlineRect(ctx, 20, 27 + floatY, 22, 22, p.wraithDark, p.wraithDeep);
  drawRect(ctx, 23, 29 + floatY, 16, 18, p.wraithMid);
  drawRect(ctx, 25, 34 + floatY, 2, 11, p.wraithLight);
  // Hood profile with one eye on the right side.
  drawOutlineRect(ctx, 26, 12 + floatY, 18, 17, p.wraithDark, p.wraithDeep);
  drawRect(ctx, 29, 15 + floatY, 12, 11, p.wraithMid);
  drawRect(ctx, 34, 18 + floatY, 7, 5, p.wraithDeep);
  drawRect(ctx, 38, 19 + floatY, 2, 2, p.wraithLight);
  drawPixel(ctx, 38, 19 + floatY, p.wraithEye);
  // Lantern moves in front of the runner.
  const lanternX = frame === 0 ? 46 : frame === 2 ? 50 : 48;
  drawPixel(ctx, lanternX - 1, 28 + floatY, p.ironLight);
  drawRect(ctx, lanternX - 3, 31 + floatY, 8, 9, p.lanternGold);
  drawRect(ctx, lanternX - 1, 33 + floatY, 4, 5, p.soulFire);
  drawPixel(ctx, lanternX, 35 + floatY, p.soulFireLight);
}

function drawRightKnight(ctx: CanvasRenderingContext2D, frame: number) {
  const p = PALETTE;
  const bob = frame % 2 ? -1 : 0;
  drawGroundShadow(ctx, 31, 18, 4, BASELINE_Y, 0.44);
  drawProfileLegs(
    ctx,
    frame,
    23,
    34,
    p.knightPlatesDark,
    p.knightPlatesLight,
    7,
  );
  drawOutlineRect(
    ctx,
    23,
    25 + bob,
    20,
    19,
    p.knightPlatesMid,
    p.knightPlatesDark,
  );
  drawRect(ctx, 26, 27 + bob, 14, 14, p.knightPlatesLight);
  drawRect(ctx, 27, 29 + bob, 3, 9, p.knightPlatesShine);
  drawRect(ctx, 29, 39 + bob, 9, 2, p.knightGold);
  // Profiled greathelm with a single right-facing visor slit.
  drawRect(ctx, 31, 8 + bob, 5, 5, p.knightGold);
  drawOutlineRect(
    ctx,
    29,
    12 + bob,
    16,
    15,
    p.knightPlatesMid,
    p.knightPlatesDark,
  );
  drawRect(ctx, 32, 14 + bob, 10, 10, p.knightPlatesLight);
  drawRect(ctx, 38, 19 + bob, 6, 2, "#090a0f");
  drawPixel(ctx, 40, 19 + bob, p.visorGlow);
  // Shield at the rear, mace points to the right.
  drawOutlineRect(ctx, 13, 22 + bob, 11, 22, p.shieldRed, p.knightPlatesDark);
  drawRect(ctx, 16, 24 + bob, 5, 18, p.shieldRedDark);
  drawRect(ctx, 17, 28 + bob, 3, 10, p.knightGold);
  const maceY = frame < 2 ? 18 : 22;
  drawRect(ctx, 44, maceY + 4, 3, 18, p.knightPlatesMid);
  drawRect(ctx, 42, maceY - 3, 8, 8, p.knightPlatesDark);
  drawRect(ctx, 44, maceY - 2, 5, 5, p.knightPlatesLight);
  drawPixel(ctx, 50, maceY + 1, p.knightPlatesShine);
}

function drawRightMagmaBrute(ctx: CanvasRenderingContext2D, frame: number) {
  const p = PALETTE;
  const bob = frame % 2 ? -1 : 0;
  drawGroundShadow(ctx, 31, 19, 4, BASELINE_Y, 0.5);
  drawProfileLegs(ctx, frame, 22, 35, p.obsidianDark, p.obsidianMid, 8);
  if (frame === 0 || frame === 2)
    drawRect(ctx, frame === 0 ? 19 : 33, BASELINE_Y, 14, 1, p.lavaHot);
  drawOutlineRect(ctx, 19, 22 + bob, 26, 21, p.obsidianMid, p.obsidianDark);
  drawRect(ctx, 22, 24 + bob, 20, 17, p.obsidianDark);
  drawRect(ctx, 29, 27 + bob, 3, 10, p.lavaBright);
  drawRect(ctx, 36, 31 + bob, 3, 7, p.lavaMid);
  drawRect(ctx, 31, 30 + bob, 4, 5, p.lavaHot);
  drawPixel(ctx, 32, 31 + bob, p.lavaWhite);
  // Rock head profile and bright eye slit look to the right.
  drawRect(ctx, 26, 8 + bob, 3, 7, p.lavaDeep);
  drawPixel(ctx, 26, 6 + bob, p.lavaBright);
  drawOutlineRect(ctx, 29, 11 + bob, 16, 14, p.obsidianMid, p.obsidianDark);
  drawRect(ctx, 32, 13 + bob, 10, 10, p.obsidianDark);
  drawRect(ctx, 38, 17 + bob, 5, 2, p.lavaHot);
  drawPixel(ctx, 41, 17 + bob, p.lavaWhite);
  // Heavy forward fist.
  drawRect(ctx, 43, 30 + bob, 9, 9, p.obsidianMid);
  drawRect(ctx, 46, 32 + bob, 3, 3, p.lavaBright);
  drawPixel(ctx, 19, 19 - frame * 2, p.lavaBright);
}

function drawRightNecromancer(ctx: CanvasRenderingContext2D, frame: number) {
  const p = PALETTE;
  const bob = frame % 2 ? -1 : 0;
  drawGroundShadow(ctx, 31, 15, 3, BASELINE_Y, 0.35);
  const footX = frame < 2 ? 25 : 34;
  drawRect(ctx, footX, 52, 6, 4, p.necroRobeDark);
  drawRect(ctx, footX + 1, 55, 6, 1, p.skullMask);
  drawOutlineRect(ctx, 21, 25 + bob, 20, 29, p.necroRobeDark, "#090a0f");
  drawRect(ctx, 24, 27 + bob, 14, 25, p.necroRobeMid);
  drawRect(ctx, 32, 28 + bob, 3, 22, p.necroGold);
  drawPixel(ctx, 33, 35 + bob, p.necroGoldLight);
  drawPixel(ctx, 33, 43 + bob, p.necroGoldLight);
  // Side hood and raven beak toward the right.
  drawOutlineRect(ctx, 27, 10 + bob, 17, 16, p.necroRobeDark, "#090a0f");
  drawRect(ctx, 30, 12 + bob, 11, 11, p.necroRobeMid);
  drawRect(ctx, 34, 16 + bob, 8, 7, p.skullMask);
  drawRect(ctx, 40, 21 + bob, 5, 3, p.skullMask);
  drawRect(ctx, 38, 18 + bob, 2, 2, p.voidGlow);
  drawPixel(ctx, 38, 18 + bob, p.voidCore);
  // Staff and hovering orb lead in the right-facing direction.
  const staffX = 49;
  drawRect(ctx, staffX, 22, 2, 31, p.woodBrown);
  drawOutlineRect(
    ctx,
    staffX - 4,
    10 + (frame % 2),
    10,
    10,
    p.voidDark,
    p.voidGlow,
  );
  drawRect(ctx, staffX - 2, 12 + (frame % 2), 6, 6, p.voidGlow);
  drawPixel(ctx, staffX, 14 + (frame % 2), p.voidCore);
}

function drawRightBoneColossus(ctx: CanvasRenderingContext2D, frame: number) {
  const p = PALETTE;
  const bob = frame % 2 ? -1 : 0;
  drawGroundShadow(ctx, 31, 25, 6, BASELINE_Y, 0.55);
  drawProfileLegs(ctx, frame, 18, 35, p.bossBoneDark, p.bossBoneLight, 10);
  if (frame === 0 || frame === 2)
    drawRect(
      ctx,
      frame === 0 ? 13 : 31,
      BASELINE_Y,
      19,
      1,
      p.bossNecroFlameBright,
    );
  // Cape flows back on the left, away from the movement direction.
  const capeWave = frame === 0 ? -2 : frame === 2 ? 2 : 0;
  drawRect(ctx, 8 + capeWave, 20 + bob, 12, 33, p.bossCapeDark);
  drawRect(ctx, 12 + capeWave, 23 + bob, 7, 28, p.bossCapeRed);
  drawOutlineRect(ctx, 19, 21 + bob, 26, 22, p.bossBoneMid, p.bossBoneDark);
  drawRect(ctx, 22, 23 + bob, 20, 17, p.bossBladeDark);
  drawRect(ctx, 21, 27 + bob, 20, 2, p.bossBoneLight);
  drawRect(ctx, 21, 33 + bob, 20, 2, p.bossBoneMid);
  // Glowing soul heart.
  drawRect(ctx, 32, 28 + bob, 6, 7, p.bossNecroFlameDark);
  drawRect(ctx, 33, 29 + bob, 4, 5, p.bossNecroFlameMid);
  drawPixel(
    ctx,
    35,
    30 + bob,
    frame % 2 ? p.bossSoulGlow : p.bossNecroFlameBright,
  );
  // Oversized crowned skull, right-facing with one burning eye.
  drawRect(ctx, 27, 2 + bob, 17, 4, p.bossCrownGold);
  drawPixel(ctx, 30, 0 + bob, p.bossCrownGlow);
  drawPixel(ctx, 35, -1 + bob, p.bossCrownGlow);
  drawPixel(ctx, 40, 0 + bob, p.bossCrownGlow);
  drawPixel(ctx, 36, 3 + bob, p.bossRuby);
  drawRect(ctx, 22, 8 + bob, 6, 6, p.bossBoneMid);
  drawPixel(ctx, 20, 7 + bob, p.bossBoneLight);
  drawOutlineRect(ctx, 28, 6 + bob, 19, 17, p.bossBoneMid, p.bossBoneDark);
  drawRect(ctx, 31, 8 + bob, 13, 12, p.bossBoneLight);
  drawRect(ctx, 41, 13 + bob, 4, 3, p.bossNecroFlameBright);
  drawPixel(ctx, 42, 14 + bob, p.bossSoulGlow);
  drawRect(ctx, 42, 19 + bob, 5, 2, p.bossBoneDark);
  // Pauldron spikes and a huge blade pull the silhouette to the right.
  drawOutlineRect(ctx, 12, 16 + bob, 11, 11, p.bossBoneMid, p.bossBoneDark);
  drawPixel(ctx, 13, 12 + bob, p.bossBoneLight);
  drawOutlineRect(ctx, 43, 16 + bob, 10, 11, p.bossBoneMid, p.bossBoneDark);
  drawPixel(ctx, 50, 12 + bob, p.bossBoneLight);
  const bladeY = frame < 2 ? 10 : 14;
  drawRect(ctx, 54, bladeY - 8, 4, 34, p.bossBladeDark);
  drawRect(ctx, 55, bladeY - 6, 2, 30, p.bossBladeSteel);
  drawPixel(ctx, 54, bladeY - 9, p.bossSoulGlow);
  drawPixel(ctx, 53, bladeY + 3, p.bossNecroFlameBright);
  drawPixel(ctx, 53, bladeY + 11, p.bossNecroFlameBright);
  drawRect(ctx, 51, bladeY + 25, 10, 3, p.bossCrownGold);
}

/**
 * Master dispatcher for drawing any of the 10 right-facing mobs at 64x64.
 */
export function drawMobFrame(
  ctx: CanvasRenderingContext2D,
  mobId: number,
  frame: number,
  options: {
    clear?: boolean;
    showBaseline?: boolean;
    showHitbox?: boolean;
    hitbox?: { x: number; y: number; width: number; height: number };
    direction?: SpriteDirection;
  } = {},
) {
  const {
    clear = true,
    showBaseline = false,
    showHitbox = false,
    hitbox,
    direction,
  } = options;
  const normFrame = ((frame % 4) + 4) % 4;
  const effectiveDir: SpriteDirection =
    direction ?? (mobId <= 10 ? currentTier1Direction : "side");

  if (clear) {
    ctx.clearRect(0, 0, 64, 64);
  }

  // All source frames have a right-facing side profile. Consumers can still
  // use CSS/canvas scaleX(-1) when a lane needs the opposite direction.
  if (mobId >= 31 && mobId <= 40) {
    drawTier4(ctx, mobId, normFrame, effectiveDir);
  } else if (mobId >= 21 && mobId <= 30) {
    drawTier3(ctx, mobId, normFrame, effectiveDir);
  } else if (mobId >= 11 && mobId <= 20) {
    drawTier2Direction(ctx, mobId, normFrame, effectiveDir);
  } else {
    switch (mobId) {
      case 1:
        if (effectiveDir === "back") {
          drawTier1Back(ctx, mobId, normFrame);
          break;
        }
        if (effectiveDir === "front") {
          drawTier1Front(ctx, mobId, normFrame);
          break;
        }
        drawRightSlime(ctx, normFrame);
        break;
      case 2:
        if (effectiveDir === "back") {
          drawTier1Back(ctx, mobId, normFrame);
          break;
        }
        if (effectiveDir === "front") {
          drawTier1Front(ctx, mobId, normFrame);
          break;
        }
        drawRightGoblin(ctx, normFrame);
        break;
      case 3:
        if (effectiveDir === "back") {
          drawTier1Back(ctx, mobId, normFrame);
          break;
        }
        if (effectiveDir === "front") {
          drawTier1Front(ctx, mobId, normFrame);
          break;
        }
        drawRightSkeleton(ctx, normFrame);
        break;
      case 4:
        if (effectiveDir === "back") {
          drawTier1Back(ctx, mobId, normFrame);
          break;
        }
        if (effectiveDir === "front") {
          drawTier1Front(ctx, mobId, normFrame);
          break;
        }
        drawRightSpider(ctx, normFrame);
        break;
      case 5:
        if (effectiveDir === "back") {
          drawTier1Back(ctx, mobId, normFrame);
          break;
        }
        if (effectiveDir === "front") {
          drawTier1Front(ctx, mobId, normFrame);
          break;
        }
        drawRightOrc(ctx, normFrame);
        break;
      case 6:
        if (effectiveDir === "back") {
          drawTier1Back(ctx, mobId, normFrame);
          break;
        }
        if (effectiveDir === "front") {
          drawTier1Front(ctx, mobId, normFrame);
          break;
        }
        drawRightWraith(ctx, normFrame);
        break;
      case 7:
        if (effectiveDir === "back") {
          drawTier1Back(ctx, mobId, normFrame);
          break;
        }
        if (effectiveDir === "front") {
          drawTier1Front(ctx, mobId, normFrame);
          break;
        }
        drawRightKnight(ctx, normFrame);
        break;
      case 8:
        if (effectiveDir === "back") {
          drawTier1Back(ctx, mobId, normFrame);
          break;
        }
        if (effectiveDir === "front") {
          drawTier1Front(ctx, mobId, normFrame);
          break;
        }
        drawRightMagmaBrute(ctx, normFrame);
        break;
      case 9:
        if (effectiveDir === "back") {
          drawTier1Back(ctx, mobId, normFrame);
          break;
        }
        if (effectiveDir === "front") {
          drawTier1Front(ctx, mobId, normFrame);
          break;
        }
        drawRightNecromancer(ctx, normFrame);
        break;
      case 10:
        if (effectiveDir === "back") {
          drawTier1Back(ctx, mobId, normFrame);
          break;
        }
        if (effectiveDir === "front") {
          drawTier1Front(ctx, mobId, normFrame);
          break;
        }
        drawRightBoneColossus(ctx, normFrame);
        break;
      default:
        drawRightSlime(ctx, normFrame);
    }
  }

  // Visual aids for game devs
  if (showBaseline) {
    ctx.save();
    ctx.strokeStyle = "rgba(239, 68, 68, 0.8)";
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(0, BASELINE_Y + 0.5);
    ctx.lineTo(64, BASELINE_Y + 0.5);
    ctx.stroke();
    ctx.restore();
  }

  if (showHitbox && hitbox) {
    ctx.save();
    ctx.strokeStyle = "rgba(59, 130, 246, 0.8)";
    ctx.lineWidth = 1;
    ctx.strokeRect(hitbox.x + 0.5, hitbox.y + 0.5, hitbox.width, hitbox.height);
    ctx.restore();
  }
}
